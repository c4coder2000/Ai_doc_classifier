import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await login(formData.username, formData.password);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4 sm:px-6 lg:px-8\">
      <div className=\"max-w-md w-full space-y-8\">
        <div className=\"text-center\">
          <div className=\"mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6\">
            <svg className=\"h-8 w-8 text-white\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">
              <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z\" />
            </svg>
          </div>
          <h2 className=\"text-3xl font-bold text-slate-900 dark:text-white\">
            Welcome Back
          </h2>
          <p className=\"mt-2 text-sm text-slate-600 dark:text-slate-400\">
            Sign in to your Slate Intelligence account
          </p>
        </div>

        <div className=\"bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8\">
          <form className=\"space-y-6\" onSubmit={handleSubmit}>
            {error && (
              <div className=\"bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4\">
                <p className=\"text-sm text-red-600 dark:text-red-400\">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor=\"username\" className=\"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2\">
                Username or Email
              </label>
              <input
                id=\"username\"
                name=\"username\"
                type=\"text\"
                autoComplete=\"username\"
                required
                value={formData.username}
                onChange={handleChange}
                className=\"w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors\"
                placeholder=\"Enter your username or email\"
              />
            </div>

            <div>
              <label htmlFor=\"password\" className=\"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2\">
                Password
              </label>
              <div className=\"relative\">
                <input
                  id=\"password\"
                  name=\"password\"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete=\"current-password\"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className=\"w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12\"
                  placeholder=\"Enter your password\"
                />
                <button
                  type=\"button\"
                  onClick={() => setShowPassword(!showPassword)}
                  className=\"absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300\"
                >
                  {showPassword ? (
                    <EyeSlashIcon className=\"h-5 w-5\" />
                  ) : (
                    <EyeIcon className=\"h-5 w-5\" />
                  )}
                </button>
              </div>
            </div>

            <button
              type=\"submit\"
              disabled={loading}
              className=\"w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200\"
            >
              {loading ? (
                <div className=\"flex items-center\">
                  <div className=\"w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2\"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            <div className=\"text-center\">
              <p className=\"text-sm text-slate-600 dark:text-slate-400\">
                Don't have an account?{' '}
                <Link
                  to=\"/signup\"
                  state={{ from: location.state?.from }}
                  className=\"font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors\"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className=\"text-center\">
          <p className=\"text-xs text-slate-500 dark:text-slate-400\">
            Powered by Slate Intelligence • Secure Authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;