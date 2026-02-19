import type { ResponseData } from "../Interfaces/ResponseData";
// import type { UserData } from "../Interfaces/UserData";
import httpClient from "./httpClient";

export const getThreads = async (): Promise<ResponseData> => {
	const response = await httpClient.get("/api/threads");

	return {
		status: response.status,
		data: response.data,
	};
};
