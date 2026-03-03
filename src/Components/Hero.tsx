import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { ThreadData } from '../Interfaces/ThreadData';
import { GetThreads } from '../api/threads';

const Hero = () => {
	const navigate = useNavigate()
	const [query, setQuery] = useState('')
	const [threads, setThreads] = useState<ThreadData[]>([])

	useEffect(() => {
		const fetchThreads = async () => { 
			try{
				const response = await GetThreads();
				setThreads(Array.isArray(response.data) ? response.data : []);
			}
			catch(error){
				{
					const message = (error as any)?.response?.data?.message;
					if (message) {
						alert(message);
						return;
					}
				}
				console.error("Error fetching threads:", error);
			}
		};
		fetchThreads();
	}, [])

	const handleClick = () => {
		const q = query.trim()
		if (q === '') return
		navigate(`/search?q=${encodeURIComponent(q)}`)
	}

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

	const hasQuery = query.trim().length > 0
	const showDropdown = hasQuery

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
					<div className="relative mx-auto mt-8 w-full max-w-2xl">
					<div className="flex justify-center">
						<div className="flex w-full max-w-xl">
								<input
									type="text"
									placeholder="Keress csoportot..."
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									className="flex-1 px-6 py-3 bg-white text-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
								<button type="button" onClick={handleClick} className="bg-linear-to-r from-blue-500 to-blue-600 px-6 py-3 rounded-r-lg text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-md">
								<FontAwesomeIcon icon={faMagnifyingGlass} />
							</button>
							</div>
						</div>

						{showDropdown && (
							<div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 p-2 text-left shadow-xl">
								{filteredThreads.length > 0 ? (
									<div className="max-h-72 overflow-y-auto">
										{filteredThreads.slice(0,3).map((thread) => (
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
								) : (
									<p className="px-4 py-3 text-sm text-gray-600">Nincs találat.</p>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Hero;