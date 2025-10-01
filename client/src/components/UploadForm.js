import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const UploadForm = ({ onFilesSelected, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const validateFiles = useCallback((files) => {
    const validFiles = [];
    const invalidFiles = [];

    Array.from(files).forEach(file => {
      if (file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) {
        if (file.size <= 10 * 1024 * 1024) { // 10MB limit
          validFiles.push(file);
        } else {
          invalidFiles.push({ name: file.name, reason: 'File too large (max 10MB)' });
        }
      } else {
        invalidFiles.push({ name: file.name, reason: 'Invalid format (JPG/JPEG only)' });
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(`${invalidFiles.length} file(s) rejected. Check console for details.`);
      console.warn('Rejected files:', invalidFiles);
    }

    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} file(s) ready for processing`);
    }

    return validFiles;
  }, []);

  const handleFiles = useCallback((files) => {
    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      setUploadedFiles(validFiles);
      onFilesSelected(validFiles);
    }
  }, [validateFiles, onFilesSelected]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer group ${
          dragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 dark:border-primary-400'
            : isProcessing
            ? 'border-slate-300 bg-slate-50 dark:bg-slate-800 dark:border-slate-600 cursor-not-allowed'
            : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!isProcessing ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,image/jpeg"
          onChange={handleFileInput}
          className="hidden"
          disabled={isProcessing}
        />

        <div className="text-center">
          {isProcessing ? (
            <>
              <div className="animate-spin mx-auto mb-4 w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full"></div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Processing Documents...
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                AI is analyzing your documents. This may take a few moments.
              </p>
            </>
          ) : (
            <>
              <div className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                dragActive 
                  ? 'bg-primary-100 dark:bg-primary-900' 
                  : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-primary-100 dark:group-hover:bg-primary-900'
              }`}>
                <Upload className={`w-8 h-8 transition-colors ${
                  dragActive 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-slate-500 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                }`} />
              </div>
              
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {dragActive ? 'Drop your files here' : 'Upload Documents'}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Drag and drop your files here, or{' '}
                <span className="text-primary-600 dark:text-primary-400 font-medium">browse</span> to select
              </p>

              {/* File Requirements */}
              <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>JPG, JPEG</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Max 10MB</span>
                </div>
                <div className="flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>Multiple files</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && !isProcessing && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
            Ready for Processing ({uploadedFiles.length} files)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-white dark:bg-slate-700 rounded-lg">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadForm;