import axios from "axios";
import { AxiosError } from "axios";

const backendUrl: string =
	import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const authTokenName: string =
	import.meta.env.VITE_AUTH_TOKEN_NAME ?? "jedligram_token";

// Create an Axios instance
const httpClient = axios.create({
	baseURL: backendUrl,
	timeout: 10000,
});

// Request interceptor to add auth token to headers
httpClient.interceptors.request.use(
	(config) => {
		config.headers.Accept = "application/json";

		const token = localStorage.getItem(authTokenName);
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error: AxiosError) => Promise.reject(error),
);

// Add a response interceptor to handle global errors
httpClient.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		if (error.response?.status === 401) {
			// console.error("Unauthorized! Redirecting to login...");
			// localStorage.removeItem(authTokenName);
			// window.location.href = "/auth/login";
		}
		return Promise.reject(error);
	},
);

export default httpClient;
