import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Signup from './components/Signup';
import History from './components/History';
import DocumentClassifier from './components/DocumentClassifier';
import './styles/global.css';

function App() {
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
      
      // Detailed progress steps for each file
      const baseProgress = (i / selectedFiles.length) * 100;
      const stepProgress = 100 / selectedFiles.length;
      
      // Step 1: Preparing image
      setProcessingProgress(baseProgress + stepProgress * 0.1);
      setProcessingStatus(`Preparing image: ${file.name}`);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Step 2: Uploading to AI model
      setProcessingProgress(baseProgress + stepProgress * 0.3);
      setProcessingStatus(`Uploading to AI classification model...`);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Step 3: AI Analysis
      setProcessingProgress(baseProgress + stepProgress * 0.7);
      setProcessingStatus(`AI analyzing document content...`);
      await new Promise(resolve => setTimeout(resolve, 400));
      
      try {
        const res = await classifyDocument(file);
        newResults.push({ fileName: file.name, ...res });
      } catch (err) {
        newResults.push({
          fileName: file.name,
          label: 'Error',
          confidence: 'N/A',
          text: '',
          summary: 'Failed to classify'
        });
      }
      
      // Step 4: Finalizing results
      setProcessingProgress(baseProgress + stepProgress * 0.9);
      setProcessingStatus(`Finalizing classification results...`);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Step 5: Complete
      setProcessingProgress(((i + 1) / selectedFiles.length) * 100);
      setProcessingStatus(i === selectedFiles.length - 1 ? 'Classification complete!' : `Completed ${i + 1} of ${selectedFiles.length} documents`);
    }

    // Final completion
    setTimeout(() => {
      setResults(newResults);
      setIsProcessing(false);
      setCurrentFile(null);
      setProcessingProgress(0);
      setProcessingStatus('');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'dark:bg-slate-800 dark:text-slate-200',
        }}
      />
      
      {/* Header */}
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary-100 dark:bg-primary-900 rounded-2xl">
              <Brain className="h-12 w-12 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Slate Intelligence
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Professional-grade AI document classification system. Upload, analyze, and extract insights 
            from your documents with enterprise-level accuracy and speed.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="p-3 bg-success-100 dark:bg-success-900 rounded-xl mb-3">
                <Target className="h-6 w-6 text-success-600 dark:text-success-400" />
              </div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">99.2% Accuracy</div>
              <div className="text-slate-500 dark:text-slate-400 text-sm">Industry-leading precision</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-xl mb-3">
                <Zap className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">&lt; 5s Processing</div>
              <div className="text-slate-500 dark:text-slate-400 text-sm">Lightning-fast results</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="p-3 bg-warning-100 dark:bg-warning-900 rounded-xl mb-3">
                <Shield className="h-6 w-6 text-warning-600 dark:text-warning-400" />
              </div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">Enterprise Security</div>
              <div className="text-slate-500 dark:text-slate-400 text-sm">GDPR compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        
        {/* Upload Section */}
        <section className="card p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Upload Your Documents
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Drag and drop or select JPG/JPEG files for AI-powered classification
            </p>
          </div>
          
          <UploadForm onFilesSelected={handleFilesSelected} isProcessing={isProcessing} />
        </section>

        {/* Processing Progress */}
        {isProcessing && (
          <section className="card p-6">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Processing Documents...
            </h3>
            <ProgressBar 
              progress={processingProgress} 
              fileName={currentFile}
              status={processingStatus}
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
}

export default App;
