import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer token if available
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

// Response Interceptor: Global 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired credentials
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// --- Auth Endpoints ---
export const loginApi = (credentials) => api.post('/auth/login', credentials);
export const registerApi = (userData) => api.post('/auth/register', userData);
export const getCurrentUserApi = () => api.get('/auth/me');

// --- Workers & Directory Endpoints ---
export const searchWorkersApi = (filters) => api.get('/workers/search', { params: filters });
export const getWorkerProfileApi = (profileId) => api.get(`/workers/${profileId}`);
export const getMyWorkerProfileApi = () => api.get('/workers/me');
export const saveWorkerProfileApi = (profileData) => api.post('/workers/profile', profileData);

// --- Reviews Endpoints ---
export const submitReviewApi = (reviewData) => api.post('/reviews', reviewData);
export const getWorkerReviewsApi = (workerProfileId) => api.get(`/reviews/worker/${workerProfileId}`);

// --- Community Recommendations Endpoints ---
export const submitRecommendationApi = (recommendationData) => api.post('/recommendations', recommendationData);
export const getMyRecommendationsApi = () => api.get('/recommendations/my');

// --- Admin Moderation & Management Endpoints ---
export const getAdminStatsApi = () => api.get('/admin/stats');
export const getPendingWorkersApi = () => api.get('/admin/workers/pending');
export const verifyWorkerApi = (profileId) => api.put(`/admin/workers/${profileId}/verify`);
export const rejectWorkerApi = (profileId, reason) => api.put(`/admin/workers/${profileId}/reject`, { action: 'REJECTED', reason });
export const getPendingRecommendationsApi = () => api.get('/admin/recommendations/pending');
export const approveRecommendationApi = (id) => api.put(`/admin/recommendations/${id}/approve`);
export const rejectRecommendationApi = (id, reason) => api.put(`/admin/recommendations/${id}/reject`, { action: 'REJECTED', reason });
export const getAuditLogsApi = (count = 50) => api.get('/admin/audit-logs', { params: { count } });
export const createCategoryApi = (categoryData) => api.post('/admin/categories', categoryData);

// --- Geography & Metadata Endpoints ---
export const getDistrictsApi = () => api.get('/geography/districts');
export const getUpazilasApi = (districtId) => api.get(`/geography/upazilas/${districtId}`);
export const getCategoriesApi = () => api.get('/categories');

export default api;