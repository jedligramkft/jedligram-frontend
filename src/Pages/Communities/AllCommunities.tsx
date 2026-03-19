import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ThreadData } from "../../Interfaces/ThreadData";
import { GetThreads } from "../../api/threads";
import WelcomeBanner from "../../Components/Utils/WelcomeBanner";

interface AllCommunityProps{
	isLoggedIn: boolean;
}

const AllCommunities = ({ isLoggedIn }: AllCommunityProps) => {
	const [threads, setThreads] = useState<ThreadData[]>([]);

	useEffect(() => {
		const fetchThreads = async () => {
			try{
				const response = await GetThreads();
				setThreads(response.data);
			}
			catch(error){
				{
					const message = (error as any)?.response?.data?.message;
					if(message){
						alert(message);
						return;
					}
				}
				console.error("Error fetching threads:", error);
			}
		}
		fetchThreads();
	})


  return (
    <section className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular">
		<div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]' />
      	<div className='absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]' />
      	<div className='absolute inset-0 bg-black/30' />
        <div className="container mx-auto px-6 py-12">
			<WelcomeBanner />
            <div className="flex items-center justify-between mb-8">
                <div className="z-10">
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Közösségek
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-white/70">
                        Fedezz fel témákat, csatlakozz beszélgetésekhez, és találd meg a helyed.
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur">
                        <span className="text-white/60">Összesen</span>
                        <span className="text-white">{threads.length}</span>
                        <span className="text-white/60">közösség</span>
                    </div>
                </div>
				{isLoggedIn && (
                    <Link to={'/create-community'} className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-2 rounded-lg font-semibold transition shadow-md text-white keep-white z-10">
						Közösség létrehozása
					</Link>
				)}
				{!isLoggedIn && (
                    <Link to={'/auth/login'} className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-2 rounded-lg font-semibold transition shadow-md text-white keep-white z-10">
						Jelentkezz be közösség létrehozásához
					</Link>
				)}
            </div>
			
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {threads.map((thread) => {
					return (
                    <div key={thread.name} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur transition hover:-translate-y-1 hover:border-white/20">
                        <div className={`absolute inset-0 bg-linear-to-br opacity-0 transition duration-500 group-hover:opacity-100`}/>
                        <div className="relative z-10 flex h-full flex-col gap-4">
                            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                                <span>{thread.category}</span>
                                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px]">
                                    Aktív
                                </span>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="shrink-0 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                                    <span className="text-2xl font-bold text-white/60">{thread.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-semibold text-white">
                                        {thread.name}
                                    </h3>
                                    <p className="text-sm text-white/70">
                                        {thread.description || "Csatlakozz heti eseményekhez, közös stratégiákhoz és barátságos versenyekhez."}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-auto flex items-center justify-between">
                                <span className="text-sm font-semibold text-white/80">
                                    {/* {thread.members} */}
                                </span>
                                <Link to={`/communities/${thread.id}`} className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:border-white/40 hover:bg-white/10">
                                    Megnézem
                                </Link>
                            </div>
                        </div>
                    </div>
                )})}
            </div>
        </div>
    </section>
  )
}

export default AllCommunities
