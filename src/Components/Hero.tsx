import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { useMemo, useState } from 'react'

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
];

const Hero = () => {
	const [query, setQuery] = useState('')

	const filteredCommunities = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase()
		if (!normalizedQuery) return []

		return communities.filter((community) => {
			return (
				community.name.toLowerCase().includes(normalizedQuery) ||
				community.category.toLowerCase().includes(normalizedQuery)
			)
		})
	}, [query])

	return (
		<div>
			<div className="bg-linear-to-b from-[#424549] to-[#2a2d31] md:min-h-150 min-h-150 flex items-center justify-center relative overflow-hidden poppins-regular">
				<div className="absolute inset-0 bg-black opacity-20 z-0"></div>
				<img
					src="/Images/hero-background.jpg"
					alt="Hero Image"
					className="absolute w-full h-full object-cover z-0 shadow-2xl"
				/>
				<div className="text-center relative z-10 px-4">
					<h1 className="md:text-4xl text-4xl font-black text-white mb-4 drop-shadow-lg">
						Üdvözlünk a Jedligram oldalán!
					</h1>
					<p className="text-2xl text-gray-100 mt-4 font-medium drop-shadow-md mb-8">
						Játék, közösség, és szórakozás egy helyen.
					</p>
					<div className="mt-8 flex justify-center gap-2 ">
						<input type="text" placeholder="Keress csoportot..." value={query} onChange={(e) => setQuery(e.target.value)} className="md:w-200 sm:w-xs px-6 py-3 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1" />
						<button type="button" className="bg-linear-to-r from-blue-500 to-blue-600 px-6 py-3 rounded-lg text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-md">
							<FontAwesomeIcon icon={faMagnifyingGlass} />
						</button>
					</div>

					{query.trim() && (
						<div className="mx-auto mt-4 w-full max-w-2xl rounded-2xl border border-white/10 bg-white/10 p-4 text-left shadow-xl shadow-black/30 backdrop-blur">
							{filteredCommunities.length > 0 ? (
								<div className="grid gap-3">
									{filteredCommunities.map((community) => (
										<div key={community.name} className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4">
											<div className={`absolute inset-0 bg-linear-to-br ${community.accent} opacity-0 transition duration-500 group-hover:opacity-100`}/>
											<div className="relative z-10 flex items-center justify-between gap-4">
												<div>
													<p className="text-sm font-semibold text-white">{community.name}</p>
													<p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">{community.category}</p>
												</div>
												<p className="text-xs font-semibold text-white/80">{community.members}</p>
											</div>
										</div>
									))}
								</div>
							) : (
								<p className="text-sm text-white/70">Nincs találat.</p>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Hero;