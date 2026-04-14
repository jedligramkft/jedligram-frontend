export interface UserData {
	id: number;
	email: string;
	username: string;
	password: string;
	name?: string;
	post_karma?: number;
	image_url?: string;
	bio?: string;
	role_id?: number;
}
