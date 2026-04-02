import { useState, type CSSProperties, type ReactNode } from "react";
import DynamicFAIcon from "../../../Components/Utils/DynamicFaIcon";
import type { PostAndCommentData } from "../../../Interfaces/PostAndComment";
import { VoteOnPost } from "../../../api/vote";

type PostItemProps = {
	node: PostAndCommentData;
	hasReplies: boolean;
	avatarSizeStyle: CSSProperties;
	connectorLineStyle: CSSProperties;
	children?: ReactNode;
};

const PostItem = ({
	node,
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

	return (
		<div className="space-y-4">
			<article>
				{/* Left column area: avatar and thread connector line. */}
				<div className="relative flex items-start gap-2">
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
							<button className="text-white/75 hover:text-white text-sm">
								<DynamicFAIcon exportName="faComment" /> Reply
							</button>
							<button className="text-white/75 hover:text-white text-sm">
								<DynamicFAIcon exportName="faShare" /> Share
							</button>
						</div>
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
