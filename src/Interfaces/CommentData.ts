import type { UserData } from "./UserData";

export interface CommentData {
	id: number;
	content: string;
	depth: string;
	user: UserData;
	age: string;
	replies_count: number;
	replies: CommentData[];
}
