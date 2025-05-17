import axios from 'axios';

const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: backendUrl,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach access token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle token refresh on 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Prevent infinite loops
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          // Request a new access token using the refresh token
          const response = await axios.post(
            `${backendUrl}/api/users/token/refresh/`,
            { refresh: refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );
          const newAccessToken = response.data.access;
          localStorage.setItem('access_token', newAccessToken);
          // Retry the original request with the new token
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed: Clear tokens and redirect to sign-in
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('username');
          window.location.href = '/signin';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token: Redirect to sign-in
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;