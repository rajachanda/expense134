import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request queue to manage rate limiting
let requestQueue = [];
let isProcessing = false;

const processQueue = async () => {
  if (isProcessing || requestQueue.length === 0) return;
  
  isProcessing = true;
  
  while (requestQueue.length > 0) {
    const { resolve, reject, config } = requestQueue.shift();
    
    try {
      const response = await axios(config);
      resolve(response);
    } catch (error) {
      if (error.response?.status === 429) {
        // Requeue the request with delay
        setTimeout(() => {
          requestQueue.unshift({ resolve, reject, config });
        }, 1000);
      } else {
        reject(error);
      }
    }
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  isProcessing = false;
};

// Enhanced request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Enhanced response interceptor with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 429) {
      // Add to queue for retry
      return new Promise((resolve, reject) => {
        requestQueue.push({ resolve, reject, config: error.config });
        processQueue();
      });
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    const errorMessage = error.response?.data?.message || 'Something went wrong';
    if (error.config && !error.config.skipErrorToast) {
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please try again in a moment.');
      } else {
        toast.error(errorMessage);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

