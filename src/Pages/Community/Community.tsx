import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { GetPostsInThread, GetThreadById, JoinThread, LeaveThread } from "../../api/threads";
import { RemoveVoteFromPost, VoteOnPost } from "../../api/posts";
import type { ThreadData } from "../../Interfaces/ThreadData";
import { GetUsers } from "../../api/users";

interface CommunityProps {
  isLoggedIn: boolean;
}

const Community = ({ isLoggedIn }: CommunityProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [posts, setPosts] = useState<Array<Record<string, unknown>>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [likeStatuses, setLikeStatuses] = useState<Record<number, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const [votingPostId, setVotingPostId] = useState<number | null>(null);

  const [joinedUsernames, setJoinedUsernames] = useState<string[]>([]);
  const [showAllMembers, setShowAllMembers] = useState(false);

  const threadId = id ? Number(id) : NaN;

  const profileStorageKey = "jedligram_profile";

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

  const parsePostId = (value: unknown): number => {
    const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
    return Number.isFinite(n) ? n : NaN;
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
    const authTokenName = import.meta.env.VITE_AUTH_TOKEN_NAME ?? "jedligram_token";
    const token = localStorage.getItem(authTokenName);

    if (!token) {
      navigate("/auth/login", { replace: true });
      return;
    }

    if (!id) {
      alert("Hibás közösség azonosító.");
      return;
    }

    if (Number.isNaN(threadId)) {
      alert("Hibás közösség azonosító.");
      return;
    }

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
    const authTokenName = import.meta.env.VITE_AUTH_TOKEN_NAME ?? "jedligram_token";
    const token = localStorage.getItem(authTokenName);

    if (!token) {
      navigate("/auth/login", { replace: true });
      return;
    }

    if (!id) {
      alert("Hibás közösség azonosító.");
      return;
    }

    if (Number.isNaN(threadId)) {
      alert("Hibás közösség azonosító.");
      return;
    }

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
          syncLikeCountsFromPosts(postsArray);
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
  }, [id, isLoggedIn, navigate, threadId]);

  const reloadPosts = async () => {
    if (!id || Number.isNaN(threadId)) return;

    const postsRes = await GetPostsInThread(threadId);
    const postsData = (postsRes.data?.posts ?? postsRes.data) as unknown;
    const postsArray = Array.isArray(postsData) ? (postsData as Array<Record<string, unknown>>) : [];
    setPosts(postsArray);
    syncLikeCountsFromPosts(postsArray);
  };

  const handleToggleLike = async (postId: number) => {
    if (!isLoggedIn) {
      navigate("/auth/login", { replace: true });
      return;
    }

    if (Number.isNaN(postId)) {
      alert("Hibás poszt azonosító.");
      return;
    }

    if (votingPostId === postId) return;
    setVotingPostId(postId);

    const wasLiked = likeStatuses[postId] === true;
    const willLike = !wasLiked;
    const previousCount = likeCounts[postId] ?? 0;

    setLikeStatuses((prev) => ({ ...prev, [postId]: willLike }));
    setLikeCounts((prev) => ({
      ...prev,
      [postId]: Math.max(0, (prev[postId] ?? previousCount) + (willLike ? 1 : -1)),
    }));

    try {
      if (willLike) await VoteOnPost(postId, true);
      else await RemoveVoteFromPost(postId);
      void reloadPosts();
    } catch (err) {
      setLikeStatuses((prev) => ({ ...prev, [postId]: wasLiked }));
      setLikeCounts((prev) => ({ ...prev, [postId]: previousCount }));

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

  const handleLoadMoreUsernames = () => {
    setShowAllMembers(true);
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular">
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]' />
      <div className='absolute inset-0 bg-black/30' />
      <div className="container mx-auto px-6 py-10">
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
                    {thread?.category ? `${thread.category} • ` : ""}Aktív
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {isJoined ? (
                  <button
                    onClick={handleLeave}
                    disabled={isLeaving}
                    className="cursor-pointer rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/35 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLeaving ? "Elhagyás..." : "Elhagyás"}
                  </button>
                ) : (
                  <button
                    onClick={handleJoin}
                    disabled={isJoining}
                    className="cursor-pointer rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/35 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isJoining ? "Csatlakozás..." : "Csatlakozás"}
                  </button>
                )}
                <button className="rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/35 hover:bg-white/10">Meghívás</button>
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
                  <li>• Tisztelet mindenkivel</li>
                  <li>• Spam tilos</li>
                  <li>• Spoiler jelölés</li>
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
                  <div className="text-sm text-white/70">Posztok betöltése...</div>
                )}

                {!isLoading && posts.length === 0 && (
                  <div className="text-sm text-white/70">Nincs még poszt ebben a közösségben.</div>
                )}

                {posts.map((post, idx) => {
                  const postId = parsePostId(post.id);
                  const isLiked = !Number.isNaN(postId) && likeStatuses[postId] === true;
                  const isVoting = !Number.isNaN(postId) && votingPostId === postId;
                  const likeCount = Number.isNaN(postId) ? 0 : getLikeCount(postId, post);

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
                        <button className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10">Komment</button>
                        <button className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10">Megosztás</button>
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
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Posztok</div>
                  <div className="mt-1 text-2xl font-bold text-white">128</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Aktivitás</div>
                  <div className="mt-1 text-2xl font-bold text-white">Magas</div>
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
