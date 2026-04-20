import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
	BanUserFromThread,
	GetPostsInThread,
	GetThreadById,
	GetThreadMembers,
	JoinThread,
	LeaveThread,
	UpdateRoleOfMemberInThread,
} from "../../../api/threads";
import {
	CommentOnPostOrReplyToComment,
	DeleteComment,
	GetCommentsForPost,
	GetReplyCommentsForComment,
} from "../../../api/comments";
import { DeletePost } from "../../../api/posts";
import type { NavigateOptions } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GetUserProfile } from "../../../api/users";
import type { CommentData } from "../../../Interfaces/CommentData";
import type { PostAndCommentData } from "../../../Interfaces/PostAndComment";
import type { PostData } from "../../../Interfaces/PostData";
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

export interface DeletePostOrCommentInput {
	isTopLevel: boolean;
	originalPostId: number;
	nodeId: number;
}

export interface CreateCommentInput {
	isTopLevel: boolean;
	originalPostId: number;
	nodeId: number;
	content: string;
}

export interface CommunityPosts {
	isLoading: boolean;
	hasMore: boolean;
	totalCount: number;
	fetchedPosts: PostAndCommentData[];
	fetchMorePosts: () => Promise<void>;
	loadMoreCommentsForComment: (commentId: number) => Promise<void>;
	getSharePageFromEnd: (postId: number) => number | null;
	createComment: (input: CreateCommentInput) => Promise<boolean>;
	deletePostOrComment: (input: DeletePostOrCommentInput) => Promise<void>;
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
	posts: CommunityPosts;
}

const profileStorageKey =
	import.meta.env.VITE_LOCAL_STORAGE_PROFILE_KEY ?? "jedligram_profile";

const AGE_UNIT_TO_SECONDS: Record<string, number> = {
	second: 1,
	minute: 60,
	hour: 60 * 60,
	day: 60 * 60 * 24,
	week: 60 * 60 * 24 * 7,
	month: 60 * 60 * 24 * 30,
	year: 60 * 60 * 24 * 365,
};

const AGE_VALUE_AND_UNIT_REGEX = /^(a|an|one|\d+)\s+([a-z]+)/;

function parseAgeToSeconds(age: string | undefined | null): number {
	// Unknown/missing values are treated as oldest so they naturally sort last.
	if (typeof age !== "string") {
		return Number.POSITIVE_INFINITY;
	}

	const normalizedAge = age.trim().toLowerCase();
	if (!normalizedAge) {
		return Number.POSITIVE_INFINITY;
	}

	if (normalizedAge === "now" || normalizedAge === "just now") {
		return 0;
	}

	const match = normalizedAge.match(AGE_VALUE_AND_UNIT_REGEX);
	if (!match) {
		return Number.POSITIVE_INFINITY;
	}

	const rawValue = match[1];
	const value =
		rawValue === "a" || rawValue === "an" || rawValue === "one"
			? 1
			: Number(rawValue);

	const rawUnit = match[2];
	const unit = rawUnit.endsWith("s") ? rawUnit.slice(0, -1) : rawUnit;
	const unitInSeconds = AGE_UNIT_TO_SECONDS[unit];

	if (!Number.isFinite(value) || !unitInSeconds) {
		return Number.POSITIVE_INFINITY;
	}

	return value * unitInSeconds;
}

function sortNodesByNewest(nodes: PostAndCommentData[]): PostAndCommentData[] {
	// Sort every level of the tree recursively to keep nested replies consistent.
	return [...nodes]
		.map((node) => ({
			...node,
			replies: Array.isArray(node.replies)
				? sortNodesByNewest(node.replies)
				: node.replies,
		}))
		.sort((a, b) => {
			const ageDifference =
				parseAgeToSeconds(a.age) - parseAgeToSeconds(b.age);

			if (ageDifference !== 0) return ageDifference;

			return b.id - a.id;
		});
}

function mergePostsWithComments(
	posts: PostData[],
	commentsByPost: Record<number, PostAndCommentData[]>,
): PostAndCommentData[] {
	return posts.map((post) => ({
		...post,
		replies: commentsByPost[post.id] ?? [],
	}));
}

function mergeRepliesById(
	existingReplies: PostAndCommentData[] | undefined,
	fetchedReplies: PostAndCommentData[],
): PostAndCommentData[] {
	// Merge by ID so re-fetching replies never duplicates existing items.
	const currentReplies = Array.isArray(existingReplies)
		? existingReplies
		: [];
	const repliesById = new Map<number, PostAndCommentData>();

	for (const reply of [...currentReplies, ...fetchedReplies]) {
		repliesById.set(reply.id, reply);
	}

	return Array.from(repliesById.values());
}

