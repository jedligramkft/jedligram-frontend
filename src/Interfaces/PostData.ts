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
}
