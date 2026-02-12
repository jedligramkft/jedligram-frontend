import axios from 'axios';

var backendUrl: string = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
var authTokenName: string = import.meta.env.VITE_AUTH_TOKEN_NAME || 'authToken';

// Create an Axios instance
const httpClient = axios.create({
  baseURL: backendUrl,
  timeout: 10000,
});

// Request interceptor to add auth token to headers
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(authTokenName);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle global errors
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
        //TODO redirect to login page
        console.error('Unauthorized! Redirecting to login...'); 
    }
    return Promise.reject(error);
  }
);

export default httpClient;