import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface SidebarProps {
  closeSidebar: () => void;
  isSidebarOpen: boolean;
  isLoggedIn: boolean;
}

type RecentThreadItem = {
  id: number;
  name?: string;
};

type JoinedThreadItem = {
  id: number;
  name?: string;
}

const Sidebar = ({ closeSidebar, isSidebarOpen, isLoggedIn }: SidebarProps) => {
  const [activeCommunity, setActiveCommunity] = useState<number | null>(null);
  const [joinedThreadIds, setJoinedThreadIds] = useState<JoinedThreadItem[]>([]);
  const [recentThreads, setRecentThreads] = useState<RecentThreadItem[]>([]);

  const loadFromStorage = () => {
    if (!isLoggedIn) {
      setRecentThreads([]);
      setJoinedThreadIds([]);
      return;
    }

    const profileRaw = localStorage.getItem("jedligram_profile");
    try {
      const parsedProfile = profileRaw ? JSON.parse(profileRaw) : {};

      const ids: number[] = Array.isArray(parsedProfile?.joinedThreadIds) ? parsedProfile.joinedThreadIds.map((x: any) => Number(x)) : [];

      const joinedThreadsRaw = parsedProfile?.joinedThreads;

      if (Array.isArray(joinedThreadsRaw) && joinedThreadsRaw.some((x: any) => x && typeof x === "object" && "id" in x)) {
        const threads: JoinedThreadItem[] = joinedThreadsRaw
          .filter((t: any) => t)
          .map((t: any) => ({ id: Number(t.id), name: typeof t.name === "string" ? t.name : undefined }));
        setJoinedThreadIds(threads);
      }
      else if (Array.isArray(joinedThreadsRaw) && joinedThreadsRaw.every((x: any) => typeof x === "string")) {
        const names: string[] = joinedThreadsRaw.map((s: string) => s);
        const threads: JoinedThreadItem[] = ids.map((id, idx) => ({ id, name: names[idx] }));
        setJoinedThreadIds(threads);
      }
    } catch {
      setJoinedThreadIds([]);
    }

    const recentRaw = localStorage.getItem("jedligram_recent_threads");
    try {
      const parsedRecent = recentRaw ? JSON.parse(recentRaw) : [];
      const cleaned = Array.isArray(parsedRecent)
        ? parsedRecent
            .filter((x) => x && typeof x === "object")
            .map((x) => ({ id: Number(x.id), name: typeof x.name === "string" ? x.name : undefined }))
        : [];
      setRecentThreads(cleaned.slice(0, 5));
    } catch {
      setRecentThreads([]);
    }
  };

  useEffect(() => {
    loadFromStorage();

    const onJoined = () => loadFromStorage();
    const onRecent = () => loadFromStorage();

    window.addEventListener("joined-threads-changed", onJoined);
    window.addEventListener("recent-threads-changed", onRecent);

    return () => {
      window.removeEventListener("joined-threads-changed", onJoined);
      window.removeEventListener("recent-threads-changed", onRecent);
    };
  }, [isLoggedIn]);

  const handleClick = (id: number) => {
    setActiveCommunity(id);
    closeSidebar();
  };

  return (
    <>
      <div onClick={closeSidebar} className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}/>
      <div className={`fixed top-0 left-0 h-screen w-48 md:w-60 z-50 md:z-40 flex flex-col pt-20 pb-4 items-center transform transition-transform duration-300 ease-in-out bg-linear-to-r from-[#1a1d23] to-[#2a2d31] border-r border-gray-700 overflow-y-auto overflow-x-hidden sidebar-scroll ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="my-4 w-full px-3">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">Népszerű Közösségek</p>
          <Link to="/all-communities" onClick={() => closeSidebar} className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 transition hover:bg-white/10`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-600 text-sm">
              <svg className="rpl-rtl-icon" fill="currentColor" height="20" icon-name="popular" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 1a9 9 0 00-9 9 9 9 0 009 9 9 9 0 009-9 9 9 0 00-9-9zm0 16.2c-1.66 0-3.186-.57-4.405-1.517l6.476-6.477V13h1.801V7.028a.9.9 0 00-.9-.9h-5.94v1.801h3.771l-6.481 6.482a7.154 7.154 0 01-1.521-4.41c0-3.97 3.23-7.2 7.2-7.2s7.2 3.23 7.2 7.2-3.23 7.2-7.2 7.2L10 17.2z"></path>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Felfedezés</p>
              <p className="text-xs text-white/60">Népszerű közösségek</p>
            </div>
          </Link>
        </div>

        {isLoggedIn && (
          <>
            <hr className="my-4 w-full border-white/10" />
            <div className="my-4 w-full px-3">
              <Link to={`/create-community`} onClick={() => closeSidebar} className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 transition hover:bg-white/10`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-600 text-sm">+</div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Közösség létrehozása</p>
                  <p className="text-xs text-white/60">Új közösség indítása</p>
                </div>
              </Link>
            </div>

            {recentThreads.length > 0 && (
              <>
                <hr className="my-4 w-full border-white/10" />
                <div className="my-4 w-full px-3">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">Legutóbb megtekintett</p>
                  <div className="flex flex-col gap-2">
                    {recentThreads.map((t) => (
                      <Link to={`/communities/${t.id}`} onClick={() => handleClick(t.id)} className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 transition hover:bg-white/10 ${activeCommunity === t.id ? "bg-white/15" : ""}`}>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-600 text-sm">
                          #{t.id}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm">{t.name || `Közösség #${t.id}`}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}

            <hr className="my-4 w-full border-white/10" />

            {joinedThreadIds.length > 0 ? (
              <div className="my-4 w-full px-3">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">Csatlakozott közösségek</p>
                <div className="flex flex-col gap-2">
                  {joinedThreadIds.map(t => (
                    <Link key={t.id} to={`/communities/${t.id}`} onClick={()=>handleClick(t.id)}
                      className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 transition hover:bg-white/10 ${activeCommunity===t.id?"bg-white/15":""}`}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-600 text-sm">#{t.id}</div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-white/60">Tag</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center mt-20 text-white text-center px-4">
                <p className="mb-4">Nem vagy egy közösség tagja sem.</p>
              </div>
            )}
          </>
        )}

        {!isLoggedIn && (
          <div className="flex flex-col items-center justify-center mt-20 text-white text-center px-4">
            <p className="mb-4">Kérlek, jelentkezz be a közösségek megtekintéséhez.</p>
            <Link to="/auth/login" className="keep-white text-white rounded-2xl bg-blue-500 px-6 py-2 font-semibold hover:bg-blue-600 transition">
              Jelentkezz be
            </Link>
          </div>
        )}

        <hr className="my-4 w-full border-white/10" />
      </div>
    </>
  );
};

export default Sidebar;