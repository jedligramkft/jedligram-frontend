import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { GetThreads } from "../api/threads";
import type { ThreadData } from "../Interfaces/ThreadData";

const Communities = () => {
	const [threads, setThreads] = useState<ThreadData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [reloadToken, setReloadToken] = useState(0);

	useEffect(() => {
		const fetchThreads = async () => {
			setIsLoading(true);
			setLoadError(null);
			try {
				const res = await GetThreads();
				const data = res.data?.threads ?? res.data;
				setThreads(Array.isArray(data) ? data : []);
			} catch (err: any) {
				setLoadError(err?.response?.data?.message?.trim() || "Nem sikerült betölteni a közösségeket.");
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		};
		fetchThreads();
	}, [reloadToken]);

	const visibleThreads = threads.slice(0, 6);

	return (
		<section className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]"/>
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]"/>
			<div className="absolute inset-0 bg-black/25"/>

			<div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-20 pt-16 md:px-12">

				<div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur md:flex-row md:items-center md:justify-between md:p-8">
					<div>
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">Fedezd fel</p>
						<h1 className="mt-3 text-3xl font-black text-white drop-shadow md:text-5xl">Kiemelt Közösségek</h1>
						<p className="mt-3 max-w-xl text-sm text-white/70 md:text-base">Válogass a legaktívabb közösségek közül, és csatlakozz a kedvenceidhez.</p>
						<div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur">
							<span className="text-white/60">Összesen</span>
							<span className="text-white">{threads.length}</span>
							<span className="text-white/60">közösség</span>
						</div>
					</div>
					<div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
						<Link to="/all-communities" className="text-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-white/30 hover:bg-white/10">Összes közösség</Link>
						<Link to="/create-community" className="text-center rounded-2xl bg-linear-to-r from-blue-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white keep-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:shadow-blue-500/50">Közösség létrehozása</Link>
					</div>
				</div>

				{loadError && (
					<div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-5 text-white/80">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<p className="text-sm font-semibold text-red-200">{loadError}</p>
							<button onClick={() => setReloadToken(t => t + 1)} className="rounded-2xl border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10">Újrapróbálom</button>
						</div>
					</div>
				)}

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

					{isLoading && Array.from({ length: 6 }).map((_, idx) => (
						<div key={idx} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
							<div className="animate-pulse space-y-4">
								<div className="flex items-center justify-between">
									<div className="h-4 w-24 rounded bg-white/10"/>
									<div className="h-6 w-16 rounded-full bg-white/10"/>
								</div>
								<div className="h-6 w-3/4 rounded bg-white/10"/>
								<div className="h-4 w-full rounded bg-white/10"/>
								<div className="h-4 w-5/6 rounded bg-white/10"/>
								<div className="mt-6 flex items-center justify-between">
									<div className="h-4 w-20 rounded bg-white/10"/>
									<div className="h-9 w-24 rounded-full bg-white/10"/>
								</div>
							</div>
						</div>
					))}

					{!isLoading && !loadError && visibleThreads.length === 0 && (
						<div className="md:col-span-2 lg:col-span-3 rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/70 backdrop-blur">
							<p className="text-sm font-semibold text-white/80">Nincs találat.</p>
							<p className="mt-2 text-sm">Nézd meg az összes közösséget, vagy hozz létre egy újat.</p>
							<Link to="/all-communities" className="mt-5 inline-block rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10">Összes közösség</Link>
						</div>
					)}

					{!isLoading && !loadError && visibleThreads.map(thread => {
						return (
							<div key={thread.id} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur transition hover:-translate-y-1 hover:border-white/20">
								<div className="absolute inset-0 bg-linear-to-br from-cyan-400/30 to-blue-500/2 opacity-0 transition duration-500 group-hover:opacity-100"/>
								<div className="relative z-10 flex h-full flex-col gap-4">
									<div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
										<span>{thread.category}</span>
										<span className="rounded-full bg-white/10 px-3 py-1 text-[10px]">Aktív</span>
									</div>
									<h3 className="text-2xl font-semibold text-white">{thread.name}</h3>
									<p className="text-sm text-white/70">{thread.description || "Csatlakozz, és kezdj el beszélgetni!"}</p>
									<div className="mt-auto flex items-center justify-between">
										<span className="text-sm font-semibold text-white/80">{thread.users_count} tag</span>
										<Link to={`/communities/${thread.id}`} className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:border-white/40 hover:bg-white/10">Megnézem</Link>
									</div>
								</div>
							</div>
						);
					})}

				</div>

				<Link to="/all-communities" className="mx-auto mt-8 block rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10">
					További közösségek
				</Link>

			</div>
		</section>
	);
};

export default Communities;