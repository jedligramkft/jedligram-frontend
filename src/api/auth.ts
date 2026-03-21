import type { ResponseData } from "../Interfaces/ResponseData";
import type { UserData } from "../Interfaces/UserData";
import httpClient from "./httpClient";

const authTokenName: string =
	import.meta.env.VITE_AUTH_TOKEN_NAME ?? "jedligram_token";

const seedProfileFromLoginResponse = (data: any) => {
	const user = (data as any)?.user ?? (data as any)?.data?.user ?? null;
	if (!user || typeof user !== "object") return;

	const rawId = (user as any).id ?? (user as any).user_id ?? (user as any).userId;
	const userId =
		typeof rawId === "number"
			? rawId
			: typeof rawId === "string"
				? Number(rawId)
				: NaN;

	const username =
		typeof (user as any).name === "string" ? (user as any).name : "";
	const email =
		typeof (user as any).email === "string" ? (user as any).email : "";

	localStorage.setItem(
		"jedligram_profile",
		JSON.stringify({
			userId: Number.isFinite(userId) ? userId : undefined,
			username,
			email,
			bio: "",
			joinedThreads: [],
			joinedThreadIds: [],
			profilePictureUrl: "",
			lastSavedAt: "",
		}),
	);
};

export const Login = async (userData: UserData): Promise<ResponseData> => {
	const response = await httpClient.post("/api/login", userData);

	const bearerToken: string = response.data.access_token;
	localStorage.setItem(authTokenName, bearerToken);

	localStorage.removeItem("jedligram_profile");
	seedProfileFromLoginResponse(response.data);

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
		localStorage.removeItem("jedligram_profile");
	}
};

export const getAuthToken = (): string | null => {
	return localStorage.getItem(authTokenName);
};

export const isLoggedIn = (): boolean => {
	const token = getAuthToken();
	return typeof token === "string" && token.trim().length > 0;
};
