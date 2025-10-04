import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/auth/verify-token`, {
            headers: {
              'Authorization': `Bearer ${savedToken}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setToken(savedToken);
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(data.access_token);
        localStorage.setItem('token', data.access_token);
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const signup = async (email, username, fullName, password) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
          full_name: fullName,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(data.access_token);
        localStorage.setItem('token', data.access_token);
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Signup failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Profile update failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};