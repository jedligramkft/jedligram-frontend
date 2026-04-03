import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
	GetCommentsForPost,
	GetReplyCommentsForComment,
} from "../../../api/comments";
import { GetPostsInThread } from "../../../api/threads";
import type { CommentData } from "../../../Interfaces/CommentData";
import type { PostAndCommentData } from "../../../Interfaces/PostAndComment";
import type { PostData } from "../../../Interfaces/PostData";
import PostItem from "./PostItem";

type Props = {
	id: string | undefined;
	isJoined: boolean;
};

// Approximate conversion map so relative age labels can be sorted consistently.
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

/**
 * Convert human-readable age text into elapsed seconds.
 *
 * Walkthrough:
 * 1) Normalize the input so matching is case-insensitive.
 * 2) Fast-path special values like "now".
 * 3) Extract value + unit with regex (e.g. "5" + "minutes").
 * 4) Normalize singular/plural units and map them to seconds.
 * 5) Return Infinity for unknown formats so they naturally sort last.
 */
function parseAgeToSeconds(age: string): number {
	// Normalize casing and surrounding whitespace for predictable parsing.
	const normalizedAge = age.trim().toLowerCase();

	// "now" and "just now" represent the newest possible timestamp.
	if (normalizedAge === "now" || normalizedAge === "just now") {
		return 0;
	}

	// Try to capture value + unit from strings like "2 days ago".
	const match = normalizedAge.match(AGE_VALUE_AND_UNIT_REGEX);
	if (!match) {
		// Unknown age format: keep it at the end when sorting.
		return Number.POSITIVE_INFINITY;
	}

	// Group 1 is the numeric part (or one-word aliases for 1: a/an/one).
	const rawValue = match[1];
	const value =
		rawValue === "a" || rawValue === "an" || rawValue === "one"
			? 1
			: Number(rawValue);

	// Group 2 is the unit; normalize plural units to singular keys.
	const rawUnit = match[2];
	const unit = rawUnit.endsWith("s") ? rawUnit.slice(0, -1) : rawUnit;

	// Convert the normalized unit to seconds via lookup table.
	const unitInSeconds = AGE_UNIT_TO_SECONDS[unit];
	if (!Number.isFinite(value) || !unitInSeconds) {
		// If parsing failed or unit is unsupported, keep it as oldest.
		return Number.POSITIVE_INFINITY;
	}

	// Final elapsed time in seconds. Smaller = newer.
	return value * unitInSeconds;
}

/**
 * Recursively sort every branch (posts and nested replies) from newest to oldest.
 * Implementation notes:
 * - We first recurse into `replies` so children are sorted before parents are compared.
 * - `parseAgeToSeconds` returns the elapsed seconds; smaller = newer (e.g. "5 seconds" -> 5).
 * - The comparator places items with smaller elapsed seconds earlier in the array.
 * - A stable fallback tie-breaker uses `id` (descending) to prefer larger IDs when ages match.
 */
function sortNodesByNewest(nodes: PostAndCommentData[]): PostAndCommentData[] {
	return [...nodes]
		.map((node) => ({
			// Clone each node so we never mutate React state objects in-place.
			...node,
			// Sort child replies first, then sort the current level.
			replies: Array.isArray(node.replies)
				? sortNodesByNewest(node.replies)
				: node.replies,
		}))
		.sort((a, b) => {
			// Compute elapsed seconds for each item. Smaller = more recent.
			const ageDifference =
				parseAgeToSeconds(a.age) - parseAgeToSeconds(b.age);

			// If one item is clearly newer/older, use that ordering.
			if (ageDifference !== 0) return ageDifference;

			// Otherwise, fall back to ID (descending) to keep a predictable order.
			return b.id - a.id;
		});
}

/**
 * Attach comments to their parent posts.
 *
 * This helper returns a new array of `PostAndCommentData` where each post
 * includes a `replies` property containing that post's comments (if any).
 * Responsibilities and guarantees:
 * - Does not mutate input arrays/objects — returns a shallow copy per post.
 * - If no comments exist for a post, `replies` will be an empty array.
 * - Sorting is intentionally left to the caller so merging is a pure mapping step.
 *
 * @param posts - Array of top-level posts returned from the API.
 * @param commentsByPost - Lookup table mapping post IDs to their comments.
 * @returns Array of posts shaped as `PostAndCommentData` with `replies` populated.
 */
