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

export const VoteOnPost = async (
	postId: number,
	isUpvote: boolean,
): Promise<ResponseData> => {
	const response = await httpClient.post(`/api/posts/${postId}/vote`, {
		is_upvote: isUpvote,
	});
	return {
		status: response.status,
		data: response.data,
	};
};

export const RemoveVoteFromPost = async (postId: number): Promise<ResponseData> => {
	const response = await httpClient.delete(`/api/posts/${postId}/vote`);
	return {
		status: response.status,
		data: response.data,
	};
};

export const CommentOnPost = async (postId: number, content: string): Promise<ResponseData> => {
	const response = await httpClient.post(`/api/posts/${postId}/comments`, {
		content: content,
	});
	return {
		status: response.status,
		data: response.data,
	};
}

export const GetCommentsForPost = async (postId: number): Promise<ResponseData> => {
	const response = await httpClient.get(`/api/posts/${postId}/comments`);
	return {
		status: response.status,
		data: response.data,
	};
};
