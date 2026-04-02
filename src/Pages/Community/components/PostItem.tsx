import { useTranslation } from "react-i18next";

type PostItemProps = {
  post: any;
  postId: number;
  isVoting: boolean;
  score: number;
  isCommentsOpen: boolean;
  onToggleComments: (postId: number) => void;
  onVote: (postId: number, isUpvote: boolean) => void;
  onDelete?: (postId: number) => void;
  userRole?: number;
  children?: React.ReactNode;
};

const PostItem = ({ post, postId, isVoting, score, isCommentsOpen, onToggleComments, onVote, children, onDelete, userRole }: PostItemProps) => {
  const { t } = useTranslation();
  const canDelete = userRole === 1 || userRole === 2;

  return (
    <article className="rounded-2xl border border-white/10 bg-black/10 p-5 transition hover:border-white/20">
      <div className="flex items-center justify-between text-xs text-white/55">
        {post.user ? `@${post.user.name}` : t("community.post_item.unknown_author")}
        <span>{post.age}</span>
      </div>
      <h3 className="mt-2 whitespace-pre-wrap text-sm text-white/75">{post.content || ""}</h3>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button onClick={() => onToggleComments(postId)} className="cursor-pointer rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10">
          {isCommentsOpen ? t("community.post_item.close_comments") : t("community.post_item.open_comments")}
        </button>
        <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/10 px-3 py-2">
          <button disabled={isVoting} onClick={() => onVote(postId, true)} className="cursor-pointer rounded-lg border border-white/15 px-2 py-1 text-xs font-bold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70">
            ▲
          </button>
          <span className="min-w-6 text-center text-xs font-semibold text-white/90 tabular-nums">{score}</span>
          <button disabled={isVoting} onClick={() => onVote(postId, false)} className="cursor-pointer rounded-lg border border-white/15 px-2 py-1 text-xs font-bold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70">
            ▼
          </button>
        </div>        
        {canDelete && onDelete && (
          <button onClick={() => onDelete(postId)} className="cursor-pointer rounded-xl border border-red-500/30 px-4 py-2 text-xs font-semibold text-red-400/80 transition hover:bg-red-500/10">
            {t("community.post_item.delete")}
          </button>
        )}
      </div>
      {children}
    </article>
  )
};

export default PostItem;