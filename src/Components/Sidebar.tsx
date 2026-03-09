import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface SidebarProps {
  closeSidebar: () => void;
  isSidebarOpen: boolean;
  isLoggedIn: boolean;
}


const Sidebar = ({ closeSidebar, isSidebarOpen, isLoggedIn }: SidebarProps) => {
  const [activeCommunity, setActiveCommunity] = useState(1);
  const [joinedThreadIds, setJoinedThreadIds] = useState<number[]>([]);

  const loadJoinedFromStorage = () => {
    const raw = localStorage.getItem("jedligram_profile");
    if (!raw) {
      setJoinedThreadIds([]);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<{ joinedThreadIds: number[] }>;
      setJoinedThreadIds(Array.isArray(parsed.joinedThreadIds) ? parsed.joinedThreadIds : []);
    } catch {
      setJoinedThreadIds([]);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    loadJoinedFromStorage();
    const onThreadsChanged = () => loadJoinedFromStorage();
    window.addEventListener("joined-threads-changed", onThreadsChanged);
    return () => window.removeEventListener("joined-threads-changed", onThreadsChanged);
  }, [isLoggedIn]);

  return (
    <>
      <div onClick={closeSidebar} className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}/>
        <div className={`fixed top-0 left-0 h-screen w-48 md:w-60 z-50 md:z-40 flex flex-col pt-20 pb-4 items-center transform transition-transform duration-300 ease-in-out bg-linear-to-r from-[#1a1d23] to-[#2a2d31] border-r border-gray-700 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
           <div className="my-4 w-full px-3">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">Népszerű Közösségek</p>
              <Link to="/all-communities" onClick={closeSidebar} className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 transition hover:bg-white/10 ${activeCommunity === -1 ? "bg-white/10" : ""}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold">
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
          <hr className="my-4 w-full border-white/10" />
          {isLoggedIn && (
            <div className="my-4 w-full px-3">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">Közösségek</p>
              <Link to="/create-community" onClick={closeSidebar} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 transition hover:bg-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold">
                  +
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Közösség létrehozása</p>
                  <p className="text-xs text-white/60">Új közösség indítása</p>
                </div>
              </Link>
            </div>
          )}
          <hr className="my-4 w-full border-white/10" />
          {isLoggedIn ? (
            joinedThreadIds.length > 0 ? (
            <div className="my-4 w-full px-3">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">Csatlakozott közösségek</p>
              <div className="flex flex-col gap-2">
                {joinedThreadIds.map((id) => (
                  <Link
                    key={id}
                    to={`/communities/${id}`}
                    onClick={() => { setActiveCommunity(id); closeSidebar(); }}
                    className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 transition hover:bg-white/10 ${activeCommunity === id ? "bg-white/10" : ""}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold">
                      #{id}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">Közösség #{id}</p>
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
          )
        ) : (
          <div className="flex flex-col items-center justify-center mt-20 text-white text-center px-4">
            <p className="mb-4">Kérlek, jelentkezz be a közösségek megtekintéséhez.</p>
            <Link to="/auth/login" className="rounded-2xl bg-blue-500 px-6 py-2 font-semibold hover:bg-blue-600 transition">
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
