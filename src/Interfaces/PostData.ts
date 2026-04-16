import type { UserData } from "./UserData";

export interface PostData {
	id: number;
	content: string;
	user: UserData;
	age: string;
	thread_id: number;
	score: number;
	image?: string;
	is_mine: boolean;
	my_vote: boolean | null; // true = upvoted, false = downvoted, null = no vote
}
