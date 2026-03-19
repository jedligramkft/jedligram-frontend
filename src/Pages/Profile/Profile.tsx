import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Logout } from "../../api/auth";
import { ProfilePictureUpload } from "../../api/users";
import useProfileData from "../../hooks/useProfileData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faSave, faSignOutAlt, faKey, faSpinner, faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

interface ProfileProps {
	isLoggedIn: boolean;
}

const Profile = ({ isLoggedIn }: ProfileProps) => {
	const navigate = useNavigate();
  const {
    username, email, bio, joinedThreadIds, profilePictureUrl, lastSavedAt,
    setUsername, setEmail, setBio, saveData, updateProfilePicture
  } = useProfileData(); 
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const backendUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? "";
  const avatarSrc = profilePictureUrl.startsWith("/") && backendUrl ? `${backendUrl}${profilePictureUrl}` : profilePictureUrl;
  const initials = username.trim().slice(0, 1).toUpperCase() || "?";

  const formatDateTime = (iso: string): string => {
    if (!iso) return "Soha";
    const d = new Date(iso);
    return d.toLocaleString("hu-HU", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    const success = saveData({ username, email, bio });
    if (success) {
      setSaveStatus("success");
    } else {
      setSaveStatus("error");
    }
    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus(null);
    }, 2000);
  }

  const onProfilePictureSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await ProfilePictureUpload(file);
      const url = response?.data?.path || response?.data?.url;
      if (url) {
        updateProfilePicture(url);
        alert("Profilkép sikeresen frissítve!");
      } else {
        throw new Error("A szerver nem küldött vissza érvényes URL-t.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nem sikerült feltölteni a profilképet.";
      alert(`Hiba: ${message}`);
    } finally {
      setIsUploading(false);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

	if (!isLoggedIn) {
		return <Navigate to="/auth/login" replace />;
	}

  const handleLogout = async () => {
    try {
      await Logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem(import.meta.env.VITE_AUTH_TOKEN_NAME ?? "jedligram_token");
      localStorage.removeItem("jedligram_profile");
      window.dispatchEvent(new Event("auth-changed"));
      navigate("/auth/login", { replace: true });
    }
  }

  return (
    <section className='relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] text-white poppins-regular'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]' />
      <div className='absolute inset-0 bg-black/30' />

      <div className='relative z-10 mx-auto max-w-4xl px-4 py-16'>
        <div className='rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur'>
          <div className="p-8 border-b border-gray-700/50 flex flex-col md:flex-row items-center gap-8">
            <div className='relative'>
              <div className='h-32 w-32 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-5xl font-black shadow-lg'>
                {profilePictureUrl ? (
                  <img src={avatarSrc} alt='Profilkép' className='h-full w-full object-cover rounded-full' />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={onProfilePictureSelected}/>
              <button className='absolute -bottom-2 -right-2 h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-blue-700 transition-transform duration-200 hover:scale-110 disabled:bg-gray-500 disabled:cursor-not-allowed' onClick={() => fileInputRef.current?.click()} disabled={isUploading} aria-label="Profilkép módosítása">
                {isUploading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faCamera} />}
              </button>
            </div>
            <div className="text-center md:text-left">
              <h1 className='text-4xl font-bold'>{username || "Felhasználó"}</h1>
              <p className='mt-2 text-lg text-gray-400'>{email}</p>
              <p className='mt-4 text-sm text-gray-300 max-w-md'>{bio || "Nincs bemutatkozás."}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6 text-center">
            <div>
              <p className='text-xs font-semibold uppercase tracking-wider text-white/60'>Közösség</p>
              <p className='mt-1 text-lg font-bold text-white'>{joinedThreadIds.length}</p>
            </div>
            <div>
              <p className='text-xs font-semibold uppercase tracking-wider text-white/60'>Posztok</p>
              <p className='mt-1 text-lg font-bold text-white'>42</p>
            </div>
            <div>
              <p className='text-xs font-semibold uppercase tracking-wider text-white/60'>Hozzászólások</p>
              <p className='mt-1 text-lg font-bold text-white'>128</p>
            </div>
          </div>
          <div className='p-8 border-t border-gray-700/50'>
            <h2 className="text-2xl font-bold mb-6">Fiók beállítások</h2>
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <label className='text-sm font-semibold text-gray-400'>Felhasználónév</label>
                <input type='text' placeholder='jedlik_user' value={username} onChange={(e) => setUsername(e.target.value)} className='mt-2 w-full rounded-lg border-2 border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-0 outline-none transition'/>
              </div>
              <div>
                <label className='text-sm font-semibold text-gray-400'>Email</label>
                <input type='email' placeholder='email@pelda.hu' value={email} onChange={(e) => setEmail(e.target.value)} className='mt-2 w-full rounded-lg border-2 border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-0 outline-none transition'/>
              </div>
              <div className="md:col-span-2">
                <label className='text-sm font-semibold text-gray-400'>Bemutatkozás</label>
                <textarea placeholder='Pár szó magadról...' value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className='mt-2 w-full resize-none rounded-lg border-2 border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-0 outline-none transition'/>
                <p className="text-xs text-gray-500 mt-1">Utoljára mentve: {formatDateTime(lastSavedAt)}</p>
              </div>
            </div>
            <div className='mt-8 flex flex-col md:flex-row items-center justify-between gap-4'>
              <Link to="/auth/change-password" className='flex items-center gap-2 text-sm font-semibold text-gray-400 transition hover:text-blue-400'>
                <FontAwesomeIcon icon={faKey} />
                Jelszó módosítása
              </Link>
              <button onClick={handleSave} disabled={isSaving} className='w-full md:w-auto flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-wait'>
                {isSaving ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                ) : saveStatus === "success" ? (
                  <FontAwesomeIcon icon={faCheckCircle} />
                ) : saveStatus === "error" ? (
                  <FontAwesomeIcon icon={faExclamationCircle} />
                ) : (
                  <FontAwesomeIcon icon={faSave} />
                )}
                <span>{isSaving ? "Mentés..." : saveStatus === "success" ? "Sikeresen mentve!" : saveStatus === "error" ? "Hiba!" : "Változtatások mentése"}</span>
              </button>
            </div>
          </div>

          {/* Logout */}
          <div className='p-6 border-t border-gray-700/50 text-center'>
            <button onClick={handleLogout} className='flex items-center justify-center w-full md:w-auto md:mx-auto gap-2 text-sm font-semibold text-red-500 transition hover:text-red-400'>
              <FontAwesomeIcon icon={faSignOutAlt} />
              Kijelentkezés
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Profile
