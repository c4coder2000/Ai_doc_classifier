import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, Moon, Sun, LogOut, Clock, ChevronDown } from 'lucide-react';

const Header = ({ darkMode, toggleDarkMode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Slate Intelligence
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
                  AI Document Classifier
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation and Controls */}
          <div className="flex items-center space-x-4">
            
            {/* Navigation Links */}
            {user && (
              <nav className="hidden md:flex items-center space-x-1">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/') 
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Classify
                </Link>
                <Link
                  to="/history"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    isActive('/history') 
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  History
                </Link>
              </nav>
            )}

            {/* Stats Display */}
            <div className="hidden lg:flex items-center space-x-6 text-sm">
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
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              )}
            </button>

            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {user.full_name || user.username}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {user.email}
                      </p>
                    </div>
                    
                    <Link
                      to="/history"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Document History
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;