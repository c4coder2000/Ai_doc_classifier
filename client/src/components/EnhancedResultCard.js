import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Eye, ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import PDFExportButton from './PDFExportButton';
import ConfidenceGauge from './ConfidenceGauge';
import JSONViewer from './JSONViewer';

const ResultCard = ({ result, file, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showJSON, setShowJSON] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(null);

  const getConfidenceLevel = (confidence) => {
    let value;
    
    if (typeof confidence === 'string' && confidence.includes('%')) {
      // Handle percentage string (e.g., "75%")
      value = parseFloat(confidence) / 100;
    } else if (typeof confidence === 'number') {
      // Handle decimal number (e.g., 0.75)
      value = confidence;
    } else if (typeof confidence === 'string') {
      // Handle decimal string (e.g., "0.75")
      value = parseFloat(confidence);
    } else {
      return 'unknown';
    }
    
    if (value >= 0.6) return 'high';  // Green for confidence >= 0.6
    return 'low';  // Red for confidence < 0.6
  };

  const getStatusConfig = (label, confidence) => {
    if (label === 'Error') {
      return {
        icon: XCircle,
        color: 'text-danger-500',
        bgColor: 'bg-danger-50 dark:bg-danger-950',
        borderColor: 'border-danger-200 dark:border-danger-800'
      };
    }

    const level = getConfidenceLevel(confidence);
    if (level === 'high') {
      // Green for confidence >= 0.6
      return {
        icon: CheckCircle,
        color: 'text-success-500',
        bgColor: 'bg-success-50 dark:bg-success-950',
        borderColor: 'border-success-200 dark:border-success-800'
      };
    } else {
      // Red for confidence < 0.6
      return {
        icon: AlertTriangle,
        color: 'text-danger-500',
        bgColor: 'bg-danger-50 dark:bg-danger-950',
        borderColor: 'border-danger-200 dark:border-danger-800'
      };
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard`);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleFeedback = (isCorrect) => {
    setFeedbackGiven(isCorrect);
    toast.success(isCorrect ? 'Thank you for the positive feedback!' : 'Thanks for the feedback. We\'ll improve our model.');
  };

  const statusConfig = getStatusConfig(result.label, result.confidence);
  const StatusIcon = statusConfig.icon;
  const confidenceLevel = getConfidenceLevel(result.confidence);

  return (
    <div className={`card-hover transition-all duration-300 ${statusConfig.bgColor} border-l-4 ${statusConfig.borderColor}`}>
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-6 flex-1">
            
            {/* Document Preview */}
            {file && (
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0 shadow-sm">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Document preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Document Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                  Document {index + 1}
                </h3>
                <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 truncate mb-4">
                {result.fileName}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 ml-4">
            <PDFExportButton single result={result} file={file} />
            <button
              onClick={() => setShowJSON(!showJSON)}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
              title="View raw JSON"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Classification Results - Separated for better spacing */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <div className="badge-primary text-sm px-4 py-2">
            {result.label}
          </div>
          <ConfidenceGauge confidence={result.confidence} level={confidenceLevel} size="medium" />
        </div>
      </div>

      {/* Summary Section */}
      {result.summary && result.summary !== 'Failed to classify' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              📋 Summary
            </h4>
            <button
              onClick={() => copyToClipboard(result.summary, 'Summary')}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
              title="Copy summary"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
          </div>
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border-l-4 border-primary-500 shadow-sm">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">
              {result.summary}
            </p>
          </div>
        </div>
      )}

      {/* Extracted Text Section */}
      {result.text && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              📄 Extracted Text
            </h4>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => copyToClipboard(result.text, 'Extracted text')}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                title="Copy extracted text"
              >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-primary-100 text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300 dark:border-primary-700 dark:hover:bg-primary-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span>Collapse</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>Expand</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className={`bg-slate-50 dark:bg-slate-800 rounded-lg border transition-all duration-300 ${
            isExpanded ? 'max-h-96 overflow-y-auto scrollbar-thin' : 'max-h-32 overflow-hidden'
          }`}>
            <pre className="p-4 text-sm text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
              {result.text}
            </pre>
            {!isExpanded && result.text.length > 200 && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 dark:from-slate-800 to-transparent"></div>
            )}
          </div>
        </div>
      )}

      {/* JSON Viewer */}
      {showJSON && (
        <div className="mb-8">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border">
            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              📄 Raw JSON Data
            </h4>
            <JSONViewer data={result} />
          </div>
        </div>
      )}

      {/* Feedback Section */}
      {result.label !== 'Error' && (
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="text-base font-medium text-slate-700 dark:text-slate-300">
            Was this classification correct?
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleFeedback(true)}
              className={`p-2 rounded-lg transition-colors ${
                feedbackGiven === true
                  ? 'bg-success-100 text-success-600 dark:bg-success-900 dark:text-success-400'
                  : 'bg-slate-100 text-slate-500 hover:bg-success-100 hover:text-success-600 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-success-900 dark:hover:text-success-400'
              }`}
              title="Mark as correct"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleFeedback(false)}
              className={`p-2 rounded-lg transition-colors ${
                feedbackGiven === false
                  ? 'bg-danger-100 text-danger-600 dark:bg-danger-900 dark:text-danger-400'
                  : 'bg-slate-100 text-slate-500 hover:bg-danger-100 hover:text-danger-600 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-danger-900 dark:hover:text-danger-400'
              }`}
              title="Mark as incorrect"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard;