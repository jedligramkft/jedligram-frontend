import type { ResponseData } from "../Interfaces/ResponseData";
import type { UserData } from "../Interfaces/UserData";
import httpClient from "./httpClient";

const authTokenName: string =
	import.meta.env.VITE_AUTH_TOKEN_NAME || "authToken";

export const Login = async (userData: UserData): Promise<ResponseData> => {
	const response = await httpClient.post("/api/login", userData);

	const bearerToken: string = response.data.access_token;
	localStorage.setItem(authTokenName, bearerToken);

	response.data.access_token = undefined;

	return {
		status: response.status,
		data: response.data,
	};
};

export const Register = async (userData: UserData): Promise<ResponseData> => {
	const response = await httpClient.post("/api/register", userData);

	return {
		status: response.status,
		data: response.data,
	};
};

export const Logout = async (): Promise<void> => {
	const response = await httpClient.post("/api/logout");

	if (response.status === 200) {
		console.log("Logged out successfully");
		localStorage.removeItem(authTokenName);
		window.location.href = "/";
	}
};

export const getAuthToken = (): string | null => {
	return localStorage.getItem(authTokenName);
};

export const isLoggedIn = (): boolean => {
	const token = getAuthToken();
	return typeof token === "string" && token.trim().length > 0;
};
