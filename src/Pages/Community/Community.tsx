import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { GetPostsInThread, GetThreadById, JoinThread, LeaveThread } from "../../api/threads";
import { CommentOnPost, GetCommentsForPost, GetReplyCommentsForComment, RemoveVoteFromPost, ReplyToComment, VoteOnPost} from "../../api/posts";
import type { ThreadData } from "../../Interfaces/ThreadData";
import { GetUsers } from "../../api/users";
import WelcomeBanner from "../../Components/Utils/WelcomeBanner";
import PostSkeleton from "../../Components/Utils/PostSkeleton";

interface CommunityProps {
  isLoggedIn: boolean;
}

type RecentThreadItem = {
  id: number;
  name?: string;
};

const Community = ({ isLoggedIn }: CommunityProps) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [posts, setPosts] = useState<Array<Record<string, unknown>>>([]);

  const [openCommentsPostId, setOpenCommentsPostId] = useState<number | null>(null);
  const [commentsByPostId, setCommentsByPostId] = useState<Record<number, any[]>>({});
  const [commentDraftByPostId, setCommentDraftByPostId] = useState<Record<number, string>>({});
  const [loadingCommentsPostId, setLoadingCommentsPostId] = useState<number | null>(null);
  const [submittingCommentPostId, setSubmittingCommentPostId] = useState<number | null>(null);

  const [replyCommentsByCommentId, setReplyCommentsByCommentId] = useState<Record<number, any[]>>({});
  const [openRepliesCommentId, setOpenRepliesCommentId] = useState<number | null>(null);
  const [loadingRepliesCommentId, setLoadingRepliesCommentId] = useState<number | null>(null);

  const [openReplyComposerCommentId, setOpenReplyComposerCommentId] = useState<number | null>(null);
  const [replyDraftByCommentId, setReplyDraftByCommentId] = useState<Record<number, string>>({});
  const [submittingReplyCommentId, setSubmittingReplyCommentId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [likeStatuses, setLikeStatuses] = useState<Record<number, boolean>>({});
  const [votingPostId, setVotingPostId] = useState<number | null>(null);

  const [joinedUsernames, setJoinedUsernames] = useState<string[]>([]);
  const [showAllMembers, setShowAllMembers] = useState(false);

  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});

  const threadId = id ? Number(id) : NaN;

  const profileStorageKey = "jedligram_profile";
  const recentThreadsStorageKey = "jedligram_recent_threads";

  const readProfile = (): any => {
    try {
      const raw = localStorage.getItem(profileStorageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const updateJoinedThreadsLocal = (threadIdValue: number, threadLabel: string, shouldBeJoined: boolean) => {
    const profile = readProfile();
    const joinedThreads: string[] = Array.isArray(profile.joinedThreads) ? profile.joinedThreads : [];
    const joinedThreadIds: number[] = Array.isArray(profile.joinedThreadIds) ? profile.joinedThreadIds : [];

    const nextIds = shouldBeJoined
      ? Array.from(new Set([...joinedThreadIds, threadIdValue]))
      : joinedThreadIds.filter((t) => t !== threadIdValue);

    const nextLabels = shouldBeJoined
      ? Array.from(new Set([...joinedThreads, threadLabel]))
      : joinedThreads.filter((t) => t !== threadLabel);

    localStorage.setItem(
      profileStorageKey,
      JSON.stringify({ ...profile, joinedThreads: nextLabels, joinedThreadIds: nextIds }),
    );

    window.dispatchEvent(new Event("joined-threads-changed"));
  };

  const saveRecentThread = (threadId: number, threadName?: string) => {
    if (!Number.isFinite(threadId)) return;

    try {
      const raw = localStorage.getItem(recentThreadsStorageKey);
      const current: RecentThreadItem[] = raw ? JSON.parse(raw) : [];

      const next: RecentThreadItem[] = [
        { id: threadId, name: threadName?.trim() || undefined },
        ...current.filter((t) => t.id !== threadId),
      ].slice(0, 5);

      localStorage.setItem(recentThreadsStorageKey, JSON.stringify(next));
      window.dispatchEvent(new Event("recent-threads-changed"));
    } catch {
      
    }
  };

  const parsePostId = (value: unknown): number => {
    const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
    return Number.isFinite(n) ? n : NaN;
  };

  const getServerLikeCount = (post: Record<string, unknown>): number => {
    const raw = (post.likes_count as unknown) ?? (post.likesCount as unknown) ?? 0;
    const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : 0;
    return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
  };

  const isReplyComment = (comment: any): boolean => {
    const parent =
      comment?.parent_id ??
      comment?.parentId ??
      comment?.parent_comment_id ??
      comment?.parentCommentId ??
      comment?.parent;

    return parent !== null && parent !== undefined && parent !== 0 && parent !== "0";
  };

  useEffect(() => {
    if (Number.isNaN(threadId)) return;
    const profile = readProfile();
    const joinedThreadIds: number[] = Array.isArray(profile.joinedThreadIds) ? profile.joinedThreadIds : [];
    setIsJoined(joinedThreadIds.includes(threadId));
  }, [threadId]);

  const syncLikeCountsFromPosts = (postsArray: Array<Record<string, unknown>>) => {
    setLikeCounts((prev) => {
      const next = { ...prev };

      for (const post of postsArray) {
        const postId = parsePostId(post.id);
        if (Number.isNaN(postId)) continue;

        const serverValue = (post.likes_count as unknown) ?? (post.likesCount as unknown);
        const serverNumber =
          typeof serverValue === "number"
            ? serverValue
            : typeof serverValue === "string"
              ? Number(serverValue)
              : NaN;

        if (Number.isFinite(serverNumber)) {
          next[postId] = Math.max(0, Math.trunc(serverNumber));
        } else if (next[postId] === undefined) {
          next[postId] = 0;
        }
      }

      return next;
    });
  };

  const getLikeCount = (postId: number, post: Record<string, unknown>): number => {
    const serverValue = (post.likes_count as unknown) ?? (post.likesCount as unknown);
    const value = serverValue ?? likeCounts[postId] ?? 0;
    const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : 0;
    return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
  };

  const fetchJoinedUsernames = async (threadIdValue: number): Promise<string[]> => {
    if (Number.isNaN(threadIdValue)) return [];

    const response = await GetUsers(`thread:${threadIdValue}`);
    const usersData = response.data?.users ?? response.data;

    if (!Array.isArray(usersData)) return [];
    return usersData.map((u) => u.name).filter((name): name is string => typeof name === "string");
  };

  const handleNewPost = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isLoggedIn) return;

    e.preventDefault();
    navigate("/auth/login", { replace: true });
  };

  const handleJoin = async () => {
    if (!isLoggedIn) {
      navigate("/auth/login", { replace: true });
      return;
    }

    if (Number.isNaN(threadId)) return;

    setIsJoining(true);
    try {
      await JoinThread(threadId);
      setIsJoined(true);
      updateJoinedThreadsLocal(threadId, thread?.name ?? `Közösség #${threadId}`, true);
      const usernames = await fetchJoinedUsernames(threadId);
      setJoinedUsernames(usernames);
      setShowAllMembers(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          navigate("/auth/login", { replace: true });
          return;
        }
        const message = ((err.response?.data as any)?.message as string | undefined) ?? err.message;
        const lower = message.toLowerCase();
        const alreadyMember = lower.includes("already") && lower.includes("member");

        if (alreadyMember) {
          setIsJoined(true);
          updateJoinedThreadsLocal(threadId, thread?.name ?? `Közösség #${threadId}`, true);
          const usernames = await fetchJoinedUsernames(threadId);
          setJoinedUsernames(usernames);
          setShowAllMembers(false);
          return;
        }

        alert(message ?? "Nem sikerült csatlakozni.");
        return;
      }

      const message = err instanceof Error ? err.message : "Nem sikerült csatlakozni.";
      alert(message);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!isLoggedIn) {
      navigate("/auth/login", { replace: true });
      return;
    }

    if (Number.isNaN(threadId)) return;

    setIsLeaving(true);
    try {
      await LeaveThread(threadId);
      setIsJoined(false);
      updateJoinedThreadsLocal(threadId, thread?.name ?? `Közösség #${threadId}`, false);
      setShowAllMembers(false);

      const profile = readProfile();
      const currentUsernameRaw = (profile?.username ?? profile?.name) as unknown;
      const currentUsername = typeof currentUsernameRaw === "string" ? currentUsernameRaw.trim() : "";
      if (currentUsername) {
        setJoinedUsernames((prev) => prev.filter((u) => u.toLowerCase() !== currentUsername.toLowerCase()));
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          navigate("/auth/login", { replace: true });
          return;
        }
        const message = (err.response?.data as any)?.message;
        alert(message ?? "Nem sikerült elhagyni a közösséget.");
        return;
      }
    } finally {
      setIsLeaving(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setLoadError("Hibás közösség azonosító.");
      return;
    }

    if (Number.isNaN(threadId)) {
      setLoadError("Hibás közösség azonosító.");
      return;
    }

    if (!isLoggedIn) {
      setLoadError("Jelentkezz be a közösség megtekintéséhez.");
      return;
    }

    let isCancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      setJoinedUsernames([]);
      setShowAllMembers(false);
      try {
        const [threadRes, postsRes] = await Promise.all([
          GetThreadById(threadId),
          GetPostsInThread(threadId),
        ]);

        const threadData = (threadRes.data?.thread ?? threadRes.data) as ThreadData;
        const postsData = (postsRes.data?.posts ?? postsRes.data) as unknown;

        if (!isCancelled) {
          setThread(threadData);
          const postsArray = Array.isArray(postsData) ? (postsData as Array<Record<string, unknown>>) : [];
          setPosts(postsArray);
          saveRecentThread(threadId, threadData?.name);
        }

        try {
          const usernames = await fetchJoinedUsernames(threadId);
          if (!isCancelled) setJoinedUsernames(usernames);
        } catch (err) {
          console.warn("Nem sikerült betölteni a tagokat.", err);
          if (!isCancelled) setJoinedUsernames([]);
        }
      } catch (err) {
        if (isCancelled) return;

        if (axios.isAxiosError(err) && err.response?.status === 401) {
          navigate("/auth/login", { replace: true });
          return;
        }

        const message =
          axios.isAxiosError(err)
            ? ((err.response?.data as any)?.message as string | undefined) ?? err.message
            : err instanceof Error
              ? err.message
              : "Nem sikerült betölteni a közösséget.";
        setLoadError(message);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isCancelled = true;
    };
  }, [id, isLoggedIn, location.key, navigate, threadId]);

  const reloadPosts = async () => {
    if (Number.isNaN(threadId)) return;

    const postsRes = await GetPostsInThread(threadId);
    const postsData = (postsRes.data?.posts ?? postsRes.data) as unknown;
    const postsArray = Array.isArray(postsData) ? (postsData as Array<Record<string, unknown>>) : [];
    setPosts(postsArray);
  };

  const handleToggleLike = async (postId: number) => {
    if (!isLoggedIn) {
      navigate("/auth/login", { replace: true });
      return;
    }

    if (Number.isNaN(postId)) return;

    if (votingPostId === postId) return;
    setVotingPostId(postId);

    const wasLiked = likeStatuses[postId] === true;
    const willLike = !wasLiked;

    setLikeStatuses((prev) => ({ ...prev, [postId]: willLike }));
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (parsePostId(p.id) === postId) {
          const currentLikes = getServerLikeCount(p);
          return { ...p, likes_count: willLike ? currentLikes + 1 : Math.max(0, currentLikes - 1) };
        }
        return p;
      }),
    );

    try {
      if (willLike) {
        await VoteOnPost(postId, true);
      } else {
        await RemoveVoteFromPost(postId);
      }
    } catch (err) {
      setLikeStatuses((prev) => ({ ...prev, [postId]: wasLiked }));
      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (parsePostId(p.id) === postId) {
            const currentLikes = getServerLikeCount(p);
            return { ...p, likes_count: wasLiked ? currentLikes -1 : currentLikes + 1 };
          }
          return p;
        }),
      );

      const message =
        axios.isAxiosError(err)
          ? ((err.response?.data as any)?.message as string | undefined) ?? err.message
          : err instanceof Error
            ? err.message
            : "Nem sikerült szavazni.";
      alert(message);
    } finally {
      setVotingPostId(null);
    }
  };

  const loadCommentsForPost = async (postId: number) => {
    if (Number.isNaN(postId)) return;
    setLoadingCommentsPostId(postId);
    try {
      const res = await GetCommentsForPost(postId);
      setCommentsByPostId((prev) => ({ ...prev, [postId]: Array.isArray(res.data) ? res.data : [] }));
    } catch (err) {
      console.error("Nem sikerült betölteni a kommenteket", err);
    } finally {
      setLoadingCommentsPostId((current) => (current === postId ? null : current));
    }
  };

  const handleToggleComments = (postId: number) => {
    if (Number.isNaN(postId)) return;

    setOpenCommentsPostId((current) => {
      const willOpen = current !== postId;
      if (willOpen) {
        if (commentsByPostId[postId] === undefined) {
          void loadCommentsForPost(postId);
        }
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

    if (Number.isNaN(postId)) return;

    const raw = commentDraftByPostId[postId] ?? "";
    const content = raw.trim();
    if (!content) return;

    if (submittingCommentPostId === postId) return;
    setSubmittingCommentPostId(postId);

    try {
      await CommentOnPost(postId, content);
      setCommentDraftByPostId((prev) => ({ ...prev, [postId]: "" }));
      await loadCommentsForPost(postId);
    } catch (err) {
      console.error("Nem sikerült elküldeni a kommentet", err);
    } finally {
      setSubmittingCommentPostId((current) => (current === postId ? null : current));
    }
  };


  const loadRepliesForComment = async (commentId: number) => {
    if (Number.isNaN(commentId)) return;
    setLoadingRepliesCommentId(commentId);

    try {
      const res = await GetReplyCommentsForComment(commentId);
      const replyData = (res.data?.replies ?? res.data) as any;
      setReplyCommentsByCommentId((prev) => ({ ...prev, [commentId]: Array.isArray(replyData) ? replyData : [] }));
    } catch (err) {
      console.error("Nem sikerült betölteni a válaszkommenteket", err);
    } finally {
      setLoadingRepliesCommentId((current) => (current === commentId ? null : current));
    }
  };

  const handleToggleReplyComments = (commentId: number) => {
    if (Number.isNaN(commentId)) return;

    setOpenRepliesCommentId((current) => {
      const willOpen = current !== commentId;
      if (willOpen) void loadRepliesForComment(commentId);
      return willOpen ? commentId : null;
    });
  };

  const handleToggleReplyComposer = (commentId: number) => {
    if (Number.isNaN(commentId)) return;
    setOpenReplyComposerCommentId((current) => (current === commentId ? null : commentId));
  };

  const handleReplyToReply = (parentCommentId: number, replyAuthor: string) => {
    if (Number.isNaN(parentCommentId)) return;

    setOpenReplyComposerCommentId(parentCommentId);
    const mention = replyAuthor ? `@${replyAuthor} ` : "";

    if (!mention) return;

    setReplyDraftByCommentId((prev) => {
      const existing = prev[parentCommentId] ?? "";
      if (existing.trim().length === 0) {
        return { ...prev, [parentCommentId]: mention };
      }
      if (existing.startsWith(mention)) {
        return prev;
      }
      return { ...prev, [parentCommentId]: mention + existing };
    });
  };

  const handleSubmitReply = async (postId: number, commentId: number) => {
    if (!isLoggedIn) {
      navigate("/auth/login", { replace: true });
      return;
    }

    if (Number.isNaN(postId)) return;
    if (Number.isNaN(commentId)) return;

    const raw = replyDraftByCommentId[commentId] ?? "";
    const content = raw.trim();ű
    if (!content) return;

    if (submittingReplyCommentId === commentId) return;
    setSubmittingReplyCommentId(commentId);

    try {
      const res = await ReplyToComment(postId, commentId, content);
      setReplyDraftByCommentId((prev) => ({ ...prev, [commentId]: "" }));
      setOpenRepliesCommentId(commentId);
      setOpenReplyComposerCommentId((current) => (current === commentId ? null : current));

      const created = (res.data as any)?.comment ?? res.data;
      if (created && typeof created === "object") {
        setReplyCommentsByCommentId((prev) => {
          const currentReplies = prev[commentId] ?? [];
          const createdId = (created as any)?.id;
          if (createdId !== undefined && currentReplies.some((r: any) => r?.id === createdId)) {
            return prev;
          }
          return { ...prev, [commentId]: [...currentReplies, created] };
        });
      }

      await loadRepliesForComment(commentId);
    } catch (err) {
      console.error("Nem sikerült elküldeni a választ", err);
    } finally {
      setSubmittingReplyCommentId((current) => (current === commentId ? null : current));
    }
  };
    
  const handleLoadMoreUsernames = () => {
    setShowAllMembers(true);
  };

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const postTimesMs = posts
    .map((post) => {
      const raw = post.created_at;
      const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : NaN;
      const candidate = typeof raw === "string" ? raw.replace(" ", "T") : raw;
      return Number.isFinite(n) ? n : Date.parse(candidate as any);
    })
    .filter((ms) => Number.isFinite(ms));

  const isCommunityActive = postTimesMs.length
    ? postTimesMs.some((ms) => ms >= sevenDaysAgo)
    : posts.length > 0;
  const activityLabel = isLoading ? "Betöltés..." : isCommunityActive ? "Aktív" : "Inaktív";

  const handleInvite = async () => {
    if (Number.isNaN(threadId)) return;

    try {
      const inviteUrl = new URL(`/communities/${threadId}`, window.location.origin).toString();  
      await (navigator as any).share({ url: inviteUrl });
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nem sikerült megosztani a meghívót.";
      alert(message);
    }
  };
  
  return (
    <section className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular">
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]' />
      <div className='absolute inset-0 bg-black/30' />
      <div className="container mx-auto px-6 py-10">
        <WelcomeBanner communityName={thread?.name} />
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-black/30 backdrop-blur">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/15 via-cyan-400/10 to-purple-500/15" />
          <div className="relative z-10 p-8 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 rounded-2xl bg-white/10 ring-1 ring-white/15" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Community {id ? `#${id}` : ""}</div>
                  <h1 className="text-3xl font-bold text-white md:text-4xl">
                    {thread?.name ?? (isLoading ? "Betöltés..." : "Közösség")}
                  </h1>
                  <p className="mt-1 text-sm text-white/70">
                    {thread?.category ? `${thread.category} • ` : ""}{activityLabel}
                  </p>                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {isJoined ? (
                  <button onClick={handleLeave} disabled={isLeaving} className="cursor-pointer rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/35 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70">
                    {isLeaving ? "Elhagyás..." : "Elhagyás"}
                  </button>
                ) : (
                  <button onClick={handleJoin}  disabled={isJoining} className="cursor-pointer rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/35 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70">
                    {isJoining ? "Csatlakozás..." : "Csatlakozás"}
                  </button>
                )}
                <button onClick={handleInvite} className="cursor-pointer rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/35 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70">
                  Meghívás
                </button>
                <Link to="/all-communities" className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10">
                  Vissza
                </Link>
              </div>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Leírás</div>
                <div className="mt-2 text-sm text-white/75">
                    {loadError
                      ? loadError
                      : thread?.description ?? (isLoading ? "Betöltés..." : "—")}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Szabályok</div>
                <ul className="mt-2 space-y-1 text-sm text-white/75">
                  {thread?.rules ? thread.rules.split("\n").map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />
                          <span>{rule}</span>
                        </li>
                      ))
                    : isLoading ? "Betöltés..." : "Nincsenek szabályok megadva."
                  }   
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Közelgő</div>
                <div className="mt-2 text-sm text-white/75">Szerda 19:00 — Ranked est</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Feed</h2>
                {isJoined && (
                  <Link to={id ? `/communities/${id}/posts/new` : "/all-communities"} onClick={(e) => handleNewPost(e)} className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10">
                    Új poszt
                  </Link>
                )}
                {!isJoined && (
                  <button onClick={handleJoin} className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10">
                    Csatlakozás a posztoláshoz
                  </button>
                )}
              </div>
              <div className="mt-5 space-y-4">
                {isLoading && (
                  <div className="space-y-4">
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                  </div>
                )}

                {!isLoading && posts.length === 0 && (
                  <div className="text-sm text-white/70">Nincs még poszt ebben a közösségben.</div>
                )}

                {posts.map((post, idx) => {
                  const postId = parsePostId(post.id);
                  const isLiked = !Number.isNaN(postId) && likeStatuses[postId] === true;
                  const isVoting = !Number.isNaN(postId) && votingPostId === postId;
                  const likeCount = getServerLikeCount(post);
                  const isCommentsOpen = !Number.isNaN(postId) && openCommentsPostId === postId;
                  const postCommentsAll = !Number.isNaN(postId) ? (commentsByPostId[postId] || []) : [];
                  const postComments = postCommentsAll.filter((c: any) => !isReplyComment(c));
                  const isCommentsLoading = !Number.isNaN(postId) && loadingCommentsPostId === postId;
                  const isSubmittingComment = !Number.isNaN(postId) && submittingCommentPostId === postId;

                  const keyValue = Number.isNaN(postId) ? `fallback-${idx}` : String(postId);
                  const title = (post.title as string | undefined) ?? "Poszt"; 
                  const content =
                    (post.content as string | undefined) ??
                    (post.body as string | undefined) ??
                    "";

                  

                  return (
                    <article key={keyValue} className="rounded-2xl border border-white/10 bg-black/10 p-5 transition hover:border-white/20">
                      <div className="flex items-center justify-between text-xs text-white/55">
                        {post.author ? `@${post.author}` : "Ismeretlen szerző"}
                        <span>{new Date(post.created_at as string).toLocaleString()}</span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-white/75">{content}</p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button type="button" onClick={() => handleToggleComments(postId)} disabled={Number.isNaN(postId)} className="cursor-pointer rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70">
                          {isCommentsOpen ? "Kommentek bezárása" : "Kommentek"}
                        </button>
                        {/* <button className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10">Megosztás</button> */}
                        <button 
                          type="button"
                          onClick={() => handleToggleLike(postId)}
                          disabled={Number.isNaN(postId) || isVoting}
                          className={
                            `cursor-pointer rounded-xl border px-4 py-2 text-xs font-semibold transition ` +
                            (isLiked
                              ? "border-white/35 bg-white/10 text-white"
                              : "border-white/15 text-white/80 hover:bg-white/10") +
                            " disabled:cursor-not-allowed disabled:opacity-70"
                          }
                        >
                          {isLiked ? `Tetszik ✓ (${likeCount})` : `Tetszik (${likeCount})`}
                        </button>
                      </div>

                      {isCommentsOpen && !Number.isNaN(postId) && (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4">
                          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Kommentek</div>

                          {isCommentsLoading && (
                            <div className="mt-2 text-sm text-white/70">Kommentek betöltése...</div>
                          )}

                          {!isCommentsLoading && postComments.length === 0 && (
                            <div className="mt-2 text-sm text-white/70">Nincs még komment.</div>
                          )}

                          <div className="mt-4">
                            <textarea value={commentDraftByPostId[postId] ?? ""} onChange={(e) => setCommentDraftByPostId((prev) => ({ ...prev, [postId]: e.target.value }))} placeholder="Írj egy kommentet..." rows={3}
                              className="w-full resize-none rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white/90 placeholder:text-white/40 focus:outline-hidden"
                            />
                            <div className="mt-3 flex justify-end">
                              <button type="button" onClick={() => handleSubmitComment(postId)} disabled={isSubmittingComment || !(commentDraftByPostId[postId] ?? "").trim()} className="cursor-pointer rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70">
                                {isSubmittingComment ? "Küldés..." : "Küldés"}
                              </button>
                            </div>
                          </div>

                          {!isCommentsLoading && postComments.length > 0 && (
                            <div className="mt-3 space-y-3">
                              {postComments.map((c: any, cIdx: number) => {
                                const cId = c?.id ?? cIdx;
                                const commentIdNumber = Number(c?.id);
                                const canLoadReplies = Number.isFinite(commentIdNumber);
                                const isRepliesOpen = canLoadReplies && openRepliesCommentId === commentIdNumber;
                                const isRepliesLoading = canLoadReplies && loadingRepliesCommentId === commentIdNumber;
                                const replies = canLoadReplies ? (replyCommentsByCommentId[commentIdNumber] || []) : [];
                                const isReplyComposerOpen = canLoadReplies && openReplyComposerCommentId === commentIdNumber;
                                const isSubmittingReply = canLoadReplies && submittingReplyCommentId === commentIdNumber;
                                const cAuthor = c?.author || c?.user?.username || c?.user?.name || "Ismeretlen";
                                const cContent = c?.content || c?.body || "";
                                const createdAt = c?.created_at || c?.createdAt;

                                return (
                                  <div key={String(cId)} className="rounded-xl border border-white/10 bg-black/10 p-3">
                                    <div className="flex items-center justify-between text-xs text-white/55">
                                      <span>@{cAuthor}</span>
                                      {createdAt ? <span>{new Date(createdAt).toLocaleString()}</span> : <span />}
                                    </div>
                                    <div className="mt-2 whitespace-pre-wrap text-sm text-white/80">{cContent}</div>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                      <button type="button" onClick={() => (canLoadReplies ? handleToggleReplyComments(commentIdNumber) : null)} disabled={!canLoadReplies} className="rounded-xl border border-white/15 px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60">
                                        {isRepliesOpen ? "Válaszok bezárása" : "Válaszok"}
                                      </button>
                                      <button type="button" onClick={() => (canLoadReplies ? handleToggleReplyComposer(commentIdNumber) : null)} disabled={!canLoadReplies} className="rounded-xl border border-white/15 px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60">
                                        {isReplyComposerOpen ? "Válasz bezárása" : "Válasz"}
                                      </button>
                                    </div>

                                    {isRepliesLoading && (
                                      <div className="mt-2 text-sm text-white/70">Válaszok betöltése...</div>
                                    )}

                                    {isRepliesOpen && !isRepliesLoading && (
                                      <div className="mt-3 space-y-2">
                                        {replies.length === 0 && (
                                          <div className="text-sm text-white/70">Nincs még válasz.</div>
                                        )}
                                        {replies.map((r: any, rIdx: number) => {
                                          const rId = r?.id ?? rIdx;
                                          const rAuthor = r?.author || r?.user?.username || r?.user?.name || "Ismeretlen";
                                          const rContent = r?.content || r?.body || "";
                                          const rCreatedAt = r?.created_at || r?.createdAt;

                                          return (
                                            <div key={String(rId)} className="ml-4 rounded-xl border border-white/10 bg-black/10 p-3">
                                              <div className="flex items-center justify-between text-xs text-white/55">
                                                <span>@{rAuthor}</span>
                                                {rCreatedAt ? <span>{new Date(rCreatedAt).toLocaleString()}</span> : <span />}
                                              </div>
                                              <div className="mt-2 whitespace-pre-wrap text-sm text-white/80">{rContent}</div>

                                              <div className="mt-3 flex flex-wrap gap-2">
                                                <button type="button" onClick={() => handleReplyToReply(commentIdNumber, rAuthor)}className="rounded-xl border border-white/15 px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/10">
                                                  Válasz
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {isReplyComposerOpen && canLoadReplies && (
                                      <div className="mt-3 rounded-xl border border-white/10 bg-black/10 p-3">
                                        <textarea value={replyDraftByCommentId[commentIdNumber] ?? ""} onChange={(e) =>setReplyDraftByCommentId((prev) => ({ ...prev, [commentIdNumber]: e.target.value }))} placeholder="Írj egy választ..." rows={2} className="w-full resize-none rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white/90 placeholder:text-white/40 focus:outline-hidden"/>
                                        <div className="mt-3 flex justify-end">
                                          <button type="button" onClick={() => handleSubmitReply(postId, commentIdNumber)} disabled={isSubmittingReply || !(replyDraftByCommentId[commentIdNumber] ?? "").trim()} className="cursor-pointer rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70">
                                            {isSubmittingReply ? "Küldés..." : "Küldés"}
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
              <h2 className="text-xl font-semibold text-white">Tagok</h2>
              <div className="mt-4 space-y-3">
                {joinedUsernames.length === 0 ? (
                  <div className="text-sm text-white/70">Nincsenek tagok ebben a közösségben.</div>
                ) : (
                  (showAllMembers ? joinedUsernames : joinedUsernames.slice(0, 5)).map((username, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-white/10 ring-1 ring-white/15" />
                      <span className="text-sm text-white/80">@{username}</span>
                      <Link to={`/users/${username}`} className="ml-auto rounded-xl border border-white/20 px-3 py-1 text-xs font-semibold text-white/90 transition hover:bg-white/10">
                        Profil
                      </Link>
                    </div>
                  ))                  
                )}
                {joinedUsernames.length > 5 && !showAllMembers && (
                  <button className="w-full rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold text-white/90 transition hover:bg-white/10" onClick={handleLoadMoreUsernames}>
                    További {joinedUsernames.length - 5} tag megtekintése
                  </button>
                )}
                
                
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
              <h2 className="text-xl font-semibold text-white">Statisztika</h2>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Tagok</div>
                  <div className="mt-1 text-2xl font-bold text-white">
                    {joinedUsernames.length}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Posztok</div>
                  <div className="mt-1 text-2xl font-bold text-white">
                    {posts.length}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Aktivitás</div>
                  <div className="mt-1 text-2xl font-bold text-white">
                    {activityLabel}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Community;
