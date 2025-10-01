import jsPDF from 'jspdf';

// High-quality image processing function
const processImageForPDF = (file, maxWidth = 120, maxHeight = 90) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Create a high-resolution canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate dimensions maintaining aspect ratio
      let { width, height } = img;
      const aspectRatio = width / height;
      
      // Calculate the best fit within the maximum dimensions
      if (width > maxWidth || height > maxHeight) {
        if (width / maxWidth > height / maxHeight) {
          width = maxWidth;
          height = width / aspectRatio;
        } else {
          height = maxHeight;
          width = height * aspectRatio;
        }
      }
      
      // Use high DPI scaling for crisp images
      const scale = Math.min(4, Math.max(2, 300 / Math.max(width, height))); // Dynamic scale based on size
      canvas.width = width * scale;
      canvas.height = height * scale;
      
      // Configure canvas for maximum quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.scale(scale, scale);
      
      // Set white background to handle transparency
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      
      // Apply image sharpening by drawing slightly smaller then scaling up
      ctx.drawImage(img, 0, 0, width, height);
      
      // Try PNG first for lossless quality, fall back to high-quality JPEG
      let imageData;
      try {
        // Try PNG for perfect quality (might be larger file)
        imageData = canvas.toDataURL('image/png');
        // If PNG is too large, use high-quality JPEG
        if (imageData.length > 2000000) { // If larger than ~2MB, use JPEG
          imageData = canvas.toDataURL('image/jpeg', 0.95);
        }
      } catch (e) {
        // Fallback to JPEG
        imageData = canvas.toDataURL('image/jpeg', 0.95);
      }
      
      resolve({
        data: imageData,
        width: width,
        height: height
      });
    };
    
    img.onerror = () => {
      console.warn('Failed to load image for PDF');
      resolve(null);
    };
    
    // Set crossOrigin to handle CORS issues
    img.crossOrigin = 'anonymous';
    img.src = URL.createObjectURL(file);
  });
};

export const exportToPDF = async (results, files) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let currentY = 20;

  // Add header
  pdf.setFontSize(24);
  pdf.setTextColor(0, 53, 128); // Booking.com blue
  pdf.text('Document Classification Report', 20, currentY);
  currentY += 15;

  // Add report metadata
  pdf.setFontSize(12);
  pdf.setTextColor(107, 107, 107);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, currentY);
  currentY += 8;
  pdf.text(`Total Documents: ${results.length}`, 20, currentY);
  currentY += 15;

  // Process each result
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const file = files[i];

    // Check if we need a new page (accounting for larger images)
    if (currentY > pageHeight - 120) {
      pdf.addPage();
      currentY = 20;
    }

    // Add document separator
    pdf.setDrawColor(231, 231, 231);
    pdf.line(20, currentY, pageWidth - 20, currentY);
    currentY += 10;

    // Document title
    pdf.setFontSize(16);
    pdf.setTextColor(38, 38, 38);
    pdf.text(`Document ${i + 1}: ${result.fileName}`, 20, currentY);
    currentY += 10;

    // Add image if available
    if (file) {
      try {
        const imageResult = await processImageForPDF(file, 120, 90); // Even larger for better quality
        
        if (imageResult) {
          // Add the high-quality image to PDF
          pdf.addImage(
            imageResult.data, 
            'JPEG', 
            20, 
            currentY, 
            imageResult.width, 
            imageResult.height
          );
          currentY += imageResult.height + 10; // Dynamic spacing based on image height
        }
      } catch (error) {
        console.warn('Could not add image to PDF:', error);
      }
    }

    // Classification results
    pdf.setFontSize(12);
    pdf.setTextColor(38, 38, 38);
    
    // Label with styling
    pdf.setFont(undefined, 'bold');
    pdf.text('Classification:', 20, currentY);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(0, 53, 128);
    pdf.text(result.label, 60, currentY);
    currentY += 8;

    // Confidence
    pdf.setTextColor(38, 38, 38);
    pdf.setFont(undefined, 'bold');
    pdf.text('Confidence:', 20, currentY);
    pdf.setFont(undefined, 'normal');
    
    // Color code confidence
    const confidence = result.confidence;
    if (typeof confidence === 'string' && confidence.includes('%')) {
      const value = parseFloat(confidence);
      if (value >= 80) pdf.setTextColor(0, 128, 9); // Green
      else if (value >= 60) pdf.setTextColor(255, 183, 0); // Orange
      else pdf.setTextColor(204, 0, 0); // Red
    } else {
      pdf.setTextColor(107, 107, 107);
    }
    pdf.text(confidence.toString(), 60, currentY);
    currentY += 12;

    // Summary
    if (result.summary && result.summary !== 'Failed to classify') {
      pdf.setTextColor(38, 38, 38);
      pdf.setFont(undefined, 'bold');
      pdf.text('Summary:', 20, currentY);
      currentY += 6;
      
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(107, 107, 107);
      const summaryLines = pdf.splitTextToSize(result.summary, pageWidth - 40);
      pdf.text(summaryLines, 20, currentY);
      currentY += summaryLines.length * 5 + 5;
    }

    // Extracted text (truncated for PDF)
    if (result.text) {
      pdf.setTextColor(38, 38, 38);
      pdf.setFont(undefined, 'bold');
      pdf.text('Extracted Text (Preview):', 20, currentY);
      currentY += 6;
      
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(107, 107, 107);
      const textPreview = result.text.substring(0, 300) + (result.text.length > 300 ? '...' : '');
      const textLines = pdf.splitTextToSize(textPreview, pageWidth - 40);
      pdf.text(textLines, 20, currentY);
      currentY += Math.min(textLines.length * 5, 30) + 15; // Limit text height
    }
  }

  // Add footer with branding
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.setTextColor(107, 107, 107);
    pdf.text(`Generated by DocClassifier - Page ${i} of ${totalPages}`, 20, pageHeight - 10);
    pdf.text('Powered by AI Document Classification', pageWidth - 80, pageHeight - 10);
  }

  // Save the PDF
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  pdf.save(`document-classification-report-${timestamp}.pdf`);
};

export const exportSingleResultToPDF = async (result, file) => {
  return exportToPDF([result], [file]);
};