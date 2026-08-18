import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({ baseURL });

// Attach the stored JWT (see context/AuthContext.jsx) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// api.js is a plain module, not a component, so it can't call useAuth()
// directly. AuthContext registers itself here on mount so a 401 anywhere
// in the app can actually clear React's auth state -- not just
// localStorage -- which is what makes ProtectedRoute redirect to /login
// instead of leaving a dead page up with a token the API already rejected.
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;
