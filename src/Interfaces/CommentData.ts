import type { UserData } from "./UserData";

export interface CommentData {
	id: number;
	content: string;
	user: UserData;
	age: string;
	depth: string;
	replies_count: number;
	replies: CommentData[];
	is_mine: boolean;
	my_vote: boolean | null; // true = upvoted, false = downvoted, null = no vote
}
