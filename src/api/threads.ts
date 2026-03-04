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
		category: newThread.category,
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
	post: { title: string; content: string },
): Promise<ResponseData> => {
	const response = await httpClient.post(`/api/threads/${threadId}/post`, {
		title: post.title,
		content: post.content,
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