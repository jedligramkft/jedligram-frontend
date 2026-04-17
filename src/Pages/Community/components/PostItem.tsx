import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import DynamicFAIcon from "../../../Components/Utils/DynamicFaIcon";
import type { PostAndCommentData } from "../../../Interfaces/PostAndComment";
import VoteComponent from "./PostItem/VoteComponent";
import SharePost from "./PostItem/SharePost";
import CommentWriter from "./PostItem/CommentWriter";
import { Link } from "react-router";
import { DangerButton, GhostButton } from "../../../Components/Buttons";
import { DeletePost } from "../../../api/posts";
import { DeleteComment } from "../../../api/comments";

type PostItemProps = {
	node: PostAndCommentData;
	originalPostId: number; // The ID of the original top-level post that all comments and replies are ultimately associated with, used for API calls related to commenting and voting.
	isTopLevel: boolean; // Whether this node is a top-level post (true) or a comment reply (false), used for styling decisions.
	communityId: number; // The ID of the community this post belongs to, used for constructing share URLs.
	hasReplies: boolean;
	avatarSizeStyle: CSSProperties;
	connectorLineStyle: CSSProperties;
	myRank: number | null;
	children?: ReactNode;
	OnLoadMoreComments?: () => void;
	isJoined?: boolean;
};

const PostItem = ({
	node,
	originalPostId,
	isTopLevel,
	communityId,
	hasReplies,
	avatarSizeStyle,
	connectorLineStyle,
	myRank,
	children,
	OnLoadMoreComments,
	isJoined,
}: PostItemProps) => {
	const { t } = useTranslation();
	const POST_ID = `post-${node.id}-${originalPostId}`;
	const [commentOpen, setCommentOpen] = useState(false);
	const [isChildrenVisible, setIsChildrenVisible] = useState(true);

	const [localNode, setLocalNode] = useState(node);

	useEffect(() => {
		setLocalNode(node);
	}, [node]);

	async function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
		const btn = e.currentTarget;
		btn.disabled = true;
		if (
			!window.confirm(
				"Biztosan törölni szeretnéd ezt a posztot? Ez a művelet nem visszavonható.",
			)
		)
			return;
		try {
			let resp = null;
			if (isTopLevel) resp = await DeletePost(originalPostId);
			else resp = await DeleteComment(originalPostId, localNode.id);

			if (resp.status === 200) {
				setLocalNode({ ...localNode, content: "[removed]", image: "" });
			}
		} catch (error) {
			console.error("Error deleting post/comment:", error);
			window.alert("Hiba történt a törlés során. Kérlek próbáld újra.");
		} finally {
			btn.disabled = false;
		}
	}

	return (
		<div className="space-y-4">
			<article>
				{/* Left column area: avatar and thread connector line. */}
				<div className="relative flex items-start gap-2" id={POST_ID}>
					{hasReplies ? (
						/* Vertical line starts under the avatar when this node has children. */
						<div
							onClick={() => {
								setIsChildrenVisible(false);
							}}
							className="absolute bottom-0 w-0.5 bg-white/35 cursor-pointer hover:bg-white/75 hover:w-1"
							style={connectorLineStyle}
						/>
					) : null}
					{/* User profile picture. */}
					<img
						src={localNode.user.image_url}
						alt={``}
						className="relative z-10 rounded-full object-cover"
						style={avatarSizeStyle}
					/>
					{/* Main content column for this node. */}
					<div className="flex-1 space-y-3">
						{/* Username and timestamp row. */}
						<div className="flex max-w-full items-center gap-1 overflow-x-auto whitespace-nowrap">
							<Link
								to={`/users/${localNode.user.id}`}
								className="shrink-0 text-white/75 text-sm hover:text-white">
								@{localNode.user.name}
							</Link>
							<span className="shrink-0 text-white/55">·</span>
							<span className="shrink-0 text-xs text-white/55">
								{localNode.age}
							</span>
						</div>
						{/* Comment/post text body. */}
						{localNode.image && (
							<img
								src={localNode.image}
								alt={t("community.post_item.post_image_alt")}
								className="max-h-60 object-contain rounded-lg"
							/>
						)}
						<p className="wrap-anywhere whitespace-pre-wrap">
							{localNode.content}
						</p>
						{/* Voting and action buttons row. */}
						<div className="flex gap-4">
							{/* Upvote and downvote buttons */}
							{localNode.score !== undefined && isTopLevel && (
								<VoteComponent
									id={localNode.id}
									myVote={localNode.my_vote}
									startScore={localNode.score}
								/>
							)}
							<GhostButton
								className={`gap-1 ${commentOpen ? "text-white" : "text-white/75"}`}
								onClick={() => {
									if (!isJoined) return;
									setCommentOpen(true);
								}}>
								<DynamicFAIcon exportName="faComment" />{" "}
								<span className="hidden md:inline">
									{t("community.post_item.reply")}
								</span>
							</GhostButton>
							<SharePost postId={POST_ID} communityId={communityId} />

							{((myRank && myRank <= 2) || localNode.is_mine) &&
								localNode.content !== "[removed]" && (
									<DangerButton
										className="gap-2 ml-auto text-xs"
										onClick={handleDelete}>
										<DynamicFAIcon exportName="faTrash" />
										<span className="hidden md:inline">Törlés</span>
									</DangerButton>
								)}
						</div>
						{commentOpen && (
							<CommentWriter
								isTopLevel={isTopLevel}
								originalPostId={originalPostId}
								nodeId={localNode.id}
								replyToUsername={
									localNode.user.name
										? localNode.user.name
										: t("community.post_item.unknown_author")
								}
								onCommentSent={() => setCommentOpen(false)}
								onCancel={() => setCommentOpen(false)}
							/>
						)}
						{!hasReplies &&
						localNode.replies_count &&
						localNode.replies_count > 0 ? (
							<GhostButton
								className="p-2 pl-0 whitespace-nowrap"
								onClick={() => {
									if (OnLoadMoreComments) {
										OnLoadMoreComments();
									}
								}}>
								<DynamicFAIcon
									exportName="faCirclePlus"
									size="lg"
									className="mr-2"
								/>
								{t("community.post_item.load_comments")}
							</GhostButton>
						) : null}
						{/* Indented container for child replies of this node. */}
						{hasReplies ? (
							<>
								{isChildrenVisible ? (
									<div className="space-y-4 mt-4">{children}</div>
								) : (
									<GhostButton
										onClick={() => {
											setIsChildrenVisible(true);
										}}
										className="p-2 pl-0 whitespace-nowrap">
										<DynamicFAIcon
											exportName="faCirclePlus"
											size="lg"
											className="mr-2"
										/>{" "}
										{t("community.post_item.show_comments")}
									</GhostButton>
								)}
							</>
						) : null}
					</div>
				</div>
			</article>
		</div>
	);
};

export default PostItem;
