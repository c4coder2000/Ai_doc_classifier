import axios from 'axios';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout for file uploads
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const classifyDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/classify', formData, {
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
