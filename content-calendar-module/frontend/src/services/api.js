import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error codes
      switch (error.response.status) {
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          if (error.response.data?.error) {
            toast.error(error.response.data.error);
          }
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Calendar API methods
export const calendarAPI = {
  // Get events for a specific month
  getEvents: async (month, year, industry = null) => {
    const params = { month, year };
    if (industry) params.industry = industry;
    
    const response = await api.get('/calendar/events', { params });
    return response.data;
  },
  
  // Generate AI content prompts
  generatePrompt: async (eventName, userIndustry, eventDescription = null) => {
    const payload = { eventName, userIndustry };
    if (eventDescription) payload.eventDescription = eventDescription;
    
    const response = await api.post('/calendar/generate-prompt', payload);
    return response.data;
  },
  
  // Get list of industries
  getIndustries: async () => {
    const response = await api.get('/calendar/industries');
    return response.data;
  },
  
  // Health check
  healthCheck: async () => {
    const response = await api.get('/calendar/health');
    return response.data;
  }
};

export default api;