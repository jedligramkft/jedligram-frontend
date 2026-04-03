import { useState, type CSSProperties, type ReactNode } from "react";
import DynamicFAIcon from "../../../Components/Utils/DynamicFaIcon";
import type { PostAndCommentData } from "../../../Interfaces/PostAndComment";
import { VoteOnPost } from "../../../api/vote";
import { InputComponent } from "../../../Components/InputFields/InputComponent";
import { TextAreaComponent } from "../../../Components/InputFields/TextAreaComponent";
import { CommentOnPostOrReplyToComment } from "../../../api/comments";

type PostItemProps = {
	node: PostAndCommentData;
	originalPostId: number; // The ID of the original top-level post that all comments and replies are ultimately associated with, used for API calls related to commenting and voting.
	isTopLevel: boolean; // Whether this node is a top-level post (true) or a comment reply (false), used for styling decisions.
	communityId: number; // The ID of the community this post belongs to, used for constructing share URLs.
	hasReplies: boolean;
	avatarSizeStyle: CSSProperties;
	connectorLineStyle: CSSProperties;
	children?: ReactNode;
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
}: PostItemProps) => {
	const [myVote, setMyVote] = useState<1 | -1 | null>(null);

	async function HandleVote(postId: number, isUpvote: boolean) {
		const response = await VoteOnPost(postId, isUpvote);
		if (response.status === 201) {
			if (response.data.is_upvote) {
				setMyVote(1);
			} else {
				setMyVote(-1);
			}
		} else if (response.status === 204) {
			setMyVote(null);
		}
	}

	const [commentContent, setCommentContent] = useState("");
	const [commentOpen, setCommentOpen] = useState(false);

	async function HandleCommentSubmit(postId: number, content: string) {
		if (isTopLevel) {
			await CommentOnPostOrReplyToComment(originalPostId, content);
		} else {
			await CommentOnPostOrReplyToComment(
				originalPostId,
				content,
				postId,
			);
		}
		// TODO - ideally we would want to optimistically update the UI here instead of waiting for a refetch, but that requires some extra logic to insert the new comment into the correct place in the existing tree, so for now we'll just rely on the fact that after submitting a comment, the API will return the updated list of comments which will then be merged and rendered by the existing useEffect in PostList that watches for changes to the active thread ID.
	}

	const postId = `post-${node.id}-${originalPostId}`;

	async function handleShare() {
		if (Number.isNaN(originalPostId)) return;

		try {
			const inviteUrl = new URL(
				`/communities/${communityId}#${postId}`,
				window.location.origin,
			).toString();
			await (navigator as any).share({ url: inviteUrl });
			return;
		} catch (err) {
			console.error("Error sharing post:", err);
		}
	}

	return (
		<div className="space-y-4">
			<article>
				{/* Left column area: avatar and thread connector line. */}
				<div className="relative flex items-start gap-2" id={postId}>
					{hasReplies ? (
						/* Vertical line starts under the avatar when this node has children. */
						<div
							className="pointer-events-none absolute bottom-0 w-0.5 bg-white/35"
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
							<h3 className="shrink-0 text-white/75 text-sm">
								@{node.user.name}
							</h3>
							<span className="shrink-0 text-white/55">·</span>
							<span className="shrink-0 text-xs text-white/55">
								{node.age}
							</span>
						</div>
						{/* Comment/post text body. */}
						<p className="wrap-anywhere">{node.content}</p>
						{/* Voting and action buttons row. */}
						<div className="flex gap-4">
							{/* Upvote and downvote buttons */}
							{node.score !== undefined && (
								<div className="bg-white/10 flex items-center gap-2 px-2 py-1 rounded-xl">
									<button
										onClick={() => {
											HandleVote(node.id, true);
										}}
									>
										<DynamicFAIcon exportName="faAngleUp" />
									</button>
									<span>{node.score + (myVote || 0)}</span>
									<button
										onClick={() => {
											HandleVote(node.id, false);
										}}
									>
										<DynamicFAIcon exportName="faAngleDown" />
									</button>
								</div>
							)}
							<button
								className={`hover:text-white text-sm transition-colors ${commentOpen ? "text-white" : "text-white/75"}`}
								onClick={() => setCommentOpen(true)}
							>
								<DynamicFAIcon exportName="faComment" /> Reply
							</button>
							<button
								className="text-white/75 hover:text-white text-sm transition-colors"
								onClick={handleShare}
							>
								<DynamicFAIcon exportName="faShare" /> Share
							</button>
						</div>
						{commentOpen && (
							<div>
								<TextAreaComponent
									value={commentContent}
									onChange={(e) =>
										setCommentContent(e.target.value)
									}
									placeholder={`Válaszolj @${node.user.name} kommentjére...`}
								/>
								<div
									className="flex gap-2 
									*:mt-2 *:rounded-xl *:border *:border-white/20 *:px-4 *:py-2 *:text-sm *:font-semibold *:text-white/90 *:transition"
								>
									<button
										onClick={() =>
											HandleCommentSubmit(
												node.id,
												commentContent,
											)
										}
										className="bg-blue-500/15 hover:bg-blue-500/20"
									>
										Elküld
									</button>
									<button
										onClick={() => setCommentOpen(false)}
										className="bg-white/5 hover:bg-white/10"
									>
										Mégse
									</button>
								</div>
							</div>
						)}
						{/* Indented container for child replies of this node. */}
						{hasReplies ? (
							<div className="space-y-4 mt-4">{children}</div>
						) : null}
					</div>
				</div>
			</article>
		</div>
	);
};

export default PostItem;
