import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TextAreaComponent } from "../../../../Components/InputFields/TextAreaComponent";
import { PrimaryButton, SecondaryButton } from "../../../../Components/Buttons";
import { toast } from "react-toastify";

const CommentWriter = ({
	replyToUsername,
	onSubmitComment,
	onCommentSent,
	onCancel,
}: {
	replyToUsername: string;
	onSubmitComment: (content: string) => Promise<boolean>;
	onCommentSent: () => void;
	onCancel: () => void;
}) => {
	const { t } = useTranslation();
	const [commentContent, setCommentContent] = useState("");

	async function HandleCommentSubmit(
		e: React.MouseEvent<HTMLButtonElement>,
		content: string,
	) {
		const btn = e.currentTarget as HTMLButtonElement;
		btn.disabled = true;

		try {
			if (!content.trim()) {
				toast.error(t("community.comment_writer.empty_error"));
				return;
			}

			const isSuccess = await onSubmitComment(content);
			if (!isSuccess) {
				return;
			}

			setCommentContent("");
			onCommentSent();
		} finally {
			btn.disabled = false;
		}
	}

	return (
		<div>
			<TextAreaComponent
				value={commentContent}
				onChange={(e) => setCommentContent(e.target.value)}
				placeholder={t("community.comment_writer.reply_placeholder", {
					username: replyToUsername,
				})}
			/>
			<div className="flex gap-2 *:mt-2 *:px-4 *:py-2">
				<PrimaryButton
					onClick={(e) => HandleCommentSubmit(e, commentContent)}
					className=""
				>
					{t("community.comment_writer.send_button")}
				</PrimaryButton>
				<SecondaryButton onClick={onCancel} className="">
					{t("community.comment_writer.cancel_button")}
				</SecondaryButton>
			</div>
		</div>
	);
};

export default CommentWriter;
