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
