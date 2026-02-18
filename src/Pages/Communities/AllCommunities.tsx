import { Link } from "react-router-dom";

const communities = [
	{
		id: 1,
		name: "Jedlik Esport",
		category: "Akció",
		members: "3.2k tag",
		accent: "from-cyan-400/30 to-blue-500/20",
	},
	{
		id: 2,
		name: "Arcane RPG Klub",
		category: "RPG",
		members: "1.1k tag",
		accent: "from-purple-400/30 to-pink-500/20",
	},
	{
		id: 3,
		name: "Taktikus Stratégák",
		category: "Stratégia",
		members: "2.4k tag",
		accent: "from-emerald-400/30 to-lime-500/20",
	},
	{
		id: 4,
		name: "Retro Arena",
		category: "Akció",
		members: "950 tag",
		accent: "from-amber-400/30 to-orange-500/20",
	},
	{
		id: 5,
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
	{
		id: 6,
		name: "Retro Arena",
		category: "Akció",
		members: "950 tag",
		accent: "from-amber-400/30 to-orange-500/20",
	},
	{
		id: 7,
		name: "Dungeon Crafters",
		category: "RPG",
		members: "740 tag",
		accent: "from-indigo-400/30 to-slate-500/20",
	},
	{
		id: 8,
		name: "Legendás Hadjáratok",
		category: "Stratégia",
		members: "1.8k tag",
		accent: "from-rose-400/30 to-red-500/20",
	},
];

const AllCommunities = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular">
        <div className="container mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Közösségek</h1>
                <Link to={'/create-community'} className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-2 rounded-lg font-semibold transition shadow-md text-white">
                    Közösség létrehozása
                </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {communities.map((community) => (
                    <div key={community.name} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur transition hover:-translate-y-1 hover:border-white/20">
                        <div className={`absolute inset-0 bg-linear-to-br ${community.accent} opacity-0 transition duration-500 group-hover:opacity-100`}/>
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
                                Csatlakozz heti eseményekhez, közös stratégiákhoz és barátságos versenyekhez.
                            </p>
                            <div className="mt-auto flex items-center justify-between">
                                <span className="text-sm font-semibold text-white/80">
                                    {community.members}
                                </span>
                                <Link to={`/communities/${community.id}`} className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:border-white/40 hover:bg-white/10">
                                    Megnézem
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
  )
}

export default AllCommunities
