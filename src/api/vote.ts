import type { ResponseData } from "../Interfaces/ResponseData";
import httpClient from "./httpClient";

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

export const MyVoteOnPost = async (postId: number): Promise<ResponseData> => {
	const response = await httpClient.get(`/api/posts/${postId}/myvote`);
	return {
		status: response.status,
		data: response.data,
	};
};
