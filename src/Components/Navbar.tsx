import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useThreads } from "../hooks/useThreads";
import { getActiveTheme, toggleTheme } from "../theme";

interface NavbarProps {
  toggleSidebar?: () => void;
  isLoggedIn?: boolean;
}

const Navbar = ({ toggleSidebar, isLoggedIn }: NavbarProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(() => getActiveTheme());
  const threads = useThreads();

  useEffect(() => {
    const onThemeChanged = () => setActiveTheme(getActiveTheme());
    window.addEventListener("theme-changed", onThemeChanged);
    return () => window.removeEventListener("theme-changed", onThemeChanged);
  }, []);

  const filteredThreads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return []

    return threads.filter((thread) => {
      const name = String((thread as any)?.name ?? '').toLowerCase()
      const category = String((thread as any)?.category ?? '').toLowerCase()
      return (
        name.includes(normalizedQuery) || category.includes(normalizedQuery)
      )
    })
  }, [query, threads])

  const handleClick = () => {
    const q = query.trim()
    if (q === '') return
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleClick();
    }
  };

  return (
    <nav className="bg-linear-to-r from-[#1a1d23] to-[#2a2d31] backdrop-blur-md border-b border-gray-700 text-white shadow-lg sticky top-0 z-50 poppins-regular">
      <div className="sm:px-6 md:px-12 py-4 flex items-center justify-between relative">
        
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="mr-4 p-2 rounded-lg hover:bg-white/10 transition text-white md:hidden">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <Link to="/"><img src="/Images/jedligram_logo.png" alt="Jedligram logo" className="h-12 w-12 opacity-90 brightness-200" /></Link>
        </div>

        <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
          <input type="text" placeholder="Közösségek keresése..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleEnterPress} className="w-72 lg:w-96 px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"/>
          {filteredThreads.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 p-2 text-left shadow-xl">
              <div className="max-h-72 overflow-y-auto">
                {filteredThreads.slice(0, 3).map((thread) => (
                  <Link key={thread.id} to={`/communities/${thread.id}`} className="block rounded-xl px-4 py-3 transition hover:bg-white">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{thread.name}</p>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                          {thread.category}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <button type="button" onClick={() => setActiveTheme(toggleTheme())} className="p-2 rounded-lg hover:bg-white/10 transition text-white" aria-label={activeTheme === "dark" ? "Világos téma" : "Sötét téma"} title={activeTheme === "dark" ? "Világos téma" : "Sötét téma"}>
            {activeTheme === "dark" ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2" />
                <path d="M12 21v2" />
                <path d="M4.22 4.22l1.42 1.42" />
                <path d="M18.36 18.36l1.42 1.42" />
                <path d="M1 12h2" />
                <path d="M21 12h2" />
                <path d="M4.22 19.78l1.42-1.42" />
                <path d="M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-4 py-2 rounded-lg text-white font-semibold transition" onClick={() => navigate('/create-community')}>
            <svg fill="currentColor" height="20" icon-name="add-square" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.7 2H5.3C3.481 2 2 3.48 2 5.3v9.4C2 16.519 3.48 18 5.3 18h9.4c1.819 0 3.3-1.48 3.3-3.3V5.3C18 3.481 16.52 2 14.7 2zm1.499 12.7a1.5 1.5 0 01-1.499 1.499H5.3A1.5 1.5 0 013.801 14.7V5.3A1.5 1.5 0 015.3 3.801h9.4A1.5 1.5 0 0116.199 5.3v9.4zM14 10.9h-3.1V14H9.1v-3.1H6V9.1h3.1V6h1.8v3.１H１４v１．８z"></path>
            </svg>
            <Link to="/create-community" className="text-gray-300 hover:text-white transition font-medium">Közösség létrehozása</Link>
          </div>
          {isLoggedIn && (
            <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-2 py-2 rounded-lg text-white font-semibold transition" onClick={() => navigate('/profile')}>
              <Link to="/profile" className="text-gray-300 hover transition font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M4 21v-2a4 4 0 0 1 3-3.87" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            </div>
          )}
          {!isLoggedIn && (
            <Link to="/auth/login" className="keep-white text-white bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-2 rounded-lg font-semibold transition shadow-md">Bejelentkezés</Link>
          )}
        </div>

        <button type="button" className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-200 hover:text-white hover:bg-white/10 transition" aria-expanded={isOpen} onClick={() => setIsOpen(prev => !prev)}>
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" />
          </svg>
        </button>
      </div>

      <div className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${isOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-6 pb-4 flex flex-col gap-3">
          <button type="button" onClick={() => setActiveTheme(toggleTheme())} className="flex items-center gap-2 text-left text-gray-300 hover:text-white transition font-medium">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/10">
              {activeTheme === "dark" ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2" />
                  <path d="M12 21v2" />
                  <path d="M4.22 4.22l1.42 1.42" />
                  <path d="M18.36 18.36l1.42 1.42" />
                  <path d="M1 12h2" />
                  <path d="M21 12h2" />
                  <path d="M4.22 19.78l1.42-1.42" />
                  <path d="M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </span>
            {activeTheme === "dark" ? "Világos téma" : "Sötét téma"}
          </button>

          <Link to="/create-community" className="text-left text-gray-300 hover:text-white transition font-medium">Közösség létrehozása</Link>
          <a href="#" className="text-left text-gray-300 hover:text-white transition font-medium">Játékok</a>
          {isLoggedIn && (
            <Link to="/profile" className="text-left text-gray-300 hover:text-white transition font-medium">Profil</Link>
          )}
          {!isLoggedIn && (
            <Link to="/auth/login" className="keep-white text-white bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-4 py-2 rounded-lg font-semibold transition shadow-md text-left">Bejelentkezés</Link>
          )}         
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
