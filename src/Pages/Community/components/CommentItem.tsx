interface CommentItemProps {
  comment: any;
  replies: any[];
  isRepliesOpen: boolean;
  isReplyComposerOpen: boolean;
  replyDraft: string;
  onToggleReplies: (id: number) => void;
  onReplyClick: (id: number, author: string) => void;
  onReplySubmit: (commentId: number) => void;
  onReplyDraftChange: (commentId: number, val: string) => void;
}

const CommentItem = ({ comment, replies, isRepliesOpen, isReplyComposerOpen, replyDraft, onToggleReplies, onReplyClick, onReplySubmit, onReplyDraftChange }: CommentItemProps) => {
  const commentId = Number(comment.id);

  return (
    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
      <div className="flex items-center justify-between text-xs text-white/55">
        <span>@{comment.author}</span>
        {comment.created_at && <span>{new Date(comment.created_at).toLocaleString()}</span>}
      </div>
      <div className="mt-2 whitespace-pre-wrap text-sm text-white/80">{comment.content}</div>

      <div className="mt-3 flex gap-2">
        <button onClick={() => onToggleReplies(commentId)} className="rounded-xl border border-white/15 px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/10">
          {isRepliesOpen ? "Válaszok bezárása" : `Válaszok (${replies.length})`}
        </button>
        <button onClick={() => onReplyClick(commentId, comment.author)} className="rounded-xl border border-white/15 px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/10">
          Válasz
        </button>
      </div>

      {isRepliesOpen && (
        <div className="mt-3 space-y-2 ml-4 border-l border-white/10 pl-2">
          {replies.map((r: any) => (
            <div key={r.id} className="rounded-xl border border-white/10 bg-black/10 p-3">
              <div className="text-xs text-white/55">@{r.author}</div>
              <div className="mt-1 text-sm text-white/80">{r.content}</div>
            </div>
          ))}
        </div>
      )}

      {isReplyComposerOpen && (
        <div className="mt-3">
          <textarea value={replyDraft} 
            onChange={(e) => onReplyDraftChange(commentId, e.target.value)}
            className="w-full rounded-xl bg-black/20 p-3 text-sm text-white" 
            placeholder="Válasz írása..."
          />
          <button onClick={() => onReplySubmit(commentId)} className="mt-2 float-right rounded-lg bg-white/10 px-4 py-1 text-sm text-white">Küldés</button>
        </div>
      )}
    </div>
  );
};

export default CommentItem;