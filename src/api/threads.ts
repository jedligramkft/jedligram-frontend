import type { ResponseData } from "../Interfaces/ResponseData";
import type { ThreadData } from "../Interfaces/ThreadData";
// import type { UserData } from "../Interfaces/UserData";
import httpClient from "./httpClient";

export const GetThreads = async (): Promise<ResponseData> => {
	const response = await httpClient.get("/api/threads");

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

export const GetPostsInThread = async (
	threadId: number,
): Promise<ResponseData> => {
	const response = await httpClient.get(`/api/threads/${threadId}/posts`);

	return {
		status: response.status,
		data: response.data,
	};
};

export const CreatePostInThread = async (
	threadId: number,
	content: string,
	user: { id: number; name: string }
): Promise<ResponseData> => {
	const response = await httpClient.post(`/api/threads/${threadId}/post`, {
		content: content,
		user: {
			id: user.id,
			name: user.name,
		}
	});

	return {
		status: response.status,
		data: response.data,
	};
};

export const searchThreads = async (query: string): Promise<ResponseData> => {
	const response = await httpClient.get("/api/threads?search=", {
		params: { search: query },
	});
	
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

export const UploadThreadImage = async (threadId: number, file: File): Promise<ResponseData> => {
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

export const UploadThreadHeaderImage = async (threadId: number, file: File): Promise<ResponseData> => {
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
