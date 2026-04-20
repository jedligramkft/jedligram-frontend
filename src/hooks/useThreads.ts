import { useState, useEffect } from "react";
import { GetThreads } from "../api/threads";
import type { ThreadData } from "../Interfaces/ThreadData";
import { toast } from "react-toastify";

// Used in searchengine
export const useThreads = () => {
	const [threads, setThreads] = useState<ThreadData[]>([]);

	useEffect(() => {
		const fetchThreads = async () => {
			try {
				const response = (await GetThreads()).data;
				setThreads(Array.isArray(response.data) ? response.data : []);
			} catch (error) {
				const message = (error as any)?.response?.data?.message;
				if (message) {
					toast.error("Failed to fetch threads: ");
					return;
				}
				console.error("Error fetching threads:", error);
			}
		};
		fetchThreads();
	}, []);

	return threads;
};
