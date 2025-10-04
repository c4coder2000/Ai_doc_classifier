import axios from 'axios';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout for file uploads
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const classifyDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/api/v1/classify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload Progress: ${percentCompleted}%`);
      },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.detail || 
      error.response?.data?.message || 
      'Failed to classify document. Please check if the server is running.'
    );
  }
};

export default api;
