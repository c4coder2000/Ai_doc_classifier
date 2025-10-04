import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Signup from './components/Signup';
import History from './components/History';
import DocumentClassifier from './components/DocumentClassifier';
import './styles/global.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'dark:bg-slate-800 dark:text-white',
            }}
          />
          
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <DocumentClassifier />
              </ProtectedRoute>
            } />
            
            <Route path="/history" element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;