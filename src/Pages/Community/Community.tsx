import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { GetPostsInThread, GetThreadById, JoinThread } from "../../api/threads";
import type { ThreadData } from "../../Interfaces/ThreadData";

interface CommunityProps {
  isLoggedIn: boolean;
}

const Community = ({ isLoggedIn }: CommunityProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [posts, setPosts] = useState<Array<Record<string, unknown>>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const threadId = id ? Number(id) : NaN;

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
      alert("Sikeresen csatlakoztál!");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = (err.response?.data as any)?.message;
        alert(message ?? "Nem sikerült csatlakozni.");
        return;
      }

      const message = err instanceof Error ? err.message : "Nem sikerült csatlakozni.";
      alert(message);
    } finally {
      setIsJoining(false);
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
      try {
        const [threadRes, postsRes] = await Promise.all([
          GetThreadById(threadId),
          GetPostsInThread(threadId),
        ]);

        const threadData = (threadRes.data?.thread ?? threadRes.data) as ThreadData;
        const postsData = (postsRes.data?.posts ?? postsRes.data) as unknown;

        if (!isCancelled) {
          setThread(threadData);
          setPosts(Array.isArray(postsData) ? (postsData as Array<Record<string, unknown>>) : []);
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
                <button type="button" onClick={handleJoin} disabled={isJoining || isJoined} className="cursor-pointer rounded-xl bg-linear-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-blue-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-70">
                  {isJoined ? "Csatlakozva" : isJoining ? "Csatlakozás..." : "Csatlakozás"}
                </button>
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
                <Link to={id ? `/communities/${id}/posts/new` : "/all-communities"} onClick={(e) => handleNewPost(e)} className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10">
                  Új poszt
                </Link>
              </div>
              <div className="mt-5 space-y-4">
                {isLoading && (
                  <div className="text-sm text-white/70">Posztok betöltése...</div>
                )}

                {!isLoading && posts.length === 0 && (
                  <div className="text-sm text-white/70">Nincs még poszt ebben a közösségben.</div>
                )}

                {posts.map((post, idx) => {
                  const idValue = (post.id as number | string | undefined) ?? idx;
                  const title = (post.title as string | undefined) ?? "Poszt";
                  const content =
                    (post.content as string | undefined) ??
                    (post.body as string | undefined) ??
                    "";

                  return (
                    <article key={String(idValue)} className="rounded-2xl border border-white/10 bg-black/10 p-5 transition hover:border-white/20">
                      <div className="flex items-center justify-between text-xs text-white/55">
                        <span>•</span>
                        <span className="rounded-full bg-white/10 px-3 py-1">Poszt</span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-white/75">{content}</p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10">Tetszik</button>
                        <button className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10">Komment</button>
                        <button className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10">Megosztás</button>
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
                {["Oliver", "Bence", "Anna", "Nóri"].map((name) => (
                  <div key={name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/10 ring-1 ring-white/10" />
                      <div>
                        <div className="text-sm font-semibold text-white">{name}</div>
                        <div className="text-xs text-white/55">Tag</div>
                      </div>
                    </div>
                      <Link to={`/users/${encodeURIComponent(name)}`} className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10">
                        Profil
                      </Link>
                  </div>
                ))}
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
