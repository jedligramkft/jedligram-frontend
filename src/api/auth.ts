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
			joinedThreads: [],
			joinedThreadIds: [],
			lastSavedAt: "",
		}),
	);
};

export const Login = async (userData: UserData): Promise<ResponseData> => {
	const response = await httpClient.post("/api/login", userData);

	if (response.data.user && response.data.access_token) {
		trySetLocalstorage(response.data.user, response.data.access_token);
	}

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

const trySetLocalstorage = (user: UserData, accessToken: string) => {
	try {
		const bearerToken: string = accessToken;
		localStorage.setItem(authTokenName, bearerToken);

		localStorage.removeItem(profileStorageKey);
		seedProfileFromLoginResponse(user as UserData);
	} catch {}
};

export const Toggle2FA = async (): Promise<ResponseData> => {
	try {
		const response = await httpClient.post("/api/toggle-2fa");
		return {
			status: response.status,
			data: response.data,
		};
	} catch (err: any) {
		const status = err?.response?.status;

		throw new Error(status ? `[${status}] ${err.message}` : err.message);
	}
};

export const Verify2FA = async (
	email: string,
	code: string,
): Promise<ResponseData> => {
	try {
		const response = await httpClient.post("/api/verify-2fa", {
			email: email,
			verification_code: code,
		});

		if (response.data.user && response.data.access_token) {
			trySetLocalstorage(response.data.user, response.data.access_token);
		}

		return {
			status: response.status,
			data: response.data,
		};
	} catch (err: any) {
		const status = err?.response?.status;
		throw new Error(status ? `[${status}] ${err.message}` : err.message);
	}
};

export const IsVerificationEnabled = async (): Promise<ResponseData> => {
	try {
		const response = await httpClient.get("/api/is-2fa-enabled");
		return {
			status: response.status,
			data: response.data,
		};
	} catch (err: any) {
		const status = err?.response?.status;
		throw new Error(status ? `[${status}] ${err.message}` : err.message);
	}
};
