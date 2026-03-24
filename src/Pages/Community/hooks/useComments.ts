import { useState } from "react";
import { CommentOnPost, GetCommentsForPost, GetReplyCommentsForComment, ReplyToComment } from "../../../api/posts";
import { useNavigate } from "react-router-dom";

export const useComments = (isLoggedIn: boolean) => {
  const navigate = useNavigate();
  const [openCommentsPostId, setOpenCommentsPostId] = useState<number | null>(null);
  const [commentsByPostId, setCommentsByPostId] = useState<Record<number, any[]>>({});
  const [commentDraftByPostId, setCommentDraftByPostId] = useState<Record<number, string>>({});
  const [replyCommentsByCommentId, setReplyCommentsByCommentId] = useState<Record<number, any[]>>({});
  const [openRepliesCommentId, setOpenRepliesCommentId] = useState<number | null>(null);
  const [openReplyComposerCommentId, setOpenReplyComposerCommentId] = useState<number | null>(null);
  const [replyDraftByCommentId, setReplyDraftByCommentId] = useState<Record<number, string>>({});

  const loadComments = async (postId: number) => {
    try {
      const res = await GetCommentsForPost(postId);
      setCommentsByPostId((p) => ({ ...p, [postId]: Array.isArray(res.data) ? res.data : [] }));
    } catch (err) {
      console.error("Kommentek betöltési hiba", err);
    }
  };

  const handleToggleComments = (postId: number) => {
      setOpenCommentsPostId((c) => {
        if (c !== postId) {
          void loadComments(postId);
          return postId;
        }
        return null;
      });
    };

  const handleSubmitComment = async (postId: number) => {
      if (!isLoggedIn) {
        navigate("/auth/login", { replace: true });
        return;
      }
      const content = commentDraftByPostId[postId]?.trim();
      if (!content) return;

      try {
        await CommentOnPost(postId, content);
        setCommentDraftByPostId((p) => ({ ...p, [postId]: "" }));
        await loadComments(postId);
      } catch (err) {
        console.error("Komment küldési hiba", err);
      }
    };

  const loadReplies = async (commentId: number) => {
    try {
      const res = await GetReplyCommentsForComment(commentId);
      const data = res.data?.replies ?? res.data;
      setReplyCommentsByCommentId((p) => ({ ...p, [commentId]: Array.isArray(data) ? data : [] }));
    } catch (err) {
      console.error("Válaszok betöltési hiba", err);
    }
  };

  const handleToggleReplies = (commentId: number) => {
      setOpenRepliesCommentId((c) => {
        if (c !== commentId) {
          void loadReplies(commentId);
          return commentId;
        }
        return null;
      });
    };

  const handleReplyClick = (commentId: number, author: string) => {
    setOpenReplyComposerCommentId(commentId);
    const mention = `@${author} `;
    setReplyDraftByCommentId((p) => {
      const existing = p[commentId] || "";
      if (!existing.trim()) return { ...p, [commentId]: mention };
      if (existing.startsWith(mention)) return p;
      return { ...p, [commentId]: mention + existing };
    });
  };

  const handleSubmitReply = async (postId: number, commentId: number) => {
      if (!isLoggedIn) {
        navigate("/auth/login", { replace: true });
        return;
      }
      const content = replyDraftByCommentId[commentId]?.trim();
      if (!content) return;

      try {
        await ReplyToComment(postId, commentId, content);
        setReplyDraftByCommentId((p) => ({ ...p, [commentId]: "" }));
        setOpenReplyComposerCommentId(null);
        await loadReplies(commentId);
      } catch (err) {
        console.error("Válasz küldési hiba", err);
      }
    };

  return {
    openCommentsPostId,
    commentsByPostId,
    commentDraftByPostId,
    replyCommentsByCommentId,
    openRepliesCommentId,
    openReplyComposerCommentId,
    replyDraftByCommentId,
    handleToggleComments,
    handleSubmitComment,
    setCommentDraft: (postId: number, value: string) => setCommentDraftByPostId((p) => ({ ...p, [postId]: value })),
    handleToggleReplies,
    handleReplyClick,
    handleSubmitReply,
    setReplyDraft: (commentId: number, value: string) => setReplyDraftByCommentId((p) => ({ ...p, [commentId]: value })),
  };
};
