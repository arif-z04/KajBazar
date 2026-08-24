import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT Bearer token to request headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const searchWorkers = (filters) => api.get('/workers/search', { params: filters });
export const getWorkerProfile = (id) => api.get(`/workers/${id}`);
export const submitReview = (reviewData) => api.post('/reviews', reviewData);
export const recommendOfflineWorker = (recommendationData) => api.post('/recommendations', recommendationData);

export default api;
