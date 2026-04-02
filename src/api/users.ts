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

export const UpdateUserThreadRole = async (
	threadId: number,
	userId: number,
	roleId: number,
): Promise<ResponseData> => {
	const response = await httpClient.patch(
		`/api/threads/${threadId}/members/${userId}`,
		{
			role_id: roleId,
		},
	);
	return {
		status: response.status,
		data: response.data,
	};
}
