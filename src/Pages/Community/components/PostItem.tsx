import { useState, type CSSProperties, type ReactNode } from "react";
import DynamicFAIcon from "../../../Components/Utils/DynamicFaIcon";
import type { PostAndCommentData } from "../../../Interfaces/PostAndComment";
import VoteComponent from "./PostItem/VoteComponent";
import SharePost from "./PostItem/SharePost";
import CommentWriter from "./PostItem/CommentWriter";
import { Link } from "react-router";
import { GhostButton } from "../../../Components/Buttons";

type PostItemProps = {
	node: PostAndCommentData;
	originalPostId: number; // The ID of the original top-level post that all comments and replies are ultimately associated with, used for API calls related to commenting and voting.
	isTopLevel: boolean; // Whether this node is a top-level post (true) or a comment reply (false), used for styling decisions.
	communityId: number; // The ID of the community this post belongs to, used for constructing share URLs.
	hasReplies: boolean;
	avatarSizeStyle: CSSProperties;
	connectorLineStyle: CSSProperties;
	children?: ReactNode;
	OnLoadMoreComments?: () => void;
};

const PostItem = ({
	node,
	originalPostId,
	isTopLevel,
	communityId,
	hasReplies,
	avatarSizeStyle,
	connectorLineStyle,
	children,
	OnLoadMoreComments,
}: PostItemProps) => {
	const POST_ID = `post-${node.id}-${originalPostId}`;
	const [commentOpen, setCommentOpen] = useState(false);
	const [isChildrenVisible, setIsChildrenVisible] = useState(true);

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
						src={node.user.image_url}
						alt={``}
						className="relative z-10 rounded-full object-cover"
						style={avatarSizeStyle}
					/>
					{/* Main content column for this node. */}
					<div className="flex-1 space-y-3">
						{/* Username and timestamp row. */}
						<div className="flex max-w-full items-center gap-1 overflow-x-auto whitespace-nowrap">
							<Link
								to={`/users/${node.user.id}`}
								className="shrink-0 text-white/75 text-sm hover:text-white"
							>
								@{node.user.name}
							</Link>
							<span className="shrink-0 text-white/55">·</span>
							<span className="shrink-0 text-xs text-white/55">
								{node.age}
							</span>
						</div>
						{/* Comment/post text body. */}
						{node.image && (
							<img
								src={node.image}
								alt="Post image"
								className="max-h-60 object-contain rounded-lg"
							/>
						)}
						<p className="wrap-anywhere">{node.content}</p>
						{/* Voting and action buttons row. */}
						<div className="flex gap-4">
							{/* Upvote and downvote buttons */}
							{node.score !== undefined && isTopLevel && (
								<VoteComponent
									id={node.id}
									startScore={node.score}
								/>
							)}
							<GhostButton
								className={`gap-1 ${commentOpen ? "text-white" : "text-white/75"}`}
								onClick={() => setCommentOpen(true)}
							>
								<DynamicFAIcon exportName="faComment" /> Reply
							</GhostButton>
							<SharePost
								postId={POST_ID}
								communityId={communityId}
							/>
						</div>
						{commentOpen && (
							<CommentWriter
								isTopLevel={isTopLevel}
								originalPostId={originalPostId}
								nodeId={node.id}
								replyToUsername={
									node.user.name ? node.user.name : "unknown"
								}
								onCommentSent={() => setCommentOpen(false)}
								onCancel={() => setCommentOpen(false)}
							/>
						)}
						{!hasReplies &&
						node.replies_count &&
						node.replies_count > 0 ? (
							<GhostButton
								className="p-2 pl-0"
								onClick={() => {
									if (OnLoadMoreComments) {
										OnLoadMoreComments();
									}
								}}
							>
								<DynamicFAIcon
									exportName="faCirclePlus"
									size="lg"
									className="mr-2"
								/>
								{node.replies_count
									? `Hozzásólások `
									: `${node.replies_count} hozzászólás `}
								betöltése
							</GhostButton>
						) : null}
						{/* Indented container for child replies of this node. */}
						{hasReplies ? (
							<>
								{isChildrenVisible ? (
									<div className="space-y-4 mt-4">
										{children}
									</div>
								) : (
									<GhostButton
										onClick={() => {
											setIsChildrenVisible(true);
										}}
										className="text-sm text-white/75 cursor-pointer hover:text-white transition p-2 pl-0 flex items-center justify-center"
									>
										<DynamicFAIcon
											exportName="faCirclePlus"
											size="lg"
											className="mr-2"
										/>{" "}
										{node.replies_count
											? "Hozzászólások "
											: `${node.replies_count} hozzászólás `}
										megjelenítése
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
