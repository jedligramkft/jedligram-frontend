import type { ResponseData } from "../Interfaces/ResponseData";
import type { UserData } from "../Interfaces/UserData";
import httpClient from "./httpClient";

const authTokenName: string =
	import.meta.env.VITE_AUTH_TOKEN_NAME ?? "jedligram_token";

const profileStorageKey: string =
	import.meta.env.VITE_LOCAL_STORAGE_PROFILE_KEY ?? "jedligram_profile";

const seedProfileFromLoginResponse = (user: UserData) => {
	localStorage.setItem(
		profileStorageKey,
		JSON.stringify({
			id: user.id,
			username: user.username,
			email: user.email,
			image_url: user.image_url,
			joinedThreads: [],
			joinedThreadIds: [],
			lastSavedAt: "",
		}),
	);
};

export const Login = async (userData: UserData): Promise<ResponseData> => {
	const response = await httpClient.post("/api/login", userData);

	const bearerToken: string = response.data.access_token;
	localStorage.setItem(authTokenName, bearerToken);

	localStorage.removeItem(profileStorageKey);
	seedProfileFromLoginResponse(response.data.user as UserData);

	response.data.access_token = undefined;

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
		localStorage.removeItem(profileStorageKey);
	}
};

export const getAuthToken = (): string | null => {
	return localStorage.getItem(authTokenName);
};

export const isLoggedIn = (): boolean => {
	const token = getAuthToken();
	return typeof token === "string" && token.trim().length > 0;
};
