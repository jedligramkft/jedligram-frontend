import { Link } from "react-router-dom";
import PostItem from "./PostItem";
import CommentSection from "./CommentSection";

type Props = {
	id?: string;
	isJoined: boolean;
	onJoin: () => void;
	posts: any[];
	votingPostId: number | null;
	onVote: (postId: number, isUpvote: boolean) => void;
	openCommentsPostId: number | null;
	onToggleComments: (postId: number) => void;
	commentsByPostId: Record<number, any[]>;
	commentDraftByPostId: Record<number, string>;
	onSubmitComment: (postId: number) => void;
	setCommentDraft: (postId: number, value: string) => void;
	replyCommentsByCommentId: Record<number, any[]>;
	openRepliesCommentId: number | null;
	openReplyComposerCommentId: number | null;
	replyDraftByCommentId: Record<number, string>;
	onToggleReplies: (commentId: number) => void;
	onReplyClick: (commentId: number, author: string) => void;
	onReplySubmit: (postId: number, commentId: number) => void;
	setReplyDraft: (commentId: number, value: string) => void;
};

const PostList = (props: Props) => (
	<div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
		<div className="flex items-center justify-between">
			<h2 className="text-xl font-semibold text-white">Feed</h2>
			{props.isJoined ? (
				<Link
					to={
						props.id
							? `/communities/${props.id}/posts/new`
							: "/all-communities"
					}
					className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
				>
					Új poszt
				</Link>
			) : (
				<button
					onClick={props.onJoin}
					className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
				>
					Csatlakozás a posztoláshoz
				</button>
			)}
		</div>
		<div className="mt-5 space-y-4">
			{props.posts.length === 0 && (
				<div className="text-sm text-white/70">Nincs még poszt.</div>
			)}
			{props.posts.map((post, idx) => {
				const postId = Number(post.id);
				const isOpen = props.openCommentsPostId === postId;
				return (
					<PostItem
						key={post.id || idx}
						post={post}
						postId={postId}
						isVoting={props.votingPostId === postId}
						score={post.score || 0}
						isCommentsOpen={isOpen}
						onToggleComments={props.onToggleComments}
						onVote={props.onVote}
					>
						{isOpen && (
							<CommentSection
								postId={postId}
								commentsByPostId={props.commentsByPostId}
								commentDraftByPostId={
									props.commentDraftByPostId
								}
								onSubmitComment={props.onSubmitComment}
								setCommentDraft={props.setCommentDraft}
								replyCommentsByCommentId={
									props.replyCommentsByCommentId
								}
								openRepliesCommentId={
									props.openRepliesCommentId
								}
								openReplyComposerCommentId={
									props.openReplyComposerCommentId
								}
								replyDraftByCommentId={
									props.replyDraftByCommentId
								}
								onToggleReplies={props.onToggleReplies}
								onReplyClick={props.onReplyClick}
								onReplySubmit={props.onReplySubmit}
								setReplyDraft={props.setReplyDraft}
							/>
						)}
					</PostItem>
				);
			})}
		</div>
	</div>
);

export default PostList;
