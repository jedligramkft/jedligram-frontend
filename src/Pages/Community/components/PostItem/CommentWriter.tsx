import { useState } from "react";
import { CommentOnPostOrReplyToComment } from "../../../../api/comments";
import { TextAreaComponent } from "../../../../Components/InputFields/TextAreaComponent";
import type { PostAndCommentData } from "../../../../Interfaces/PostAndComment";
import { PrimaryButton, SecondaryButton } from "../../../../Components/Buttons";

const CommentWriter = ({
	isTopLevel,
	originalPostId,
	nodeId,
	replyToUsername,
	onCommentSent,
	onCancel,
}: {
	isTopLevel: boolean;
	originalPostId: number;
	nodeId: number;
	replyToUsername: string;
	onCommentSent: () => void;
	onCancel: () => void;
}) => {
	const [commentContent, setCommentContent] = useState("");

	async function HandleCommentSubmit(
		e: React.MouseEvent<HTMLButtonElement>,
		postId: number,
		content: string,
	) {
		const btn = e.currentTarget as HTMLButtonElement;
		btn.disabled = true; // Disable the submit button to prevent multiple clicks while the request is in flight.

		let newComment: PostAndCommentData | null = null;

		if (isTopLevel) {
			newComment = (
				await CommentOnPostOrReplyToComment(originalPostId, content)
			).data as PostAndCommentData;
		} else {
			newComment = (
				await CommentOnPostOrReplyToComment(
					originalPostId,
					content,
					postId,
				)
			).data as PostAndCommentData;
		}

		if (!newComment) {
			console.error(
				"Failed to create comment: API response did not contain the new comment data.",
			);
			btn.disabled = false;
			return;
		}

		window.dispatchEvent(new Event("comment-added"));
		console.log("Dispatched comment-added event");

		btn.disabled = false; // Re-enable the submit button after the request completes.
		setCommentContent("");
		onCommentSent();
		// TODO - ideally we would want to optimistically update the UI here instead of waiting for a refetch, but that requires some extra logic to insert the new comment into the correct place in the existing tree, so for now we'll just rely on the fact that after submitting a comment, the API will return the updated list of comments which will then be merged and rendered by the existing useEffect in PostList that watches for changes to the active thread ID.
	}

	return (
		<div>
			<TextAreaComponent
				value={commentContent}
				onChange={(e) => setCommentContent(e.target.value)}
				placeholder={`Válaszolj @${replyToUsername} kommentjére...`}
			/>
			<div className="flex gap-2 *:mt-2 *:px-4 *:py-2">
				<PrimaryButton
					onClick={(e) =>
						HandleCommentSubmit(e, nodeId, commentContent)
					}
					className=""
				>
					Elküld
				</PrimaryButton>
				<SecondaryButton onClick={onCancel} className="">
					Mégse
				</SecondaryButton>
			</div>
		</div>
	);
};

export default CommentWriter;