function mergePostsWithComments(
	posts: PostData[],
	commentsByPost: Record<number, PostAndCommentData[]>,
): PostAndCommentData[] {
	return posts.map((post) => ({
		// Spread the original post fields so callers still have access to
		// post properties like `id`, `content`, `age`, `user`, `score`.
		...post,

		// Attach the comments array for this post. Use an empty array when
		// the lookup has no entry so the UI can safely iterate over `replies`.
		replies: commentsByPost[post.id] ?? [],
	}));
}

/**
 * Merge existing and newly fetched reply arrays without duplicate IDs.
 *
 * Walkthrough:
 * 1) Normalize current replies to an array.
 * 2) Insert existing + fetched replies into a Map keyed by `id`.
 * 3) Convert map values back to an array for rendering.
 */
function mergeRepliesById(
	existingReplies: PostAndCommentData[] | undefined,
	fetchedReplies: PostAndCommentData[],
): PostAndCommentData[] {
	// Ensure we always merge into a real array.
	const currentReplies = Array.isArray(existingReplies)
		? existingReplies
		: [];
	// Use a map to deduplicate by reply id while keeping the latest object.
	const repliesById = new Map<number, PostAndCommentData>();

	// Existing replies are loaded first; fetched replies then override same IDs.
	for (const reply of [...currentReplies, ...fetchedReplies]) {
		repliesById.set(reply.id, reply);
	}

	// Convert map values back into the array shape expected by the UI.
	return Array.from(repliesById.values());
}

/**
 * Walk a nested post/comment tree and attach fetched replies to one comment node.
 *
 * Walkthrough:
 * 1) Iterate each node at the current level.
 * 2) If node id matches target comment id, merge replies into that node.
 * 3) If no children exist, return node unchanged.
 * 4) Otherwise recurse into child replies and rebuild the node.
 *
 * This function is immutable: it always returns new objects/arrays where needed.
 */
