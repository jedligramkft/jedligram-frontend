import { useEffect, useState } from "react";
import axios from "axios";
import {
	GetThreadById,
	JoinThread,
	LeaveThread,
	GetThreadMembers,
	UpdateRoleOfMemberInThread,
	BanUserFromThread,
} from "../../../api/threads";
import { GetUserProfile } from "../../../api/users";
import type { ThreadData } from "../../../Interfaces/ThreadData";
import type { UserData } from "../../../Interfaces/UserData";
import { toast } from "react-toastify";

type RecentThreadItem = {
	id: number;
	name?: string;
	image?: string;
};

// Interface describing the `members` section returned by the hook.
export interface CommunityMembers {
	isLoading: boolean;
	hasMore: boolean;
	totalCount: number;
	fetchedMembers: UserData[];
	fetchMoreMembers: () => Promise<void>;

	handleRoleChange: (userId: number, newRoleId: number) => Promise<void>;
	handleBanAndUnban: (userId: number, shouldBan: boolean) => Promise<void>;
}

// Full return shape of `useCommunity` for explicit typing in consumers.
export interface UseCommunityReturn {
	thread: ThreadData | null;
	isUserJoined: boolean;
	myId?: number;
	handleJoin: () => Promise<void>;
	handleLeave: () => Promise<void>;
	handleInvite: () => Promise<void>;

	members: CommunityMembers;
}

const profileStorageKey =
	import.meta.env.VITE_LOCAL_STORAGE_PROFILE_KEY ?? "jedligram_profile";

