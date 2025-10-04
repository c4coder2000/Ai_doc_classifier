import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './Header';
import UploadForm from './UploadForm';
import EnhancedResultCard from './EnhancedResultCard';
import PDFExportButton from './PDFExportButton';
import ProgressBar from './ProgressBar';
import { Brain, Zap, Shield, Target } from 'lucide-react';
import { classifyDocument } from '../services/api';

const DocumentClassifier = () => {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('');

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleFilesSelected = async (selectedFiles) => {
    setFiles(selectedFiles);
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStatus('Initializing classification engine...');
    const newResults = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setCurrentFile(file.name);
      setProcessingStatus(`Analyzing document ${i + 1} of ${selectedFiles.length}...`);
      
      // Update progress for current file start
      const baseProgress = (i / selectedFiles.length) * 100;
      setProcessingProgress(baseProgress);

      try {
        // Simulate processing steps with progress updates
        const steps = [
          'Extracting text content...',
          'Analyzing document structure...',
          'Running AI classification...',
          'Calculating confidence scores...',
          'Finalizing results...'
        ];

        for (let step = 0; step < steps.length; step++) {
          setProcessingStatus(steps[step]);
          const stepProgress = baseProgress + ((step + 1) / steps.length) * (100 / selectedFiles.length);
          setProcessingProgress(stepProgress);
          
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        const result = await classifyDocument(file);
        newResults.push(result);
        
      } catch (error) {
        console.error('Error classifying document:', error);
        newResults.push({
          error: 'Failed to classify document',
          filename: file.name
        });
      }
    }

    setResults(newResults);
    setIsProcessing(false);
    setProcessingProgress(100);
    setCurrentFile(null);
    setProcessingStatus('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'dark:bg-slate-800 dark:text-white',
        }}
      />
      
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full">
              <Brain className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Slate Intelligence
            </h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Advanced AI-powered document classification system that automatically categorizes 
            your documents with precision and speed.
          </p>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Lightning Fast</span>
            </div>
            <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Secure Processing</span>
            </div>
            <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">High Accuracy</span>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section>
          <UploadForm onFilesSelected={handleFilesSelected} disabled={isProcessing} />
        </section>

        {/* Progress Section */}
        {isProcessing && (
          <section className="space-y-4">
            <ProgressBar 
              progress={processingProgress} 
              status={processingStatus}
              currentFile={currentFile}
            />
          </section>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Classification Results ({results.length})
              </h2>
              <PDFExportButton results={results} files={files} />
            </div>
            
            <div className="grid gap-6">
              {results.map((result, index) => (
                <div key={index} className="animate-fade-in">
                  <EnhancedResultCard 
                    result={result} 
                    file={files[index]} 
                    index={index}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {results.length === 0 && files.length === 0 && !isProcessing && (
          <section className="text-center py-16">
            <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-2xl inline-block mb-6">
              <Brain className="h-16 w-16 text-slate-400 dark:text-slate-500 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Ready for Document Analysis
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Upload your documents to get started with AI-powered classification. 
              Supports invoices, receipts, contracts, and more.
            </p>
          </section>
        )}
      </main>
    </div>
  );
};

export default DocumentClassifier;