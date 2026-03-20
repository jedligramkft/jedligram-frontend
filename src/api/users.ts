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

export const ProfilePictureUpload = async (file: File): Promise<ResponseData> => {
	const formData = new FormData();
	formData.append("image", file, file.name);

	try {
		const response = await httpClient.post("/api/users/profile-picture", formData);
		return {
			status: response.status,
			data: response.data,
		};
	} catch (err: any) {
		const status = err?.response?.status;

		throw new Error(status ? `[${status}] ${err.message}` : err.message);
	}
};

export const UploadProfilePicture = async (file: File): Promise<string> => {
	const response = await ProfilePictureUpload(file);
	const data: any = response?.data;

	const pickString = (obj: any, keys: string[]): string | undefined => {
		if (!obj || typeof obj !== "object") return undefined;
		for (const key of keys) {
			const value = obj[key];
			if (typeof value === "string" && value.trim().length > 0) return value;
		}
		return undefined;
	};

	const keys = [
		"url",
		"path",
		"profile_picture_url",
		"profilePictureUrl",
		"avatar_url",
		"avatar",
		"image_url",
		"image",
	];

	const urlCandidate =
		(typeof data === "string" ? data : undefined) ??
		pickString(data, keys) ??
		pickString(data?.data, keys) ??
		pickString(data?.user, keys) ??
		pickString(data?.data?.user, keys);

	if (!urlCandidate || typeof urlCandidate !== "string") {
		throw new Error("Nem sikerült kinyerni a profilkép URL-jét a válaszból.");
	}

	return urlCandidate;
};