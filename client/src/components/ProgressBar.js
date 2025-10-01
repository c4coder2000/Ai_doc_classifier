import React from 'react';

const ProgressBar = ({ progress, status, fileName }) => {
  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-3">
        <div
          className="bg-primary-500 h-3 rounded-full transition-all duration-300 ease-out flex items-center justify-end pr-2"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        >
          {progress > 10 && (
            <span className="text-xs font-medium text-white">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      </div>
      
      {/* Progress Info */}
      <div className="space-y-2">
        {fileName && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600 dark:text-slate-400 truncate max-w-[70%]">
              Processing: {fileName}
            </span>
            <span className="text-slate-500 dark:text-slate-500 font-medium ml-2 flex-shrink-0">
              {Math.round(progress)}%
            </span>
          </div>
        )}
        {status && (
          <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded border-l-2 border-primary-400">
            {status}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;