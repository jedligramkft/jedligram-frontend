import type { UserData } from "./UserData";

export interface PostAndCommentData {
	id: number;
	content: string;
	age: string;
	user: UserData;

	//post specific
	thread_id?: number;
	score?: number;
	image?: string;

	//comment specific
	depth?: string;
	replies_count?: number;
	replies?: PostAndCommentData[];
}
