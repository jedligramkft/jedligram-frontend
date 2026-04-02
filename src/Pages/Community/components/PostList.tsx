import { useEffect, useState, type ReactNode } from "react";
import { GetPostsInThread } from "../../../api/threads";
import type { PostData } from "../../../Interfaces/PostData";
import type { CommentData } from "../../../Interfaces/CommentData";
import { GetCommentsForPost } from "../../../api/comments";
import type { PostAndCommentData } from "../../../Interfaces/PostAndComment";
// import { VoteOnPost } from "../../../api/vote";
import PostItem from "./PostItem";

type Props = {
	id: string | undefined;
};

const PostList = (props: Props) => {
	const [postsAndComments, setPostsAndComments] = useState<
		PostAndCommentData[]
	>([]);
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

	/* Loads the posts for a given thread ID */
	async function LoadPosts(id: number) {
		const postResponse = (await GetPostsInThread(id)) as {
			data: PostData[];
		};
		// console.log("Posts in thread:", postResponse.data);
		return postResponse.data;
	}

	/* Loads the comments for each post and returns an object mapping post IDs to their comments */
	async function LoadComments(posts: PostData[]) {
		const entries = await Promise.all(
			posts.map(async (post) => {
				const commentsResponse = (await GetCommentsForPost(
					post.id,
				)) as {
					data: CommentData[];
				};
				// console.log(
				// 	`Comments for post ${post.id}:`,
				// 	commentsResponse.data,
				// );
				return [
					post.id,
					commentsResponse.data as PostAndCommentData[],
				] as const;
			}),
		);
		return Object.fromEntries(entries);
	}

	/* Merges the post data with their corresponding comments and updates the state */
	async function MergePostsAndComments(
		postData: PostData[],
		CommentsByPost: Record<number, PostAndCommentData[]>,
	) {
		const mergedData = postData.map((post) => {
			const postComments = CommentsByPost[post.id] || [];
			return {
				...post,
				replies: postComments,
			};
		});
		setPostsAndComments(mergedData);
	}

	// Recursively render a post tree: depth 0 is a post, depth > 0 are replies.
	function renderReplies(
		nodes: PostAndCommentData[],
		depth = 0,
		originalPostId: number,
	): ReactNode {
		if (!nodes || nodes.length === 0) {
			return null;
		}

		return nodes.map((node) => {
			const hasReplies =
				Array.isArray(node.replies) && node.replies.length > 0; // Check if there are replies to render for this node.

			const originalPostIdForChildren =
				depth === 0 ? node.id : originalPostId; // For top-level posts, the original post ID is the node's own ID. For replies, it is passed down from above.

			if (!hasReplies) {
				console.log(`Post/comment with ID ${node.id} has no replies.`);
			}

			return (
				<PostItem
					key={`${depth}-${node.id}`}
					node={node}
					isTopLevel={depth === 0}
					originalPostId={originalPostIdForChildren} // Pass the original post ID down to all replies for voting/commenting purposes.
					hasReplies={hasReplies}
					avatarSizeStyle={avatarSizeStyle}
					connectorLineStyle={connectorLineStyle}
				>
					{hasReplies
						? renderReplies(
								node.replies as PostAndCommentData[],
								depth + 1,
								originalPostIdForChildren,
							)
						: null}
				</PostItem>
			);
		});
	}

	useEffect(() => {
		// Reload the post/comment tree whenever the active thread id changes.
		async function load() {
			if (!props.id) {
				setPostsAndComments([]);
				return;
			}

			const postData = await LoadPosts(Number(props.id));
			const comments = await LoadComments(postData);

			await MergePostsAndComments(postData, comments);
		}

		load();
	}, [props.id]);

	return (
		<div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
			{/* <div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold text-white">Posztok</h2>
				{props.isJoined ? (
					<Link
						to={
							props.id
								? `/communities/${props.id}/posts/new`
								: "/all-communities"
						}
						className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
					>
						{t("community.post_list.create_post")}
					</Link>
				) : (
					<button
						onClick={props.onJoin}
						className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
					>
						{t("community.post_list.join_to_post")}
					</button>
				)}
			</div> */}
			<div className="space-y-4 overflow-x-auto pb-2">
				{/* {posts.length === 0 && (
					<div className="text-sm text-white/70">
						{t("community.post_list.no_posts")}
					</div>
				)} */}
				{renderReplies(postsAndComments, 1, 0)}
			</div>
		</div>
	);
};

export default PostList;