function attachRepliesToCommentById(
	nodes: PostAndCommentData[],
	targetCommentId: number,
	fetchedReplies: PostAndCommentData[],
): PostAndCommentData[] {
	return nodes.map((node) => {
		if (node.id === targetCommentId) {
			return {
				...node,
				replies: mergeRepliesById(node.replies, fetchedReplies),
			};
		}

		if (!Array.isArray(node.replies) || node.replies.length === 0) {
			return node;
		}

		return {
			...node,
			replies: attachRepliesToCommentById(
				node.replies,
				targetCommentId,
				fetchedReplies,
			),
		};
	});
}

function markCommentAsDeleted(
	nodes: PostAndCommentData[],
	targetCommentId: number,
): PostAndCommentData[] {
	return nodes.map((node) => {
		if (node.id === targetCommentId) {
			return {
				...node,
				content: "[deleted]",
				image: "",
			};
		}

		if (!Array.isArray(node.replies) || node.replies.length === 0) {
			return node;
		}

		return {
			...node,
			replies: markCommentAsDeleted(node.replies, targetCommentId),
		};
	});
}

function appendReplyToCommentById(
	nodes: PostAndCommentData[],
	targetCommentId: number,
	newReply: PostAndCommentData,
): PostAndCommentData[] {
	// Walk the comment tree and insert the new reply into the matched parent.
	return nodes.map((node) => {
		if (node.id === targetCommentId) {
			const existingReplies = Array.isArray(node.replies)
				? node.replies
				: [];
			const nextReplies = sortNodesByNewest([
				...existingReplies,
				newReply,
			]);

			return {
				...node,
				replies: nextReplies,
				replies_count: Math.max(
					(node.replies_count ?? 0) + 1,
					nextReplies.length,
				),
			};
		}

		if (!Array.isArray(node.replies) || node.replies.length === 0) {
			return node;
		}

		return {
			...node,
			replies: appendReplyToCommentById(
				node.replies,
				targetCommentId,
				newReply,
			),
		};
	});
}

function mergePostsById(
	currentPosts: PostAndCommentData[],
	incomingPosts: PostAndCommentData[],
): PostAndCommentData[] {
	return sortNodesByNewest(
		Array.from(
			new Map(
				[...currentPosts, ...incomingPosts].map((post) => [
					post.id,
					post,
				]),
			).values(),
		),
	);
}

function extractPageFromLink(linkValue: unknown): number | null {
	if (typeof linkValue !== "string" || !linkValue) {
		return null;
	}

	try {
		const url = new URL(linkValue, window.location.origin);
		const parsed = Number(url.searchParams.get("page"));
		if (!Number.isFinite(parsed) || parsed < 1) {
			return null;
		}

		return Math.floor(parsed);
	} catch {
		return null;
	}
}

function extractTotalPages(responsePayload: unknown): number {
	if (!responsePayload || typeof responsePayload !== "object") {
		return 1;
	}

	const payloadRecord = responsePayload as Record<string, unknown>;
	const meta =
		payloadRecord.meta && typeof payloadRecord.meta === "object"
			? (payloadRecord.meta as Record<string, unknown>)
			: null;

	const metaPageCandidates = [
		meta?.last_page,
		meta?.lastPage,
		meta?.total_pages,
		meta?.totalPages,
	];

	for (const candidate of metaPageCandidates) {
		const parsed = Number(candidate);
		if (Number.isFinite(parsed) && parsed >= 1) {
			return Math.floor(parsed);
		}
	}

	const links =
		payloadRecord.links && typeof payloadRecord.links === "object"
			? (payloadRecord.links as Record<string, unknown>)
			: null;

	const fromLastLink = extractPageFromLink(links?.last);
	if (fromLastLink !== null) {
		return fromLastLink;
	}

	const fromCurrentLink = extractPageFromLink(links?.self);
	if (fromCurrentLink !== null) {
		return fromCurrentLink;
	}

	return 1;
}

function extractTotalCount(responsePayload: unknown): number {
	if (!responsePayload || typeof responsePayload !== "object") {
		return 0;
	}

	const payloadRecord = responsePayload as Record<string, unknown>;
	const meta =
		payloadRecord.meta && typeof payloadRecord.meta === "object"
			? (payloadRecord.meta as Record<string, unknown>)
			: null;

	const metaTotalCandidates = [
		meta?.total,
		meta?.total_count,
		meta?.totalCount,
	];

	for (const candidate of metaTotalCandidates) {
		const parsed = Number(candidate);
		if (Number.isFinite(parsed) && parsed >= 0) {
			return Math.floor(parsed);
		}
	}

	if (Array.isArray(payloadRecord.data)) {
		return payloadRecord.data.length;
	}

	return 0;
}

