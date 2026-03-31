import { useTranslation } from "react-i18next";
import ReplyItem from "./ReplyItem";

type Props = {
  postId: number;
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

const CommentSection = (props: Props) => {
  const comments = (props.commentsByPostId[props.postId] || []).filter((c) => !c.parent_id || c.parent_id === 0);
  const draft = props.commentDraftByPostId[props.postId] || "";
  const { t } = useTranslation();

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{t("community.comment_section.comments")}</div>
      {comments.length === 0 && <div className="mt-2 text-sm text-white/70">{t("community.comment_section.no_comments")}</div>}
      <div className="mt-4">
        <textarea value={draft} onChange={(e) => props.setCommentDraft(props.postId, e.target.value)} placeholder={t("community.comment_section.write_comment_placeholder")} rows={3} className="w-full resize-none rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white/90 placeholder:text-white/40 focus:outline-hidden"/>
        <div className="mt-3 flex justify-end">
          <button onClick={() => props.onSubmitComment(props.postId)} disabled={!draft.trim()} className="cursor-pointer rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70">
            {t("community.comment_section.submit_comment")}
          </button>
        </div>
      </div>
      {comments.length > 0 && (
        <div className="mt-3 space-y-3">
          {comments.map((c) => {
            const cId = Number(c.id);
            return (
              <ReplyItem
                key={cId}
                postId={props.postId}
                comment={c}
                commentId={cId}
                replies={props.replyCommentsByCommentId[cId] || []}
                isRepliesOpen={props.openRepliesCommentId === cId}
                isReplyComposerOpen={props.openReplyComposerCommentId === cId}
                replyDraft={props.replyDraftByCommentId[cId] || ""}
                onToggleReplies={props.onToggleReplies}
                onReplyClick={props.onReplyClick}
                onReplySubmit={props.onReplySubmit}
                setReplyDraft={props.setReplyDraft}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
