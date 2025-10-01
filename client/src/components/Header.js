import React from 'react';
import { Brain, Moon, Sun } from 'lucide-react';

const Header = ({ darkMode, toggleDarkMode }) => {
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Brain className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Slate Intelligence
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
                  AI Document Classifier
                </p>
              </div>
            </div>
          </div>

          {/* Navigation and Controls */}
          <div className="flex items-center space-x-4">
            
            {/* Stats Display */}
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="font-semibold text-slate-900 dark:text-slate-100">99.2%</div>
                <div className="text-slate-500 dark:text-slate-400">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-slate-900 dark:text-slate-100">10k+</div>
                <div className="text-slate-500 dark:text-slate-400">Processed</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-slate-900 dark:text-slate-100">&lt;5s</div>
                <div className="text-slate-500 dark:text-slate-400">Response</div>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus-ring"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              )}
            </button>

            {/* User Menu (placeholder) */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">U</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;