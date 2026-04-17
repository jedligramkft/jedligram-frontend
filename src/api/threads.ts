import type { ResponseData } from "../Interfaces/ResponseData";
import type { ThreadData } from "../Interfaces/ThreadData";
// import type { UserData } from "../Interfaces/UserData";
import httpClient from "./httpClient";

export const GetThreads = async (page?: number): Promise<ResponseData> => {
	const link = page ? `/api/threads?page=${page}` : "/api/threads";
	const response = await httpClient.get(link);

	return {
		status: response.status,
		data: response.data,
	};
};

export const SearchThreads = async (query: string): Promise<ResponseData> => {
	const response = await httpClient.get("/api/threads?search=", {
		params: { search: query },
	});

	return {
		status: response.status,
		data: response.data,
	};
};

export const CreateThread = async (
	newThread: ThreadData,
): Promise<ResponseData> => {
	const response = await httpClient.post("/api/threads", {
		name: newThread.name,
		description: newThread.description,
		rules: newThread.rules,
	});

	return {
		status: response.status,
		data: response.data,
	};
};

export const GetThreadById = async (
	threadId: number,
): Promise<ResponseData> => {
	const response = await httpClient.get(`/api/threads/${threadId}`);

	return {
		status: response.status,
		data: response.data,
	};
};

export const JoinThread = async (threadId: number): Promise<ResponseData> => {
	const response = await httpClient.post(`/api/threads/${threadId}/join`);

	return {
		status: response.status,
		data: response.data,
	};
};

export const LeaveThread = async (threadId: number): Promise<ResponseData> => {
	const response = await httpClient.delete(`/api/threads/${threadId}/leave`);

	return {
		status: response.status,
		data: response.data,
	};
};

export const GetThreadMembers = async (
	threadId: number,
): Promise<ResponseData> => {
	const response = await httpClient.get(`/api/threads/${threadId}/members`);
	return {
		status: response.status,
		data: response.data,
	};
};

export const UploadThreadImage = async (
	threadId: number,
	file: File,
): Promise<ResponseData> => {
	const formData = new FormData();
	formData.append("image", file, file.name);

	try {
		const response = await httpClient.post(
			`/api/threads/${threadId}/image`,
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

export const UploadThreadHeaderImage = async (
	threadId: number,
	file: File,
): Promise<ResponseData> => {
	const formData = new FormData();
	formData.append("header", file, file.name);

	try {
		const response = await httpClient.post(
			`/api/threads/${threadId}/header`,
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

export const UpdateThreadDetails = async (
	threadId: number,
	updatedDetails: Partial<ThreadData>,
): Promise<ResponseData> => {
	const response = await httpClient.put(
		`/api/threads/${threadId}`,
		updatedDetails,
	);
	return {
		status: response.status,
		data: response.data,
	};
};

export const UpdateRoleOfMemberInThread = async (
	threadId: number,
	userId: number,
	newRole: number,
): Promise<ResponseData> => {
	const response = await httpClient.patch(
		`/api/threads/${threadId}/members/${userId}`,
		{
			role_id: newRole,
		},
	);
	return {
		status: response.status,
		data: response.data,
	};
};

export const BanUserFromThread = async (
	threadId: number,
	userId: number,
): Promise<ResponseData> => {
	const response = await httpClient.patch(
		`/api/threads/${threadId}/members/${userId}/ban`,
		{
			role_id: 4, // 4 is the role ID for banned users
		},
	);
	return {
		status: response.status,
		data: response.data,
	};
};

export const GetPostsInThread = async (
	threadId: number,
): Promise<ResponseData> => {
	const response = await httpClient.get(`/api/threads/${threadId}/posts`);

	return {
		status: response.status,
		data: response.data,
	};
};
