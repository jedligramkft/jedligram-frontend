type Props = {
  postId: number;
  commentId: number;
  comment: any;
  replies: any[];
  isRepliesOpen: boolean;
  isReplyComposerOpen: boolean;
  replyDraft: string;
  onToggleReplies: (commentId: number) => void;
  onReplyClick: (commentId: number, author: string) => void;
  onReplySubmit: (postId: number, commentId: number) => void;
  setReplyDraft: (commentId: number, value: string) => void;
};

const ReplyItem = (props: Props) => (
  <div className="rounded-xl border border-white/10 bg-black/10 p-3">
    <div className="flex items-center justify-between text-xs text-white/55">
      <span>@{props.comment.author}</span>
      {props.comment.created_at && <span>{new Date(props.comment.created_at).toLocaleString()}</span>}
    </div>
    <div className="mt-2 whitespace-pre-wrap text-sm text-white/80">{props.comment.content}</div>
    <div className="mt-3 flex gap-2">
      <button onClick={() => props.onToggleReplies(props.commentId)} className="rounded-xl border border-white/15 px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/10">
        {props.isRepliesOpen ? "Bezár" : `Válaszok (${props.replies.length})`}
      </button>
      <button onClick={() => props.onReplyClick(props.commentId, props.comment.author)} className="rounded-xl border border-white/15 px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/10">
        Válasz
      </button>
    </div>
    {props.isRepliesOpen && (
      <div className="mt-3 space-y-2 ml-4 border-l border-white/10 pl-2">
        {props.replies.map((r: any) => (
          <div key={r.id} className="rounded-xl border border-white/10 bg-black/10 p-3">
            <div className="text-xs text-white/55">@{r.author}</div>
            <div className="mt-1 text-sm text-white/80">{r.content}</div>
          </div>
        ))}
      </div>
    )}
    {props.isReplyComposerOpen && (
      <div className="mt-3">
        <textarea
          value={props.replyDraft}
          onChange={(e) => props.setReplyDraft(props.commentId, e.target.value)}
          placeholder="Válasz írása..."
          rows={2}
          className="w-full rounded-xl bg-black/20 p-3 text-sm text-white"
        />
        <button onClick={() => props.onReplySubmit(props.postId, props.commentId)} className="mt-2 float-right rounded-lg bg-white/10 px-4 py-1 text-sm text-white">
          Küldés
        </button>
      </div>
    )}
  </div>
);

export default ReplyItem;
