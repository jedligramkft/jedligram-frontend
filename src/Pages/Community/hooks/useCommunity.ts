import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
	GetThreadById,
	GetPostsInThread,
	JoinThread,
	LeaveThread,
	GetThreadMembers,
} from "../../../api/threads";
import { GetUserThreads } from "../../../api/users";
import type { ThreadData } from "../../../Interfaces/ThreadData";
import type { UserData } from "../../../Interfaces/UserData";
import { IsLoggedIn } from "../../../api/auth";
import { toast } from "react-toastify";

type RecentThreadItem = {
	id: number;
	name?: string;
	image?: string;
};

const profileStorageKey =
	import.meta.env.VITE_LOCAL_STORAGE_PROFILE_KEY ?? "jedligram_profile";

export const useCommunity = (
	threadId: number,
	navigateFn: (path: string, options?: any) => void,
) => {
	const [thread, setThread] = useState<ThreadData | null>(null);
	const [isUserJoined, setIsUserJoined] = useState(false);

	// const isLoggedIn = IsLoggedIn();
	// const [isJoined, setIsJoined] = useState(false);
	// const [posts, setPosts] = useState<Array<Record<string, unknown>>>([]);
	// const [joinedUsers, setJoinedUsers] = useState<UserData[]>([]);

	// const recentThreadsStorageKey = "jedligram_recent_threads";

	/* MEMBERS LIST */
	const [MembersJoined, setMembersJoined] = useState<UserData[]>([]);
	const [MembersIsThereMore, setMembersIsThereMore] = useState(false);
	const [MembersIsLoading, setMembersIsLoading] = useState(false);
	const [MembersCurrentPage, setMembersCurrentPage] = useState(1);

	async function fetchJoinedUsers(currentPage: number) {
		setMembersIsLoading(true);
		try {
			const response = await GetThreadMembers(threadId, currentPage);
			const responseData = response.data as {
				data: UserData[];
			};
			setMembersIsThereMore(response.data["links"]["next"] !== null);
			setMembersCurrentPage(currentPage + 1);
			return responseData.data;
		}
		catch (error) {
			toast.error("An error occurred while loading the members.");
			return [];
		}
		finally {
			setMembersIsLoading(false);
		}
	}

	async function InitialFetchMembers() {
		setMembersJoined([]);
		setMembersCurrentPage(1);
		setMembersIsThereMore(false);

		const users = await fetchJoinedUsers(MembersCurrentPage);
		setMembersJoined(users);
	}

	async function FetchMoreMembers() {
		if (MembersIsLoading || !MembersIsThereMore) return;
		const users = await fetchJoinedUsers(MembersCurrentPage);
		setMembersJoined((prev) => [...prev, ...users]);
	}

	/* END OF MEMBERS LIST */

	//Get the current thread data
	async function fetchThreadData(id: number): Promise<ThreadData | null> {
		try{
			const threadRes = (await GetThreadById(id)) as {data: ThreadData};

			// console.log("Fetched thread data:", threadRes.data);
			setThread(threadRes.data);
			return threadRes.data;
		}catch(err){
			if (!axios.isAxiosError(err)) {
				toast.error("An unexpected error occurred while loading the community.");
				return null;
			}

			switch (err.response?.status) {
				case 404:
					toast.error("Community not found.");
					navigateFn("/all-communities");
					return null;
				case 401:
					toast.error("Unauthenticated. Please log in and try again.");
					navigateFn("/auth/login", { replace: true });
					return null;
				case 403:
					toast.error("You do not have permission to view this community.");
					navigateFn("/all-communities");
					return null;
				default:
					toast.error("An error occurred while loading the community.");
					return null;
			}
		}
	}

	useEffect(() => {
		if (Number.isNaN(threadId)) {
			navigateFn("/all-communities");
		}

		async function load() {
			const threadRes = await fetchThreadData(threadId); //Get the thread the user is currently viewing
			if(threadRes === null) return;
			setIsUserJoined(threadRes.my_role !== null); //Check if the user is a member of the thread
			// console.log("User joined status:", threadRes.my_role !== null);
			await InitialFetchMembers(); //Fetch the members of the thread
		}
		load();
	}, [threadId, navigateFn]);

	return { thread, isUserJoined };
	// const readProfile = (): any => {
	// 	try {
	// 		const raw = localStorage.getItem(profileStorageKey);
	// 		return raw ? JSON.parse(raw) : {};
	// 	} catch {
	// 		return {};
	// 	}
	// };

	// const getCurrentUserId = (): number | undefined => {
	// 	const profile = readProfile();
	// 	const userId = profile.id;
	// 	return userId;
	// };

	// const refreshIsJoined = async () => {
	// 	const userId = getCurrentUserId();

	// 	try {
	// 		const response = await GetUserThreads(userId!);
	// 		const list = response.data;
	// 		const joinedThreadIds = list.map((t: any) => Number(t.id));

	// 		setIsJoined(joinedThreadIds.includes(threadId));
	// 	} catch {
	// 		setIsJoined(false);
	// 	}
	// };

	// const saveRecentThread = (
	// 	threadId: number,
	// 	threadName?: string,
	// 	threadImage?: string,
	// ) => {
	// 	if (!Number.isFinite(threadId)) return;

	// 	try {
	// 		const raw = localStorage.getItem(recentThreadsStorageKey);
	// 		const current: RecentThreadItem[] = raw ? JSON.parse(raw) : [];

	// 		const next: RecentThreadItem[] = [
	// 			{
	// 				id: threadId,
	// 				name: threadName?.trim() || undefined,
	// 				image: threadImage,
	// 			},
	// 			...current.filter((t) => t.id !== threadId),
	// 		].slice(0, 5);

	// 		localStorage.setItem(recentThreadsStorageKey, JSON.stringify(next));
	// 		window.dispatchEvent(new Event("recent-threads-changed"));
	// 	} catch {
	// 		console.error("Failed to save recent thread.");
	// 	}
	// };

	// const fetchJoinedUsers = async (
	// 	threadIdValue: number,
	// ): Promise<UserData[]> => {
	// 	if (Number.isNaN(threadIdValue)) return [];

	// 	const response = (await GetThreadMembers(threadIdValue)).data;
	// 	const usersData = response.data?.users ?? response.data;

	// 	if (!Array.isArray(usersData)) return [];
	// 	return usersData as UserData[];
	// };

	// const handleJoin = useCallback(async () => {
	// 	if (!isLoggedIn) {
	// 		navigateFn("/auth/login", { replace: true });
	// 		return;
	// 	}

	// 	if (Number.isNaN(threadId)) return;

	// 	try {
	// 		await JoinThread(threadId);
	// 		setIsJoined(true);
	// 		const users = await fetchJoinedUsers(threadId);
	// 		setJoinedUsers(users);
	// 		window.dispatchEvent(new Event("joined-threads-changed"));
	// 	} catch (err) {
	// 		if (axios.isAxiosError(err)) {
	// 			if (err.response?.status === 401) {
	// 				navigateFn("/auth/login", { replace: true });
	// 				return;
	// 			}
	// 			const message = (err.response?.data as any).message;
	// 			const lower = message.toLowerCase();
	// 			const alreadyMember =
	// 				lower.includes("already") && lower.includes("member");

	// 			if (alreadyMember) {
	// 				setIsJoined(true);
	// 				const users = await fetchJoinedUsers(threadId);
	// 				setJoinedUsers(users);
	// 				window.dispatchEvent(new Event("joined-threads-changed"));
	// 				return;
	// 			}

	// 			toast.error(message ?? "Nem sikerült csatlakozni.");
	// 			return;
	// 		}
	// 	}
	// }, [threadId, isLoggedIn, navigateFn, refreshIsJoined]);

	// const handleLeave = useCallback(async () => {
	// 	if (!isLoggedIn) {
	// 		navigateFn("/auth/login", { replace: true });
	// 		return;
	// 	}

	// 	if (Number.isNaN(threadId)) return;

	// 	try {
	// 		await LeaveThread(threadId);
	// 		setIsJoined(false);

	// 		const profile = readProfile();
	// 		const currentUserId = profile.id;
	// 		if (currentUserId) {
	// 			setJoinedUsers((prev) =>
	// 				prev.filter((u) => u.id !== currentUserId),
	// 			);
	// 		}

	// 		window.dispatchEvent(new Event("joined-threads-changed"));
	// 	} catch (err) {
	// 		if (axios.isAxiosError(err)) {
	// 			if (err.response?.status === 401) {
	// 				navigateFn("/auth/login", { replace: true });
	// 				return;
	// 			}
	// 			const message = (err.response?.data as any)?.message;
	// 			toast.error(message ?? "Nem sikerült elhagyni a közösséget.");
	// 			return;
	// 		}
	// 	}
	// }, [threadId, isLoggedIn, navigateFn, refreshIsJoined]);

	// useEffect(() => {
	// 	void refreshIsJoined();
	// 	window.addEventListener("joined-threads-changed", refreshIsJoined);
	// 	return () =>
	// 		window.removeEventListener(
	// 			"joined-threads-changed",
	// 			refreshIsJoined,
	// 		);
	// }, [refreshIsJoined]);

	// useEffect(() => {
	// 	if (!id) return;

	// 	let isCancelled = false;
	// 	const load = async () => {
	// 		setJoinedUsers([]);
	// 		try {
	// 			const [threadRes, postsRes] = await Promise.all([
	// 				GetThreadById(threadId),
	// 				GetPostsInThread(threadId),
	// 			]);

	// 			const threadData = (threadRes.data?.thread ??
	// 				threadRes.data) as ThreadData;
	// 			const postsData = postsRes.data?.posts ?? postsRes.data;

	// 			if (!isCancelled) {
	// 				setThread(threadData);
	// 				const postsArray = Array.isArray(postsData)
	// 					? (postsData as Array<Record<string, unknown>>)
	// 					: [];
	// 				setPosts(postsArray);
	// 				saveRecentThread(
	// 					threadId,
	// 					threadData?.name,
	// 					threadData?.image,
	// 				);
	// 			}

	// 			try {
	// 				const users = await fetchJoinedUsers(threadId);
	// 				if (!isCancelled) setJoinedUsers(users);
	// 			} catch (err) {
	// 				console.warn("Nem sikerült betölteni a tagokat.", err);
	// 				if (!isCancelled) setJoinedUsers([]);
	// 			}
	// 		} catch (err) {
	// 			if (isCancelled) return;

	// 			if (axios.isAxiosError(err) && err.response?.status === 401) {
	// 				navigateFn("/auth/login", { replace: true });
	// 				return;
	// 			}
	// 		}
	// 	};

	// 	void load();
	// 	return () => {
	// 		isCancelled = true;
	// 	};
	// }, [id, isLoggedIn, threadId, navigateFn]);

	// const handleInvite = async () => {
	// 	if (Number.isNaN(threadId)) return;

	// 	try {
	// 		const inviteUrl = new URL(
	// 			`/communities/${threadId}`,
	// 			window.location.origin,
	// 		).toString();
	// 		await (navigator as any).share({ url: inviteUrl });
	// 		return;
	// 	} catch (err) {
	// 		toast.error("Hiba történt az meghívás küldése során.");
	// 		if (axios.isAxiosError(err)) {
	// 			if (err.response?.status === 401) {
	// 				navigateFn("/auth/login", { replace: true });
	// 				return;
	// 			}
	// 		}
	// 	}
	// };

	// return {
	// 	thread,
	// 	// posts,
	// 	isJoined,
	// 	// votingPostId,
	// 	// joinedUsers,
	// 	handleJoin,
	// 	handleLeave,
	// 	handleInvite,
	// };
};
