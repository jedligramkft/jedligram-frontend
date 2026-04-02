export interface UserData {
	id: number;
	email: string;
	username: string;
	password: string;
	name?: string;
	image_url?: string;
	bio?: string;
	role_id?: number;
}
