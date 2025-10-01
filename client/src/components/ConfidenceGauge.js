import React from 'react';

const ConfidenceGauge = ({ confidence, level, size = 'small' }) => {
  const getConfidenceValue = () => {
    if (typeof confidence === 'string' && confidence.includes('%')) {
      return parseFloat(confidence);
    } else if (typeof confidence === 'number') {
      // Convert decimal to percentage for display
      return confidence * 100;
    } else if (typeof confidence === 'string') {
      // Handle decimal string
      const decimal = parseFloat(confidence);
      return decimal <= 1 ? decimal * 100 : decimal;
    }
    return 0;
  };

  const confidenceValue = getConfidenceValue();
  
  const getColorClasses = () => {
    if (level === 'high') {
      return {
        bg: 'bg-success-100 dark:bg-success-900',
        fill: 'text-success-500',
        text: 'text-success-700 dark:text-success-300'
      };
    } else {
      return {
        bg: 'bg-danger-100 dark:bg-danger-900',
        fill: 'text-danger-500',
        text: 'text-danger-700 dark:text-danger-300'
      };
    }
  };

  const colors = getColorClasses();
  const circumference = 2 * Math.PI * 16; // radius of 16
  const strokeDasharray = `${(confidenceValue / 100) * circumference} ${circumference}`;

  if (size === 'large') {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="relative">
          <svg width="80" height="80" className="transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="32"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-slate-200 dark:text-slate-700"
            />
            <circle
              cx="40"
              cy="40"
              r="32"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(confidenceValue / 100) * (2 * Math.PI * 32)} ${2 * Math.PI * 32}`}
              strokeLinecap="round"
              className={colors.fill}
              style={{
                transition: 'stroke-dasharray 0.5s ease-in-out',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${colors.text}`}>
              {confidenceValue.toFixed(0)}%
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className={`text-sm font-medium ${colors.text}`}>
            Confidence
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
            {level} accuracy
          </div>
        </div>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className={`inline-flex items-center space-x-3 px-4 py-2 rounded-lg ${colors.bg}`}>
        <div className="relative">
          <svg width="40" height="40" className="transform -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-slate-200 dark:text-slate-700"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${(confidenceValue / 100) * (2 * Math.PI * 16)} ${2 * Math.PI * 16}`}
              strokeLinecap="round"
              className={colors.fill}
              style={{
                transition: 'stroke-dasharray 0.5s ease-in-out',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold ${colors.text}`}>
              {confidenceValue.toFixed(0)}%
            </span>
          </div>
        </div>
        <div>
          <div className={`text-sm font-medium ${colors.text}`}>
            Confidence
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
            {level} accuracy
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${colors.bg}`}>
      <div className="relative">
        <svg width="24" height="24" className="transform -rotate-90">
          <circle
            cx="12"
            cy="12"
            r="8"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-slate-300 dark:text-slate-600"
          />
          <circle
            cx="12"
            cy="12"
            r="8"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className={colors.fill}
            style={{
              transition: 'stroke-dasharray 0.5s ease-in-out',
            }}
          />
        </svg>
      </div>
      <span className={colors.text}>
        {confidence}
      </span>
    </div>
  );
};

export default ConfidenceGauge;