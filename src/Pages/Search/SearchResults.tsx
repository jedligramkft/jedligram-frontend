import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { ThreadData } from "../../Interfaces/ThreadData";
import { SearchThreads } from "../../api/threads";

// type PostResult = {
//   id: number;
//   title: string;
//   content: string;
//   thread_id: number;
// };

const SearchResults = () => {
	const [searchParams] = useSearchParams();
	const q = (searchParams.get("q") ?? "").trim();

	const [threadResults, setThreadResults] = useState<ThreadData[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string>("");

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			if (!q) {
				setThreadResults([]);
				setError("");
				return;
			}

			setIsLoading(true);
			setError("");

			try {
				const response = await SearchThreads(q);

				if (cancelled) return;

				setThreadResults(response.data ? response.data : []);
			} catch (err: unknown) {
				if (cancelled) return;
				const message =
					err instanceof Error
						? err.message
						: "Ismeretlen hiba történt.";

				setError(message);
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		};

		void load();
		return () => {
			cancelled = true;
		};
	}, [q]);

	return (
		<section className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]" />
			<div className="absolute inset-0 bg-black/30" />

			<div className="relative z-10 mx-auto flex max-w-4xl flex-col px-4 pb-12 pt-12">
				<div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
					<div className="flex items-start justify-between gap-4">
						<div>
							<h1 className="text-3xl font-black text-white">
								Keresési találatok
							</h1>
							<p className="mt-2 text-sm text-white/70">
								Kifejezés:{" "}
								<span className="font-semibold text-white/85">
									{q || "—"}
								</span>
							</p>
						</div>
						<Link
							to="/"
							className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10"
						>
							Vissza
						</Link>
					</div>

					{q && isLoading && (
						<div className="mt-8 text-sm text-white/70">
							Találatok betöltése…
						</div>
					)}

					{q && !isLoading && !error && (
						<div className="mt-8">
							<h2 className="text-xl font-semibold text-white">
								Közösségek
							</h2>
							<p className="mt-1 text-sm text-white/60">
								Találatok: {threadResults.length}
							</p>

							<div className="mt-4 grid gap-3">
								{threadResults.length === 0 ? (
									<div className="text-sm text-white/60">
										Nincs találat.
									</div>
								) : (
									threadResults.map((t) => (
										<Link
											key={t.id}
											to={`/communities/${t.id}`}
											className="block rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:border-white/20 hover:bg-white/5"
										>
											<p className="text-sm font-semibold text-white">
												{t.name}
											</p>
											<p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
												{t.category}
											</p>
											<p className="mt-2 text-sm text-white/70 line-clamp-2">
												{t.description}
											</p>
											{/* <p className='mt-3 text-xs text-white/50'>Tagok: {t.member_count}</p> */}
										</Link>
									))
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</section>
	);
};

export default SearchResults;
