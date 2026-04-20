import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ScreenLoader from "../../../Components/Utils/ScreenLoader";
import type { PostAndCommentData } from "../../../Interfaces/PostAndComment";
import type { CommunityPosts } from "../hooks/useCommunity";
import PostItem from "./PostItem";

type Props = {
	id: number;
	isJoined: boolean;
	myRank: number | null;
	posts: CommunityPosts;
};

const PostList = ({ id, isJoined, myRank, posts }: Props) => {
	const { t } = useTranslation();
	const communityId = Number(id ?? 0);
	const postsAndComments = posts.fetchedPosts;

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

			const rootPostId =
				depth === 0 ? node.id : (originalPostId ?? node.id);

			return (
				<PostItem
					key={`${depth}-${node.id}`}
					node={node}
					isJoined={isJoined}
					isTopLevel={depth === 0}
					originalPostId={rootPostId}
					hasReplies={hasReplies}
					avatarSizeStyle={avatarSizeStyle}
					connectorLineStyle={connectorLineStyle}
					communityId={communityId}
					sharePageFromEnd={posts.getSharePageFromEnd(rootPostId)}
					OnLoadMoreComments={() => {
						void posts.loadMoreCommentsForComment(node.id);
					}}
					onCreateComment={posts.createComment}
					onDelete={posts.deletePostOrComment}
					myRank={myRank}
				>
					{hasReplies
						? renderReplies(replies, depth + 1, rootPostId)
						: null}
				</PostItem>
			);
		});
	}

	return (
		<div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold text-white">
					{t("community.post_list.title")}
				</h2>
				{isJoined && (
					<Link
						to={
							id
								? `/communities/${id}/posts/new`
								: "/all-communities"
						}
						className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
					>
						{t("community.post_list.create_post")}
					</Link>
				)}
			</div>
			<div
				className={`space-y-4 overflow-x-auto ${postsAndComments.length === 0 ? "pb-2" : ""}`}
			>
				{!posts.isLoading && postsAndComments.length === 0 && (
					<div className="text-sm text-white/70">
						{t("community.post_list.no_posts")}
					</div>
				)}

				{renderReplies(postsAndComments)}

				{posts.isLoading && (
					<>
						{[1].map((i) => (
							<div key={i} className="animate-pulse p-4 w-full">
								<div className="flex items-start flex-col w-full gap-3">
									<div className="flex items-center gap-4">
										<div
											className="shrink-0 rounded-full bg-white/10"
											style={avatarSizeStyle}
										/>
										<div className="h-3 w-40 rounded bg-white/10" />
										<div className="h-2 w-14 rounded bg-white/10" />
									</div>
									<div className="space-y-4 pl-11 w-full">
										<div className="space-y-2">
											<div className="h-3 w-full rounded bg-white/10" />
											<div className="h-3 w-full rounded bg-white/10" />
											<div className="h-3 w-4/5 rounded bg-white/10" />
										</div>
										<div className="flex gap-2">
											<div className="h-6 w-18 rounded-lg bg-white/10" />
											<div className="h-6 w-6 rounded-lg bg-white/10" />
											<div className="h-6 w-6 rounded-lg bg-white/10" />
										</div>
									</div>
								</div>
							</div>
						))}
					</>
				)}

				{posts.hasMore && (
					<ScreenLoader callback={posts.fetchMorePosts} />
				)}
			</div>
		</div>
	);
};

export default PostList;
