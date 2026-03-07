import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom"
import { Logout } from "../../api/auth";
import { ProfilePictureUpload } from "../../api/users";

interface ProfileProps {
	isLoggedIn: boolean;
}

const Profile = ({ isLoggedIn }: ProfileProps) => {
	const navigate = useNavigate();
	const profileStorageKey = "jedligram_profile";
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [joinedThreadIds, setJoinedThreadIds] = useState<number[]>([]);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");
  const [isUploadingProfilePicture, setIsUploadingProfilePicture] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadFromStorage = () => {
    const raw = localStorage.getItem(profileStorageKey);
    if (!raw) {
      setUsername("");
      setEmail("");
      setBio("");
      setJoinedThreadIds([]);
      setProfilePictureUrl("");
      setLastSavedAt("");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<{
        username: string;
        email: string;
        bio: string;
        joinedThreadIds: number[];
        profilePictureUrl: string;
        lastSavedAt: string;
      }>;

      if (typeof parsed.username === "string") setUsername(parsed.username);
      if (typeof parsed.email === "string") setEmail(parsed.email);
      if (typeof parsed.bio === "string") setBio(parsed.bio);

      if (Array.isArray(parsed.joinedThreadIds)) setJoinedThreadIds(parsed.joinedThreadIds);

      if (typeof parsed.profilePictureUrl === "string") setProfilePictureUrl(parsed.profilePictureUrl);
      if (typeof parsed.lastSavedAt === "string") setLastSavedAt(parsed.lastSavedAt);
    } catch (err) {
      console.error("Failed to parse profile data from localStorage:", err);
    }
  };

  useEffect(() => {
    loadFromStorage();

    const onThreadsChanged = () => loadFromStorage();
    window.addEventListener("joined-threads-changed", onThreadsChanged);
    return () => window.removeEventListener("joined-threads-changed", onThreadsChanged);
  }, []);

  const backendUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? "";
  const avatarSrc = profilePictureUrl.startsWith("/") && backendUrl ? `${backendUrl}${profilePictureUrl}` : profilePictureUrl;
  const initials = username.trim().slice(0, 1).toUpperCase() || "?";

  const formatDateTime = (iso: string): string => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("hu-HU");
  };

  const isValidEmail = (value: string): boolean => {
    const v = value.trim();
    if (v.length === 0) return false;
    return v.includes("@");
  };

  const handleSave = () => {
    const errors: string[] = [];
    if (username.trim() === "") errors.push("A felhasználónév nem lehet üres!");
    if (email.trim() === "") errors.push("Az email cím nem lehet üres!");
    else if (!isValidEmail(email)) errors.push("Az email formátuma nem megfelelő.");
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    let existing: any = {};
    try {
      const raw = localStorage.getItem(profileStorageKey);
      existing = raw ? JSON.parse(raw) : {};
    } catch {
      existing = {};
    }

    const nowIso = new Date().toISOString();

    localStorage.setItem(
      profileStorageKey,
      JSON.stringify({
        ...existing,
        username,
        email,
        bio,
        joinedThreadIds,
        profilePictureUrl,
        lastSavedAt: nowIso,
      }),
    );
    setLastSavedAt(nowIso);
  }

  const onProfilePictureSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingProfilePicture(true);

    try {
      const response = await ProfilePictureUpload(file);

      const data = response?.data as any;
      const urlCandidate =
        typeof data?.url === "string" ? data.url :
        typeof data?.path === "string" ? data.path :
        null;

      if (urlCandidate) {
        setProfilePictureUrl(urlCandidate);
        try {
          const raw = localStorage.getItem(profileStorageKey);
          const existing = raw ? JSON.parse(raw) : {};
          localStorage.setItem(profileStorageKey, JSON.stringify({ ...existing, profilePictureUrl: urlCandidate }));
        } catch (err) {
          console.error("Failed to update profile picture URL in localStorage:", err);
        }
      }

      alert("Profilkép feltöltve!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nem sikerült feltölteni a profilképet.";
      alert(message);
    } finally {
      setIsUploadingProfilePicture(false);
      e.target.value = "";
    }
  };

	if (!isLoggedIn) {
		return <Navigate to="/auth/login" replace />
	}

  const handleLogout = async () => {
    try {
      await Logout();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      alert(message);
    } finally {
      localStorage.removeItem(import.meta.env.VITE_AUTH_TOKEN_NAME ?? "jedligram_token");
      localStorage.removeItem("jedligram_profile");
      window.dispatchEvent(new Event("auth-changed"));
      navigate("/auth/login", { replace: true });
    }
  }

  return (
    <section className='relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]' />
      <div className='absolute inset-0 bg-black/30' />

      <div className='relative z-10 mx-auto flex max-w-xl flex-col px-4 pt-12 pb-12'>
        <div className='rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <h1 className='text-3xl font-black text-white'>Profil</h1>
              <p className='mt-2 text-sm text-white/70'>Kezeld a fiókadataidat és személyes beállításaidat</p>
            </div>

            <div className='text-right'>
              <p className='text-xs font-semibold uppercase tracking-wider text-white/60'>Csatlakozott közösségek</p>
              <p className='mt-1 text-sm font-semibold text-white/85'>{joinedThreadIds.length}</p>
              <p className='mt-2 text-xs font-semibold uppercase tracking-wider text-white/60'>Utoljára mentve</p>
              <p className='mt-1 text-xs text-white/70'>{lastSavedAt ? formatDateTime(lastSavedAt) : "—"}</p>
            </div>
          </div>

          <div className='mt-8 flex flex-col items-center gap-4'>
            <div className='relative'>
              <div className='h-28 w-28 overflow-hidden rounded-full border border-white/20 bg-linear-to-br from-blue-500/30 to-indigo-500/30 shadow-lg'>
                {profilePictureUrl ? (
                  <img src={avatarSrc} alt='Profilkép' className='h-full w-full object-cover' />
                ) : (
                  <div className='flex h-full w-full items-center justify-center text-2xl font-black text-white/85'>
                    {initials}
                  </div>
                )}
              </div>

              {isUploadingProfilePicture ? (
                <div className='absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-xs font-semibold text-white/80'>
                  Feltöltés…
                </div>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={onProfilePictureSelected}
            />
            <button
              className='text-sm font-semibold text-blue-400 transition hover:text-blue-300 disabled:cursor-not-allowed disabled:text-white/40'
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingProfilePicture}
            >
              Profilkép módosítása
            </button>
          </div>

          <div className='mt-10 grid gap-5'>
            <div>
              <label className='text-xs font-semibold uppercase tracking-wider text-white/60'>Felhasználónév</label>
              <input type='text' placeholder='jedlik_user' value={username} onChange={(e) => setUsername(e.target.value)} className='mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/20'/>
            </div>

            <div>
              <label className='text-xs font-semibold uppercase tracking-wider text-white/60'>Email</label>
              <input type='email' placeholder='email@pelda.hu' value={email} onChange={(e) => setEmail(e.target.value)} className='mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/20'/>
            </div>

            <div>
              <label className='text-xs font-semibold uppercase tracking-wider text-white/60'>Bemutatkozás</label>
              <textarea placeholder='Pár szó magadról...' value={bio} onChange={(e) => setBio(e.target.value)} className='mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/20'/>
            </div>

            <div>
              <label className='text-xs font-semibold uppercase tracking-wider text-white/60'>Csatlakozott közösségek</label>
              <div className='mt-2 grid gap-2'>
                {joinedThreadIds.length === 0 ? (
                  <p className='text-sm text-white/50'>Nem csatlakoztál még egy közösséghez sem.</p>
                ) : (
                  joinedThreadIds.map((threadId) => (
                  <div key={threadId} className='flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 p-4'>
                    <div>
                      <p className='text-sm font-semibold text-white'>Közösség #{threadId}</p>
                      <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/50'>Tag</p>
                    </div>
                    <Link to={`/communities/${threadId}`} className='cursor-pointer rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10'>
                      Megnézem
                    </Link>
                  </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className='mt-8 flex items-center justify-between'>
            <Link to="/auth/change-password" className='text-sm font-semibold text-white/60 transition hover:text-blue-400'>Jelszó módosítása</Link>
            <button onClick={handleSave} className='mt-2 rounded-xl bg-linear-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:from-blue-600 hover:to-blue-700 cursor-pointer'>Mentés</button>
          </div>

          <div className='mt-6 border-t border-white/10 pt-4'>
            <button onClick={handleLogout} className='text-sm font-semibold text-red-500 transition hover:text-red-400'>Kijelentkezés</button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Profile