export const useCommunity = (
	threadId: number,
	navigateFn: (path: string, options?: NavigateOptions) => void,
): UseCommunityReturn => {
	const { t } = useTranslation();
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

	/* POSTS LIST */
	const [PostsFetched, setPostsFetched] = useState<PostAndCommentData[]>([]);
	const [PostsIsThereMore, setPostsIsThereMore] = useState(false);
	const [PostsIsLoading, setPostsIsLoading] = useState(false);
	const [PostsCurrentPage, setPostsCurrentPage] = useState(1);
	const [PostsCount, setPostsCount] = useState(0);
	const postsTotalPagesRef = useRef(1);
	const postPageByIdRef = useRef<Map<number, number>>(new Map());
	const loadedMoreCommentIdsRef = useRef<Set<number>>(new Set());

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
		} catch {
			toast.error(t("community.messages.members_load_error"));
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

	async function loadCommentsByPost(
		posts: PostData[],
	): Promise<Record<number, PostAndCommentData[]>> {
		const entries = await Promise.all(
			posts.map(async (post) => {
				const commentsResponse = (await GetCommentsForPost(
					post.id,
				)) as {
					data: CommentData[];
				};

				return [
					post.id,
					commentsResponse.data as PostAndCommentData[],
				] as const;
			}),
		);

		return Object.fromEntries(entries);
	}

	async function rehydrateLoadedReplies(
		nodes: PostAndCommentData[],
	): Promise<PostAndCommentData[]> {
		const loadedCommentIds = Array.from(loadedMoreCommentIdsRef.current);

		if (loadedCommentIds.length === 0) {
			return nodes;
		}

		let hasRehydrateFailure = false;

		const fetchedReplyGroups = await Promise.all(
			loadedCommentIds.map(async (commentId) => {
				try {
					const replyCommentsResponse =
						(await GetReplyCommentsForComment(commentId)) as {
							data: CommentData[];
						};

					return {
						commentId,
						replies:
							replyCommentsResponse.data as PostAndCommentData[],
					};
				} catch (error) {
					console.error(
						"Failed to rehydrate nested replies for comment:",
						commentId,
						error,
					);
					hasRehydrateFailure = true;

					return {
						commentId,
						replies: [] as PostAndCommentData[],
					};
				}
			}),
		);

		if (hasRehydrateFailure) {
			toast.error(t("community.messages.replies_reload_partial_error"));
		}

		let nextNodes = nodes;

		for (const group of fetchedReplyGroups) {
			nextNodes = attachRepliesToCommentById(
				nextNodes,
				group.commentId,
				group.replies,
			);
		}

		return nextNodes;
	}

	async function fetchPosts(page: number = PostsCurrentPage) {
		setPostsIsLoading(true);

		try {
			const response = await GetPostsInThread(threadId, page);
			const responseData = response.data as {
				data: PostData[];
			};
			const totalPages = extractTotalPages(response.data);
			postsTotalPagesRef.current = totalPages;
			setPostsCount(extractTotalCount(response.data));

			for (const post of responseData.data) {
				postPageByIdRef.current.set(post.id, page);
			}

			setPostsCurrentPage(page + 1);
			setPostsIsThereMore(response.data["links"]["next"] !== null);

			const commentsByPost = await loadCommentsByPost(responseData.data);
			const mergedData = mergePostsWithComments(
				responseData.data,
				commentsByPost,
			);
			const mergedWithLoadedReplies =
				await rehydrateLoadedReplies(mergedData);

			return sortNodesByNewest(mergedWithLoadedReplies);
		} catch (error) {
			console.error("Failed to load posts:", error);
			toast.error(t("community.messages.posts_load_error"));
			return [];
		} finally {
			setPostsIsLoading(false);
		}
	}

	async function InitialFetchPosts(resetLoadedReplies: boolean = false) {
		setPostsFetched([]);
		setPostsCurrentPage(1);
		setPostsIsThereMore(false);
		setPostsIsLoading(true);
		setPostsCount(0);
		postPageByIdRef.current.clear();
		postsTotalPagesRef.current = 1;

		if (resetLoadedReplies) {
			loadedMoreCommentIdsRef.current.clear();
		}

		const posts = await fetchPosts(1);
		setPostsFetched(posts);
	}

	async function FetchMorePosts() {
		if (PostsIsLoading || !PostsIsThereMore) {
			return;
		}

		const posts = await fetchPosts(PostsCurrentPage);
		if (posts.length === 0) {
			return;
		}

		setPostsFetched((prevPosts) => mergePostsById(prevPosts, posts));
	}

	async function LoadPagesForSharedTarget() {
		const hash = window.location.hash;
		if (!hash) {
			return;
		}

		const decodedHash = decodeURIComponent(hash.slice(1));
		if (!decodedHash.startsWith("post-")) {
			return;
		}

		const params = new URLSearchParams(window.location.search);
		const pageFromEndRaw = params.get("pfe") ?? params.get("pageFromEnd");

		if (!pageFromEndRaw) {
			return;
		}

		const pageFromEnd = Number(pageFromEndRaw);
		if (!Number.isFinite(pageFromEnd) || pageFromEnd < 1) {
			return;
		}

		const targetPage = Math.max(
			1,
			postsTotalPagesRef.current - Math.floor(pageFromEnd) + 1,
		);

		if (targetPage <= 1) {
			return;
		}

		for (let page = 2; page <= targetPage; page += 1) {
			const posts = await fetchPosts(page);
			if (posts.length === 0) {
				break;
			}

			setPostsFetched((prevPosts) => mergePostsById(prevPosts, posts));
		}
	}

	function GetSharePageFromEndForPost(postId: number): number | null {
		const pageFromStart = postPageByIdRef.current.get(postId);
		if (!pageFromStart) {
			return null;
		}

		const totalPages = Math.max(postsTotalPagesRef.current, pageFromStart);
		return Math.max(1, totalPages - pageFromStart + 1);
	}

	async function LoadMoreCommentsForComment(commentId: number) {
		try {
			const replyCommentsResponse = (await GetReplyCommentsForComment(
				commentId,
			)) as {
				data: CommentData[];
			};
			const fetchedReplies =
				replyCommentsResponse.data as PostAndCommentData[];

			loadedMoreCommentIdsRef.current.add(commentId);

			setPostsFetched((currentNodes) => {
				const nodesWithLoadedReplies = attachRepliesToCommentById(
					currentNodes,
					commentId,
					fetchedReplies,
				);

				return sortNodesByNewest(nodesWithLoadedReplies);
			});
		} catch (error) {
			console.error(
				"Failed to load nested replies for comment:",
				commentId,
				error,
			);
			toast.error(t("community.messages.replies_load_error"));
		}
	}

	async function HandleDeletePostOrComment({
		isTopLevel,
		originalPostId,
		nodeId,
	}: DeletePostOrCommentInput) {
		try {
			const response = isTopLevel
				? await DeletePost(originalPostId)
				: await DeleteComment(originalPostId, nodeId);

			if (response.status === 200) {
				setPostsFetched((prevPosts) => {
					if (isTopLevel) {
						return prevPosts.map((post) =>
							post.id === originalPostId
								? { ...post, content: "[deleted]", image: "" }
								: post,
						);
					}

					return prevPosts.map((post) => {
						if (post.id !== originalPostId) {
							return post;
						}

						return {
							...post,
							replies: markCommentAsDeleted(
								post.replies ?? [],
								nodeId,
							),
						};
					});
				});
			}
		} catch (error) {
			console.error("Error deleting post/comment:", error);
			toast.error(t("community.messages.delete_error"));
		}
	}

	async function HandleCreateComment({
		isTopLevel,
		originalPostId,
		nodeId,
		content,
	}: CreateCommentInput): Promise<boolean> {
		const trimmedContent = content.trim();

		if (!trimmedContent) {
			return false;
		}

		try {
			const response = isTopLevel
				? await CommentOnPostOrReplyToComment(
						originalPostId,
						trimmedContent,
					)
				: await CommentOnPostOrReplyToComment(
						originalPostId,
						trimmedContent,
						nodeId,
					);

			if (response.status < 200 || response.status >= 300) {
				return false;
			}

			// The backend may return wrapped payloads (e.g. { data: ... } or { comment: ... }).
			const responsePayload = response.data as unknown;
			let payload: Partial<PostAndCommentData> = {};

			if (responsePayload && typeof responsePayload === "object") {
				const responseRecord = responsePayload as Record<
					string,
					unknown
				>;
				const extractedPayload =
					responseRecord.data ??
					responseRecord.comment ??
					responsePayload;

				if (extractedPayload && typeof extractedPayload === "object") {
					payload = extractedPayload as Partial<PostAndCommentData>;
				}
			}

			const fallbackUser: UserData = {
				id: myId ?? 0,
				email: "",
				username: "",
				password: "",
				name: "",
				image_url: "",
			};

			// Temporary negative IDs prevent key collisions if the API omits a comment ID.
			const fallbackCommentId = -(
				Date.now() + Math.floor(Math.random() * 1000)
			);

			const newComment: PostAndCommentData = {
				id:
					typeof payload.id === "number"
						? payload.id
						: fallbackCommentId,
				content:
					typeof payload.content === "string"
						? payload.content
						: trimmedContent,
				age: typeof payload.age === "string" ? payload.age : "now",
				user:
					payload.user && typeof payload.user === "object"
						? (payload.user as UserData)
						: fallbackUser,
				is_mine: payload.is_mine ?? true,
				my_vote: payload.my_vote ?? null,
				depth: payload.depth,
				replies_count:
					typeof payload.replies_count === "number"
						? payload.replies_count
						: 0,
				replies: Array.isArray(payload.replies) ? payload.replies : [],
				thread_id: payload.thread_id,
				score: payload.score,
				image: payload.image,
			};

			setPostsFetched((prevPosts) =>
				prevPosts.map((post) => {
					if (post.id !== originalPostId) {
						return post;
					}

					if (isTopLevel) {
						// Direct comment on a post: append to the post's first-level replies.
						return {
							...post,
							replies: sortNodesByNewest([
								...(post.replies ?? []),
								newComment,
							]),
						};
					}

					// Reply to a comment: recursively insert at the matched comment node.
					return {
						...post,
						replies: appendReplyToCommentById(
							post.replies ?? [],
							nodeId,
							newComment,
						),
					};
				}),
			);

			return true;
		} catch (error) {
			console.error("Failed to create comment:", error);
			toast.error(t("community.messages.comment_send_error"));
			return false;
		}
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
			console.error("Failed to update role:", error);
			toast.error(t("community.messages.role_update_error"));
		}
	}

	async function HandleBanAndUnban(userId: number, shouldBan: boolean) {
		try {
			if (shouldBan) {
				const confirmBan = window.confirm(
					t("community.messages.ban_confirm"),
				);
				if (!confirmBan) throw new Error("Ban cancelled by user");

				const response = await BanUserFromThread(threadId, userId);

				if (response.status === 200) {
					toast.success(t("community.messages.ban_success"));
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
					t("community.messages.unban_confirm"),
				);
				if (!confirmUnban) throw new Error("Unban cancelled by user");
				const response = await UpdateRoleOfMemberInThread(
					threadId,
					userId,
					3, // Set role to Member
				);
				if (response.status === 200) {
					toast.success(t("community.messages.unban_success"));
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
				toast.error(t("community.messages.community_load_unexpected"));
				return null;
			}

			switch (err.response?.status) {
				case 404:
					toast.error(t("community.messages.community_not_found"));
					navigateFn("/all-communities");
					return null;
				case 401:
					toast.error(t("community.messages.unauthenticated"));
					navigateFn("/auth/login", { replace: true });
					return null;
				case 403:
					toast.error(t("community.messages.permission_denied"));
					navigateFn("/all-communities");
					return null;
				default:
					toast.error(t("community.messages.community_load_error"));
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
		} catch {
			toast.error(t("community.messages.join_error"));
		}
	}

	async function HandleLeave() {
		try {
			await LeaveThread(threadId);
			setIsUserJoined(false);
			setMembersFetched((prev) => prev.filter((u) => u.id !== myId));
			setMembersCount((prev) => prev - 1);
			window.dispatchEvent(new Event("joined-threads-changed"));
		} catch {
			toast.error(t("community.messages.leave_error"));
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
			await InitialFetchPosts(true); //Fetch posts and comments for the thread
			await LoadPagesForSharedTarget(); //Preload pages required by deep-link shares.
		}

		setMembersIsLoading(true);
		setPostsIsLoading(true);

		// Keep members and posts in sync whenever the viewed thread changes.
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
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

			if (typeof navigator.share !== "function") {
				toast.error(t("community.messages.share_not_available"));
				return;
			}

			await navigator.share({ url: inviteUrl });
			return;
		} catch (err) {
			toast.error(t("community.messages.invite_error"));
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
		posts: {
			isLoading: PostsIsLoading,
			hasMore: PostsIsThereMore,
			totalCount: PostsCount,
			fetchedPosts: PostsFetched,
			fetchMorePosts: FetchMorePosts,
			loadMoreCommentsForComment: LoadMoreCommentsForComment,
			getSharePageFromEnd: GetSharePageFromEndForPost,
			createComment: HandleCreateComment,
			deletePostOrComment: HandleDeletePostOrComment,
		},
	};
};
