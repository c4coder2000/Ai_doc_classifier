import React, { useState } from 'react';
import { exportToPDF, exportSingleResultToPDF } from '../utils/pdfExport';

const PDFExportButton = ({ results, files, single = false, result = null, file = null }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (single && result && file) {
        await exportSingleResultToPDF(result, file);
      } else if (results && files) {
        await exportToPDF(results, files);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const buttonText = single 
    ? (isExporting ? 'Exporting...' : 'Export as PDF')
    : (isExporting ? 'Exporting All...' : `Export All ${results?.length || 0} Results as PDF`);

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || (single ? (!result || !file) : (!results?.length || !files?.length))}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
        ${
          single 
            ? 'text-sm bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md'
            : 'text-base bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl px-6 py-3'
        }
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm
        dark:bg-primary-600 dark:hover:bg-primary-700
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900
      `}
    >
      <span className="text-lg">📄</span>
      <span className="whitespace-nowrap">{buttonText}</span>
      {isExporting && (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-1"></div>
      )}
    </button>
  );
};

export default PDFExportButton;