function attachRepliesToCommentById(
	nodes: PostAndCommentData[],
	targetCommentId: number,
	fetchedReplies: PostAndCommentData[],
): PostAndCommentData[] {
	return nodes.map((node) => {
		// Target node found: attach/merge freshly loaded replies.
		if (node.id === targetCommentId) {
			return {
				...node,
				replies: mergeRepliesById(node.replies, fetchedReplies),
			};
		}

		// Leaf node: nothing else to traverse.
		if (!Array.isArray(node.replies) || node.replies.length === 0) {
			return node;
		}

		// Recurse into child branch and rebuild this node with updated children.
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

/**
 * Community post list container.
 *
 * Responsibilities:
 * - Fetch posts and their comments for the current thread.
 * - Keep data sorted newest-to-oldest.
 * - Support loading deeper replies on demand.
 * - Preserve expanded "load more" state during refreshes.
 */
const PostList = ({ id, isJoined }: Props) => {
	const [postsAndComments, setPostsAndComments] = useState<
		PostAndCommentData[]
	>([]);
	// Stores comment IDs for which the user already clicked "load more".
	// We use a ref so these IDs survive rerenders and async reload cycles.
	const loadedMoreCommentIdsRef = useRef<Set<number>>(new Set());
	const communityId = Number(id ?? 0);

	// Change this value to resize avatars; connector line alignment updates automatically.
	const avatarSizePx = 28;

	const avatarSizeStyle = {
		width: `${avatarSizePx}px`,
		height: `${avatarSizePx}px`,
	};

	const connectorLineStyle = {
		left: `${avatarSizePx / 2}px`,
		top: `${avatarSizePx}px`,
		transform: "translateX(-50%)",
	};

	/**
	 * Load all top-level posts for the active thread.
	 * This only fetches posts; comments are fetched separately in `loadCommentsByPost`.
	 */
	async function loadPosts(threadId: number): Promise<PostData[]> {
		// API returns a generic response wrapper; we narrow to expected payload.
		const postResponse = (await GetPostsInThread(threadId)) as {
			data: PostData[];
		};

		// Return just the post array for downstream processing.
		return postResponse.data;
	}

	/**
	 * Fetch comments for every post and index them by post id.
	 *
	 * Walkthrough:
	 * 1) Fire all comment requests concurrently with Promise.all.
	 * 2) Build [postId, comments[]] tuples.
	 * 3) Convert tuples into a lookup object for O(1) merge access.
	 */
	async function loadCommentsByPost(
		posts: PostData[],
	): Promise<Record<number, PostAndCommentData[]>> {
		const entries = await Promise.all(
			posts.map(async (post) => {
				// Fetch the flat/nested comment payload for this post.
				const commentsResponse = (await GetCommentsForPost(
					post.id,
				)) as {
					data: CommentData[];
				};

				// Return tuple format for Object.fromEntries below.
				return [
					post.id,
					commentsResponse.data as PostAndCommentData[],
				] as const;
			}),
		);

		// Example shape: { 101: [...comments], 102: [...comments] }
		return Object.fromEntries(entries);
	}

	/**
	 * Load nested replies for a single comment when the user clicks "hidden comments".
	 *
	 * Walkthrough:
	 * 1) Request replies for the selected comment id.
	 * 2) Remember this comment id as expanded.
	 * 3) Merge fetched replies into the existing tree.
	 * 4) Re-sort tree to keep newest-first ordering consistent.
	 */
	async function loadMoreCommentsForComment(commentId: number) {
		try {
			// Fetch only the next level for this specific comment.
			const replyCommentsResponse = (await GetReplyCommentsForComment(
				commentId,
			)) as {
				data: CommentData[];
			};
			// Cast into shared tree node shape used by renderer.
			const fetchedReplies =
				replyCommentsResponse.data as PostAndCommentData[];

			// Mark this thread as expanded so it can be restored on refresh.
			loadedMoreCommentIdsRef.current.add(commentId);

			// Merge replies into the current state tree immutably.
			setPostsAndComments((currentNodes) => {
				const nodesWithLoadedReplies = attachRepliesToCommentById(
					currentNodes,
					commentId,
					fetchedReplies,
				);

				// Keep visible tree sorted after insertion.
				return sortNodesByNewest(nodesWithLoadedReplies);
			});
		} catch (error) {
			// Non-blocking failure: keep UI usable and log diagnostics.
			console.error(
				"Failed to load nested replies for comment:",
				commentId,
				error,
			);
		}
	}

	/**
	 * Re-apply all previously expanded comment branches after a full reload.
	 * This prevents expanded threads from collapsing when post/comment data refreshes.
	 */
	async function rehydrateLoadedReplies(
		nodes: PostAndCommentData[],
	): Promise<PostAndCommentData[]> {
		// Snapshot the expanded ids we want to restore.
		const loadedCommentIds = Array.from(loadedMoreCommentIdsRef.current);

		// Nothing expanded yet: return original tree unchanged.
		if (loadedCommentIds.length === 0) {
			return nodes;
		}

		// Fetch reply groups for all expanded comments in parallel.
		const fetchedReplyGroups = await Promise.all(
			loadedCommentIds.map(async (commentId) => {
				try {
					const replyCommentsResponse =
						(await GetReplyCommentsForComment(commentId)) as {
							data: CommentData[];
						};

					// Return reply payload grouped by the original comment id.
					return {
						commentId,
						replies:
							replyCommentsResponse.data as PostAndCommentData[],
					};
				} catch (error) {
					// Keep rehydration resilient even if one request fails.
					console.error(
						"Failed to rehydrate nested replies for comment:",
						commentId,
						error,
					);

					return {
						commentId,
						replies: [] as PostAndCommentData[],
					};
				}
			}),
		);

		// Apply every fetched group to the tree one-by-one.
		let nextNodes = nodes;

		for (const group of fetchedReplyGroups) {
			// Merge each reply group into its target comment node.
			nextNodes = attachRepliesToCommentById(
				nextNodes,
				group.commentId,
				group.replies,
			);
		}

		// Return the fully rehydrated tree.
		return nextNodes;
	}

	/**
	 * Render the post/comment tree recursively.
	 * depth=0 means top-level post; depth>0 means nested reply.
	 */
	function renderReplies(
		nodes: PostAndCommentData[],
		depth = 0,
		originalPostId?: number,
	): ReactNode {
		// Base case: nothing to render at this level.
		if (nodes.length === 0) {
			return null;
		}

		return nodes.map((node) => {
			// Normalize children to an array to simplify branch logic.
			const replies = Array.isArray(node.replies) ? node.replies : [];
			const hasReplies = replies.length > 0;

			// Keep the root post id available for nested reply actions.
			const rootPostId =
				depth === 0 ? node.id : (originalPostId ?? node.id);

			return (
				<PostItem
					key={`${depth}-${node.id}`}
					node={node}
					isTopLevel={depth === 0}
					originalPostId={rootPostId}
					hasReplies={hasReplies}
					avatarSizeStyle={avatarSizeStyle}
					connectorLineStyle={connectorLineStyle}
					communityId={communityId}
					OnLoadMoreComments={() => {
						void loadMoreCommentsForComment(node.id);
					}}
				>
					{hasReplies
						? renderReplies(replies, depth + 1, rootPostId)
						: null}
				</PostItem>
			);
		});
	}

	useEffect(() => {
		// Reload whenever thread changes or when a new comment is posted.
		// `isActive` prevents state updates after unmount/race conditions.
		let isActive = true;

		// Reset the expanded-thread tracker when the active thread changes.
		loadedMoreCommentIdsRef.current.clear();

		// Full reload pipeline: posts -> comments -> merge -> rehydrate -> sort -> set state.
		async function load() {
			// If there is no thread id in route params, clear the view.
			if (!id) {
				setPostsAndComments([]);
				return;
			}

			// Validate that route param can be converted into a numeric thread id.
			const threadId = Number(id);
			if (!Number.isFinite(threadId)) {
				setPostsAndComments([]);
				return;
			}

			// 1) Fetch posts.
			const postData = await loadPosts(threadId);
			// 2) Fetch comments for each post.
			const commentsByPost = await loadCommentsByPost(postData);
			// 3) Attach comments to posts.
			const mergedData = mergePostsWithComments(postData, commentsByPost);
			// 4) Rehydrate previously expanded comment branches.
			const mergedWithLoadedReplies =
				await rehydrateLoadedReplies(mergedData);

			// Guard against stale async completion after unmount.
			if (!isActive) {
				return;
			}

			// 5) Ensure newest-first ordering before rendering.
			setPostsAndComments(sortNodesByNewest(mergedWithLoadedReplies));
		}

		// Trigger reload when another component dispatches "comment-added".
		const handleCommentAdded = () => {
			void load();
		};

		// Subscribe to external refresh events and perform initial load.
		window.addEventListener("comment-added", handleCommentAdded);

		void load();

		// Cleanup avoids duplicate listeners and stale async state updates.
		return () => {
			isActive = false;
			window.removeEventListener("comment-added", handleCommentAdded);
		};
	}, [id]);

	return (
		<div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold text-white">Posztok</h2>
				{isJoined && (
					<Link
						to={
							id
								? `/communities/${id}/posts/new`
								: "/all-communities"
						}
						className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
					>
						{/* {t("community.post_list.create_post")} */}
						Új poszt
					</Link>
				)}
			</div>
			<div
				className={`space-y-4 overflow-x-auto ${postsAndComments.length === 0 ? "pb-2" : ""}`}
			>
				{postsAndComments.length === 0 && (
					<div className="text-sm text-white/70">
						{/* {t("community.post_list.no_posts")} */}
						Nincsenek posztok. Legyél te az első, aki megoszt
						valamit a közösségben!
					</div>
				)}

				{renderReplies(postsAndComments)}
			</div>
		</div>
	);
};

export default PostList;
