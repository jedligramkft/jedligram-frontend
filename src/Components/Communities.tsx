import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

const communities = [
	{
		name: "Jedlik Esport",
		category: "Akció",
		members: "3.2k tag",
		accent: "from-cyan-400/30 to-blue-500/20",
	},
	{
		name: "Arcane RPG Klub",
		category: "RPG",
		members: "1.1k tag",
		accent: "from-purple-400/30 to-pink-500/20",
	},
	{
		name: "Taktikus Stratégák",
		category: "Stratégia",
		members: "2.4k tag",
		accent: "from-emerald-400/30 to-lime-500/20",
	},
	{
		name: "Retro Arena",
		category: "Akció",
		members: "950 tag",
		accent: "from-amber-400/30 to-orange-500/20",
	},
	{
		name: "Dungeon Crafters",
		category: "RPG",
		members: "740 tag",
		accent: "from-indigo-400/30 to-slate-500/20",
	},
	{
		name: "Legendás Hadjáratok",
		category: "Stratégia",
		members: "1.8k tag",
		accent: "from-rose-400/30 to-red-500/20",
	},
];

const Communities = () => {
	return (
		<section className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]" />
			<div className="absolute inset-0 bg-black/25" />

            <div className='relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-20 pt-16 md:px-12'>
                <div className='flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur md:flex-row md:items-center md:justify-between md:p-8'>
                    <div>
                        <p className='text-sm font-semibold uppercase tracking-[0.2em] text-white/50'>Kiemelt ajánlatok</p>
                        <h1 className='mt-3 text-3xl font-black text-white drop-shadow md:text-5xl'>Kiemelt Közösségek</h1>
                        <p className='mt-3 max-w-xl text-sm text-white/70 md:text-base'>
                            Válogass a legaktívabb közösségek közül, szűrd őket kategória szerint, és csatlakozz a kedvenceidhez.
                        </p>
                    </div>
                    <div className='flex w-full flex-col gap-3 sm:flex-row md:w-auto'>
                        <div className='flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white shadow-lg'>
                            <FontAwesomeIcon icon={faFilter} className='text-white/70' />
                        <select className='w-full bg-transparent text-sm text-white outline-none [&>option]:bg-[#1f2226] [&>option]:text-white [&>option]:py-2'>
                            <option value='all'>Összes kategória</option>
                            <option value='action'>Akció</option>
                            <option value='rpg'>RPG</option>
                            <option value='strategy'>Stratégia</option>
                        </select>
                        </div>
                        <button className='rounded-2xl bg-linear-to-r from-blue-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:shadow-blue-500/50'>
                            Keresés
                        </button>
                    </div>
                </div>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{communities.map((community) => (
						<div
							key={community.name}
							className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur transition hover:-translate-y-1 hover:border-white/20"
						>
							<div
								className={`absolute inset-0 bg-linear-to-br ${community.accent} opacity-0 transition duration-500 group-hover:opacity-100`}
							/>
							<div className="relative z-10 flex h-full flex-col gap-4">
								<div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
									<span>{community.category}</span>
									<span className="rounded-full bg-white/10 px-3 py-1 text-[10px]">
										Aktív
									</span>
								</div>
								<h3 className="text-2xl font-semibold text-white">
									{community.name}
								</h3>
								<p className="text-sm text-white/70">
									Csatlakozz heti eseményekhez, közös stratégiákhoz és
									barátságos versenyekhez.
								</p>
								<div className="mt-auto flex items-center justify-between">
									<span className="text-sm font-semibold text-white/80">
										{community.members}
									</span>
									<button className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:border-white/40 hover:bg-white/10">
										Megnézem
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Communities;
