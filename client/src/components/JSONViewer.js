import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const JSONViewer = ({ data, maxDepth = 3, currentDepth = 0 }) => {
  // const [collapsed, setCollapsed] = useState(currentDepth >= maxDepth);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      toast.success('JSON copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy JSON');
    }
  };

  const renderValue = (value, key = null, depth = 0) => {
    if (value === null) {
      return <span className="text-slate-400 dark:text-slate-500">null</span>;
    }

    if (typeof value === 'boolean') {
      return (
        <span className={value ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}>
          {value.toString()}
        </span>
      );
    }

    if (typeof value === 'number') {
      return <span className="text-primary-600 dark:text-primary-400">{value}</span>;
    }

    if (typeof value === 'string') {
      return (
        <span className="text-slate-700 dark:text-slate-300">
          "{value}"
        </span>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-slate-500">[]</span>;
      }

      return (
        <div className="ml-4">
          <div className="text-slate-500">[</div>
          {value.map((item, index) => (
            <div key={index} className="ml-4">
              {renderValue(item, index, depth + 1)}
              {index < value.length - 1 && <span className="text-slate-500">,</span>}
            </div>
          ))}
          <div className="text-slate-500">]</div>
        </div>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return <span className="text-slate-500">{'{}'}</span>;
      }

      return (
        <JSONObject
          data={value}
          depth={depth}
          maxDepth={maxDepth}
        />
      );
    }

    return <span className="text-slate-600 dark:text-slate-400">{String(value)}</span>;
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
        <h4 className="font-medium text-slate-800 dark:text-slate-200">Raw JSON Response</h4>
        <button
          onClick={copyToClipboard}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
          title="Copy JSON"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 max-h-64 overflow-auto scrollbar-thin">
        <pre className="font-mono text-sm">
          {renderValue(data)}
        </pre>
      </div>
    </div>
  );
};

const JSONObject = ({ data, depth, maxDepth }) => {
  const [collapsed, setCollapsed] = useState(depth >= maxDepth);
  const keys = Object.keys(data);

  return (
    <div>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
        <span className="text-slate-500">{'{'}</span>
        {collapsed && <span className="text-slate-400">... {keys.length} keys</span>}
      </button>
      
      {!collapsed && (
        <div className="ml-4">
          {keys.map((key, index) => (
            <div key={key} className="my-1">
              <span className="text-primary-600 dark:text-primary-400 font-medium">
                "{key}"
              </span>
              <span className="text-slate-500 mx-2">:</span>
              <span>
                {typeof data[key] === 'object' && data[key] !== null ? (
                  <JSONObject
                    data={data[key]}
                    depth={depth + 1}
                    maxDepth={maxDepth}
                  />
                ) : (
                  renderValue(data[key])
                )}
              </span>
              {index < keys.length - 1 && <span className="text-slate-500">,</span>}
            </div>
          ))}
          <div className="text-slate-500">{'}'}</div>
        </div>
      )}
    </div>
  );
};

const renderValue = (value) => {
  if (value === null) {
    return <span className="text-slate-400 dark:text-slate-500">null</span>;
  }

  if (typeof value === 'boolean') {
    return (
      <span className={value ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}>
        {value.toString()}
      </span>
    );
  }

  if (typeof value === 'number') {
    return <span className="text-primary-600 dark:text-primary-400">{value}</span>;
  }

  if (typeof value === 'string') {
    return (
      <span className="text-slate-700 dark:text-slate-300">
        "{value}"
      </span>
    );
  }

  if (Array.isArray(value)) {
    return <span className="text-slate-500">[Array({value.length})]</span>;
  }

  return <span className="text-slate-600 dark:text-slate-400">{String(value)}</span>;
};

export default JSONViewer;