import type { ResponseData } from "../Interfaces/ResponseData";
import httpClient from "./httpClient";

export const GetPosts = async (): Promise<ResponseData> => {
	const response = await httpClient.get("/api/posts");
	return {
		status: response.status,
		data: response.data,
	};
};

export const GetPostById = async (postId: number): Promise<ResponseData> => {
	const response = await httpClient.get(`/api/posts/${postId}`);
	return {
		status: response.status,
		data: response.data,
	};
};

export const DeletePost = async (postId: number): Promise<ResponseData> => {
	const response = await httpClient.delete(`/api/posts/${postId}`);
	return {
		status: response.status,
		data: response.data,
	};
};

export const CreatePostInThread = async (
	threadId: number,
	content: string,
	image: File | null = null,
): Promise<ResponseData> => {
	const formData = new FormData();
	formData.append("content", content);

	if (image) {
		formData.append("image", image, image.name);
	}

	const response = await httpClient.post(
		`/api/threads/${threadId}/post`,
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		},
	);
	return {
		status: response.status,
		data: response.data,
	};
};

/* -------------------------- */

export const ReplyToComment = async (
	postId: number,
	commentId: number,
	content: string,
): Promise<ResponseData> => {
	const response = await httpClient.post(`/api/posts/${postId}/comments`, {
		content: content,
		parent_id: commentId,
		parent_comment_id: commentId,
	});
	return {
		status: response.status,
		data: response.data,
	};
};
