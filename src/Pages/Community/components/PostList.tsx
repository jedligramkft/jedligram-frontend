import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { GetCommentsForPost } from "../../../api/comments";
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

// Parses labels like "5 minutes ago" into elapsed seconds.
// Lower values represent newer content and therefore sort first.
function parseAgeToSeconds(age: string): number {
	const normalizedAge = age.trim().toLowerCase(); // Normalize the age string to handle variations in formatting and casing. eg. "5 Minutes Ago" -> "5 minutes ago"

	if (normalizedAge === "now" || normalizedAge === "just now") {
		return 0;
	}

	const match = normalizedAge.match(AGE_VALUE_AND_UNIT_REGEX); // Extract the numeric value and time unit using regex. The regex captures either a number or common words for "1" (a, an, one) followed by a time unit (second, minute, hour, etc.).
	if (!match) {
		return Number.POSITIVE_INFINITY;
	}

	const rawValue = match[1]; // the first capture group contains either the numeric value or a word representing "1"
	const value =
		rawValue === "a" || rawValue === "an" || rawValue === "one"
			? 1
			: Number(rawValue);

	const rawUnit = match[2];
	const unit = rawUnit.endsWith("s") ? rawUnit.slice(0, -1) : rawUnit; // the second capture group contains the time unit, which may be plural. Normalize to singular form for consistent mapping to the AGE_UNIT_TO_SECONDS dictionary.

	const unitInSeconds = AGE_UNIT_TO_SECONDS[unit]; // Look up the time unit in the conversion map to get its equivalent in seconds. If the unit is not recognized, this will be undefined.
	if (!Number.isFinite(value) || !unitInSeconds) {
		return Number.POSITIVE_INFINITY;
	}

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
			...node, /// the ... spread operator creates a shallow copy of the node to avoid mutating the original data
			replies: Array.isArray(node.replies) // check if the node has a replies array before attempting to sort it
				? sortNodesByNewest(node.replies) // if replies exists, sort them recursively using the same function
				: node.replies, // if no replies, keep it as is (could be undefined or null)
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

const PostList = ({ id, isJoined }: Props) => {
	const [postsAndComments, setPostsAndComments] = useState<
		PostAndCommentData[]
	>([]);
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

	/* Loads all top-level posts for a thread. */
	async function loadPosts(threadId: number): Promise<PostData[]> {
		const postResponse = (await GetPostsInThread(threadId)) as {
			data: PostData[];
		};

		return postResponse.data;
	}

	/*
	 * Fetch comments concurrently for each post and index them by post ID.
	 * This keeps merge logic straightforward and avoids nested lookup loops.
	 */
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

	// Recursively render a post tree: depth 0 is a post, depth > 0 are replies.
	function renderReplies(
		nodes: PostAndCommentData[],
		depth = 0,
		originalPostId?: number,
	): ReactNode {
		if (nodes.length === 0) {
			return null;
		}

		return nodes.map((node) => {
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
		let isActive = true;

		async function load() {
			if (!id) {
				setPostsAndComments([]);
				return;
			}

			const threadId = Number(id);
			if (!Number.isFinite(threadId)) {
				setPostsAndComments([]);
				return;
			}

			const postData = await loadPosts(threadId);
			const commentsByPost = await loadCommentsByPost(postData);
			const mergedData = mergePostsWithComments(postData, commentsByPost);

			if (!isActive) {
				return;
			}

			setPostsAndComments(sortNodesByNewest(mergedData));
		}

		const handleCommentAdded = () => {
			void load();
		};

		window.addEventListener("comment-added", handleCommentAdded);

		void load();

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
