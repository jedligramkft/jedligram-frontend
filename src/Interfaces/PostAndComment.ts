import type { UserData } from "./UserData";

export interface PostAndCommentData {
	id: number;
	content: string;
	age: string;
	user: UserData;
	is_mine: boolean;
	my_vote: boolean | null; // true = upvoted, false = downvoted, null = no vote

	//post specific
	thread_id?: number;
	score?: number;
	image?: string;

	//comment specific
	depth?: string;
	replies_count?: number;
	replies?: PostAndCommentData[];
}