export const useCommunity = (
	threadId: number,
	navigateFn: (path: string, options?: any) => void,
): UseCommunityReturn => {
	const myId = JSON.parse(localStorage.getItem(profileStorageKey) ?? "{}").id;

	const [thread, setThread] = useState<ThreadData | null>(null);
	const [isUserJoined, setIsUserJoined] = useState(false);

	// const isLoggedIn = IsLoggedIn();
	// const [isJoined, setIsJoined] = useState(false);
	// const [posts, setPosts] = useState<Array<Record<string, unknown>>>([]);
	// const [joinedUsers, setJoinedUsers] = useState<UserData[]>([]);

	const recentThreadsStorageKey = "jedligram_recent_threads";

	/* MEMBERS LIST */
	const [MembersFetched, setMembersFetched] = useState<UserData[]>([]);
	const [MembersIsThereMore, setMembersIsThereMore] = useState(false);
	const [MembersIsLoading, setMembersIsLoading] = useState(false);
	const [MembersCurrentPage, setMembersCurrentPage] = useState(1);
	const [MembersCount, setMembersCount] = useState(0);

	async function fetchJoinedUsers(
		currentPage: number,
		initialLoad: boolean = false,
	) {
		setMembersIsLoading(true);
		try {
			const response = await GetThreadMembers(threadId, currentPage);
			const responseData = response.data as {
				data: UserData[];
			};

			let total = response.data["meta"]["total"] || 0;

			if (
				initialLoad === true &&
				isUserJoined &&
				MembersFetched.some((user) => user.id === myId)
			) {
				total = total - 1;
				responseData.data = responseData.data.filter(
					(user) => user.id !== myId,
				);
			}

			setMembersIsThereMore(response.data["links"]["next"] !== null);
			setMembersCurrentPage(currentPage + 1);
			setMembersCount(total);

			return responseData.data;
		} catch (error) {
			toast.error("An error occurred while loading the members.");
			return [];
		} finally {
			setMembersIsLoading(false);
		}
	}

	async function InitialFetchMembers() {
		setMembersFetched([]);
		setMembersCurrentPage(1);
		setMembersIsThereMore(false);
		setMembersCount(0);
		setMembersIsLoading(true);

		const users = await fetchJoinedUsers(1, true);
		setMembersFetched(users);
	}

	async function FetchMoreMembers() {
		if (MembersIsLoading || !MembersIsThereMore) return;
		const users = await fetchJoinedUsers(MembersCurrentPage);
		setMembersFetched((prev) => [...prev, ...users]);
	}

	async function HandleRoleChange(userId: number, newRoleId: number) {
		try {
			if (newRoleId < 1 || newRoleId > 4) throw new Error("Invalid role"); // Invalid role, do nothing

			const response = await UpdateRoleOfMemberInThread(
				threadId,
				userId,
				newRoleId,
			);
			if (response.status === 200) {
				// Update the local state to reflect the role change
				setMembersFetched((prevMembers) =>
					prevMembers.map((member) =>
						member.id === userId
							? { ...member, role_id: newRoleId }
							: member,
					),
				);
			}
		} catch (error) {
			// console.error("Failed to update role:", error);
			toast.error("Failed to update user's role: " + error);
		}
	}

	async function HandleBanAndUnban(userId: number, shouldBan: boolean) {
		try {
			if (shouldBan) {
				const confirmBan = window.confirm(
					"Biztosan ki szeretnéd bannolni ezt a felhasználót? Ez a művelet visszavonhatatlan.",
				);
				if (!confirmBan) throw new Error("Ban cancelled by user");

				const response = await BanUserFromThread(threadId, userId);

				if (response.status === 200) {
					toast.success("User has been banned successfully.");
					// Update the local state to reflect the ban
					setMembersFetched((prevMembers) =>
						prevMembers.map((member) =>
							member.id === userId
								? { ...member, role_id: 4 } // Set role to Banned
								: member,
						),
					);
				}
			} else {
				const confirmUnban = window.confirm(
					"Biztosan unbannolni szeretnéd ezt a felhasználót? Ez a művelet visszavonhatatlan.",
				);
				if (!confirmUnban) throw new Error("Unban cancelled by user");
				const response = await UpdateRoleOfMemberInThread(
					threadId,
					userId,
					3, // Set role to Member
				);
				if (response.status === 200) {
					toast.success("User has been unbanned successfully.");
					// Update the local state to reflect the unban
					setMembersFetched((prevMembers) =>
						prevMembers.map((member) =>
							member.id === userId
								? { ...member, role_id: 3 } // Set role to Member
								: member,
						),
					);
				}
			}
		} catch (error) {
			console.error("Failed to ban/unban user:", error);
		}
	}
	/* END OF MEMBERS LIST */

	//Get the current thread data
	async function fetchThreadData(id: number): Promise<ThreadData | null> {
		try {
			const threadRes = (await GetThreadById(id)) as { data: ThreadData };

			setThread(threadRes.data);
			return threadRes.data;
		} catch (err) {
			if (!axios.isAxiosError(err)) {
				toast.error(
					"An unexpected error occurred while loading the community.",
				);
				return null;
			}

			switch (err.response?.status) {
				case 404:
					toast.error("Community not found.");
					navigateFn("/all-communities");
					return null;
				case 401:
					toast.error(
						"Unauthenticated. Please log in and try again.",
					);
					navigateFn("/auth/login", { replace: true });
					return null;
				case 403:
					toast.error(
						"You do not have permission to view this community.",
					);
					navigateFn("/all-communities");
					return null;
				default:
					toast.error(
						"An error occurred while loading the community.",
					);
					return null;
			}
		}
	}

	// Handle join and leave actions
	async function HandleJoin() {
		try {
			await JoinThread(threadId);
			setIsUserJoined(true);
			const myUser = await GetUserProfile(myId)
				.then((res) => res.data)
				.catch(() => null);

			if (myUser) {
				if (myUser.role_id === null || myUser.role_id === undefined) {
					myUser.role_id = 3;
				}
				setMembersFetched((prev) => [myUser!, ...prev]);
				setMembersCount((prev) => prev + 1);
			}
			window.dispatchEvent(new Event("joined-threads-changed"));
		} catch (error) {
			toast.error("An error occurred while joining the community.");
		}
	}

	async function HandleLeave() {
		try {
			await LeaveThread(threadId);
			setIsUserJoined(false);
			setMembersFetched((prev) => prev.filter((u) => u.id !== myId));
			setMembersCount((prev) => prev - 1);
			window.dispatchEvent(new Event("joined-threads-changed"));
		} catch (error) {
			toast.error("An error occurred while leaving the community.");
		}
	}

	useEffect(() => {
		if (Number.isNaN(threadId)) {
			navigateFn("/all-communities");
		}

		async function load() {
			const threadRes = await fetchThreadData(threadId); //Get the thread the user is currently viewing
			if (threadRes === null) return;
			saveRecentThread(threadId, threadRes.name, threadRes.image); //Save the thread to recent threads in local storage

			setIsUserJoined(threadRes.my_role !== null); //Check if the user is a member of the thread
			// console.log("User joined status:", threadRes.my_role !== null);

			await InitialFetchMembers(); //Fetch the members of the thread
		}

		setMembersIsLoading(true);

		load();
	}, [threadId, navigateFn]);

	const saveRecentThread = (
		threadId: number,
		threadName?: string,
		threadImage?: string,
	) => {
		if (!Number.isFinite(threadId)) return;

		try {
			const raw = localStorage.getItem(recentThreadsStorageKey);
			const current: RecentThreadItem[] = raw ? JSON.parse(raw) : [];

			const next: RecentThreadItem[] = [
				{
					id: threadId,
					name: threadName?.trim() || undefined,
					image: threadImage,
				},
				...current.filter((t) => t.id !== threadId),
			].slice(0, 5);

			localStorage.setItem(recentThreadsStorageKey, JSON.stringify(next));
			window.dispatchEvent(new Event("recent-threads-changed"));
		} catch {
			console.error("Failed to save recent thread.");
		}
	};

	const HandleInvite = async () => {
		if (Number.isNaN(threadId)) return;

		try {
			const inviteUrl = new URL(
				`/communities/${threadId}`,
				window.location.origin,
			).toString();
			await (navigator as any).share({ url: inviteUrl });
			return;
		} catch (err) {
			toast.error("Hiba történt az meghívás küldése során.");
			if (axios.isAxiosError(err)) {
				if (err.response?.status === 401) {
					navigateFn("/auth/login", { replace: true });
					return;
				}
			}
		}
	};

	return {
		thread,
		isUserJoined,
		myId,
		handleJoin: HandleJoin,
		handleLeave: HandleLeave,
		handleInvite: HandleInvite,

		members: {
			isLoading: MembersIsLoading,
			hasMore: MembersIsThereMore,
			totalCount: MembersCount,
			fetchedMembers: MembersFetched,
			fetchMoreMembers: FetchMoreMembers,
			handleRoleChange: HandleRoleChange,
			handleBanAndUnban: HandleBanAndUnban,
		},
	};
};
