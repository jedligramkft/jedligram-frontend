import type { ResponseData } from "../Interfaces/ResponseData";
import httpClient from "./httpClient";

export const GetCommentsForPost = async (
	postId: number,
): Promise<ResponseData> => {
	const response = await httpClient.get(`/api/posts/${postId}/comments`);
	return {
		status: response.status,
		data: response.data,
	};
};

export const GetReplyCommentsForComment = async (
	commentId: number,
): Promise<ResponseData> => {
	const response = await httpClient.get(`/api/comments/${commentId}/replies`);
	return {
		status: response.status,
		data: response.data,
	};
};

export const CommentOnPostOrReplyToComment = async (
	postId: number,
	content: string,
	parentid?: number,
): Promise<ResponseData> => {
	const body: Record<string, string | number> = {
		content: content,
	};

	if (parentid != null) {
		body.parent_id = parentid;
	}

	const response = await httpClient.post(
		`/api/posts/${postId}/comments`,
		body,
	);
	return {
		status: response.status,
		data: response.data,
	};
};

export const DeleteComment = async (
	postId: number,
	commentId: number,
): Promise<ResponseData> => {
	const response = await httpClient.delete(
		`/api/posts/${postId}/comments/${commentId}`,
	);
	return {
		status: response.status,
		data: response.data,
	};
};
