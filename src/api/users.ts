import type { ResponseData } from "../Interfaces/ResponseData";
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
	userId: number,
	name?: string,
	email?: string,
): Promise<ResponseData> => {
	const response = await httpClient.put(`/api/users/${userId}`, {
		name,
		email,
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
