'use client';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom'
import type { UserData } from '../../Interfaces/UserData';
import { GetUserProfile } from '../../api/users';

const profileStorageKey = import.meta.env.VITE_PROFILE_STORAGE_KEY ?? "jedligram_profile";
const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8080";

const UserProfile = () => {
  const params = useParams();
  // const [joinedCommunities, setJoinedCommunities] = useState<{ id: number; name: string; role: string }[]>([]);

  // useEffect(() => {
  //   const fetchUserThreads = async () => {
  //     if (!id) return;

  //     try {
  //       const response = await GetUserThreads(Number(id));
  //       setJoinedCommunities(response.data);
  //     } catch (err) {
  //       console.warn("Nem sikerült betölteni a közösségeket.", err);
  //       setJoinedCommunities([]);
  //     }
  //   };

  //   fetchUserThreads();
  // }, [id]);

  const [isMyProfile, setIsMyProfile] = useState(false);
  const [targetUser, setTargetUser] = useState<UserData | null>(null);

  useEffect(() => {
    const getViewedUserProfile = async (userId: number) => {
      try {
        const response = await GetUserProfile(userId);
        if (response.status === 200) {
          console.log("Betöltött felhasználói adatok:", response.data); 
          setTargetUser(response.data);
        } else {
          console.warn("Nem sikerült betölteni a felhasználói adatokat.");
          setTargetUser(null);
        }
      } catch (err) {
        console.error("Hiba történt a felhasználói adatok lekérése közben:", err);
        setTargetUser(null);
      }
    };

    const requesterId = JSON.parse(localStorage.getItem(profileStorageKey) || "{}")?.id;
    const targetId = Number(params.id);    
    setIsMyProfile(requesterId === targetId);

    getViewedUserProfile(targetId);
  }, []);

  return (
    <>
      <div className='absolute max-w-full w-dvw h-1 z-50' style={{ backgroundColor: isMyProfile ? "green" : "red" }} />
      <section className='relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]' />
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]' />
        <div className='absolute inset-0 bg-black/30' />

        <div className='relative z-10 mx-auto flex max-w-xl flex-col px-4 pb-12 pt-12'>
          <div className='rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h1 className='text-3xl font-black text-white'>{targetUser?.name} profilja</h1>
                <p className='mt-2 text-sm text-white/70'>Megtekintés (nem szerkeszthető)</p>
                <p className='mt-3 text-xs font-semibold uppercase tracking-wider text-white/60'>
                  User ID: <span className='text-white/80'>{targetUser?.id ?? '—'}</span>
                </p>
              </div>

              <Link to='/all-communities' className='rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10'>
                Vissza
              </Link>
            </div>

            <div className='mt-8 flex flex-col items-center gap-4'>
              <img src={targetUser?.image_url} alt={targetUser?.name} className='h-28 w-28 rounded-full border border-white/20 bg-linear-to-br from-blue-500/30 to-indigo-500/30 shadow-lg' />
              <p className='text-sm font-semibold text-white/80'>{targetUser?.username}</p>
            </div>

            <div className='mt-10 grid gap-5'>
              <div>
                <label className='text-xs font-semibold uppercase tracking-wider text-white/60'>Felhasználónév</label>
                <div className='mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/85'>
                  {targetUser?.name}
                </div>
              </div>

              <div>
                <label className='text-xs font-semibold uppercase tracking-wider text-white/60'>Bemutatkozás</label>
                <div className='mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/85'>
                  {targetUser?.bio || "Nincs bemutatkozás megadva."}
                </div>
              </div>
            </div>
            
            {/* <div className='mt-10'>
              <h2 className='text-xl font-semibold text-white'>Közösségek</h2>
              <p className='mt-1 text-sm text-white/60'>Amikben benne van</p>

              <div className='mt-4 space-y-3'>
                {joinedCommunities.length === 0 ? (
                  <div className='text-sm text-white/60'>Nincs megjeleníthető közösség.</div>
                ) : (
                  joinedCommunities.map((community) => (
                    <div key={community.id} className='flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 p-4'>
                      <div>
                        <p className='text-sm font-semibold text-white'>{community.name}</p>
                        <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/50'>{community.role}</p>
                      </div>
                      <Link to={`/communities/${community.id}`} className='rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10'>
                        Megnézem
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div> */}
          </div>
        </div>
      </section>
    </>
  );
};

export default UserProfile
