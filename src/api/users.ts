import type { ResponseData } from "../Interfaces/ResponseData";
import type { UserData } from "../Interfaces/UserData";
import httpClient from "./httpClient";

export const GetUsers = async (searchQuery?: string): Promise<ResponseData> => {
	const response = await httpClient.get("/api/users", {
		params: searchQuery ? { search: searchQuery } : {},
	});

	return {
		status: response.status,
		data: response.data,
	};
};

export const GetUserProfile = async (userId: number): Promise<ResponseData> => {
	const response = await httpClient.get(`/api/users/${userId}`);

	return {
		status: response.status,
		data: response.data,
	};
};

export const GetUserThreads = async (userId: number): Promise<ResponseData> => {
	const response = await httpClient.get(`/api/users/${userId}/threads`);

	return {
		status: response.status,
		data: response.data,
	};
};

export const UpdateUserProfile = async (
	toUpdateUser: UserData,
): Promise<ResponseData> => {
	const response = await httpClient.put(`/api/users/${toUpdateUser.id}`, {
		name: toUpdateUser.name,
		email: toUpdateUser.email,
		bio: toUpdateUser.bio,
	});

	return {
		status: response.status,
		data: response.data,
	};
};

export const ProfilePictureUpload = async (
	file: File,
): Promise<ResponseData> => {
	const formData = new FormData();
	formData.append("image", file, file.name);

	try {
		const response = await httpClient.post(
			"/api/users/profile-picture",
			formData,
		);
		return {
			status: response.status,
			data: response.data,
		};
	} catch (err: any) {
		const status = err?.response?.status;

		throw new Error(status ? `[${status}] ${err.message}` : err.message);
	}
};

export const Toggle2FA = async (): Promise<ResponseData> => {
	try {
		const response = await httpClient.post("/api/users/toggle-2fa");
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
		const response = await httpClient.post("/api/users/verify-2fa", {
			email,
			code,
		});
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
		const response = await httpClient.get("/api/users/is-2fa-enabled");
		return {
			status: response.status,
			data: response.data,
		};
	} catch (err: any) {
		const status = err?.response?.status;
		throw new Error(status ? `[${status}] ${err.message}` : err.message);
	}
};
