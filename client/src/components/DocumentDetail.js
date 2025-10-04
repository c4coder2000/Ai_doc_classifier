import React from 'react';
import {
  XMarkIcon,
  DocumentTextIcon,
  CalendarIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const DocumentDetail = ({ document, isOpen, onClose }) => {
  if (!isOpen || !document) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getClassificationColor = (classification) => {
    const colors = {
      'invoice': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      'receipt': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      'contract': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
      'resume': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
      'report': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
      'other': 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
    };
    return colors[classification.toLowerCase()] || colors['other'];
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <DocumentTextIcon className="h-6 w-6 text-slate-500 dark:text-slate-400" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white truncate">
              {document.filename}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Metadata Section */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5" />
                Document Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <TagIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Classification:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getClassificationColor(document.label)}`}
                  >
                    {document.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ChartBarIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Confidence:</span>
                  <span className={`font-medium ${getConfidenceColor(document.confidence)}`}>
                    {(document.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Created:</span>
                  <span className="text-sm text-slate-900 dark:text-white">
                    {formatDate(document.created_at)}
                  </span>
                </div>

                {document.updated_at && document.updated_at !== document.created_at && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Updated:</span>
                    <span className="text-sm text-slate-900 dark:text-white">
                      {formatDate(document.updated_at)}
                    </span>
                  </div>
                )}
              </div>

              {document.disagreement && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Classification Override
                    </span>
                  </div>
                  {document.override_reason && (
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Reason: {document.override_reason}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Summary Section */}
            {document.summary && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <ClipboardDocumentListIcon className="h-5 w-5" />
                  Document Summary
                </h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {document.summary}
                  </p>
                </div>
              </div>
            )}

            {/* Extracted Text Section */}
            {document.raw_text && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <EyeIcon className="h-5 w-5" />
                  Extracted Text
                </h3>
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono">
                    {document.raw_text}
                  </pre>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Document ID: {document.id}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;