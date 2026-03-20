import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useThreads } from "../hooks/useThreads";
import { getActiveTheme, toggleTheme } from "../theme";
import DynamicFAIcon from "./Utils/DynamicFaIcon";

interface NavbarProps {
	onToggleSidebar?: () => void;
	isSidebarOpen: boolean;
}

const Navbar = ({ onToggleSidebar, isSidebarOpen }: NavbarProps) => {
	const navigate = useNavigate();
	const [query, setQuery] = useState("");
	const [activeTheme, setActiveTheme] = useState(() => getActiveTheme());
	const threads = useThreads();

	useEffect(() => {
		const onThemeChanged = () => setActiveTheme(getActiveTheme());
		window.addEventListener("theme-changed", onThemeChanged);
		return () =>
			window.removeEventListener("theme-changed", onThemeChanged);
	}, []);

	const filteredThreads = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		if (!normalizedQuery) return [];

		return threads.filter((thread) => {
			const name = String((thread as any)?.name ?? "").toLowerCase();
			const category = String(
				(thread as any)?.category ?? "",
			).toLowerCase();
			return (
				name.includes(normalizedQuery) ||
				category.includes(normalizedQuery)
			);
		});
	}, [query, threads]);

	const handleClick = () => {
		const q = query.trim();
		if (q === "") return;
		navigate(`/search?q=${encodeURIComponent(q)}`);
	};

	return (
		<nav className="bg-linear-to-r from-[#1a1d23] to-[#2a2d31] border-b border-gray-700 text-white shadow-lg sticky top-0 z-50 poppins-regular">
			<div className="pl-3 pr-6 md:pl-6 md:pr-12 py-4 flex items-center justify-between relative">
				<button
					onClick={() => {
						onToggleSidebar?.();
					}}
					className="h-12 w-12 text-white flex items-center justify-center"
				>
					{isSidebarOpen ? (
						<DynamicFAIcon exportName="faTimes" size="lg" />
					) : (
						<DynamicFAIcon exportName="faBars" size="lg" />
					)}
				</button>

				<div className="flex flex-row gap-10">
					{/* Theme Toggle  */}
					<button
						type="button"
						onClick={() => setActiveTheme(toggleTheme())}
						className="p-2 rounded-lg hover:bg-white/10 transition text-white"
						aria-label={
							activeTheme === "dark"
								? "Világos téma"
								: "Sötét téma"
						}
						title={
							activeTheme === "dark"
								? "Világos téma"
								: "Sötét téma"
						}
					>
						{activeTheme === "dark" ? (
							<svg
								className="h-5 w-5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<circle cx="12" cy="12" r="5" />
								<path d="M12 1v2" />
								<path d="M12 21v2" />
								<path d="M4.22 4.22l1.42 1.42" />
								<path d="M18.36 18.36l1.42 1.42" />
								<path d="M1 12h2" />
								<path d="M21 12h2" />
								<path d="M4.22 19.78l1.42-1.42" />
								<path d="M18.36 5.64l1.42-1.42" />
							</svg>
						) : (
							<svg
								className="h-5 w-5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
							</svg>
						)}
					</button>
					<Link to="/">
						<img
							src="/Images/jedligram_logo.png"
							alt="Jedligram logo"
							className="h-12 w-12 opacity-90 brightness-200"
						/>
					</Link>
				</div>

				{/* Search Bar */}
				<form
					className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2"
					onSubmit={(e) => {
						e.preventDefault();
						handleClick();
					}}
				>
					{/* Search Input */}
					<input
						type="text"
						placeholder="Közösségek keresése..."
						value={query}
						onChange={(e) => {
							setQuery(e.target.value);
						}}
						className="w-72 lg:w-96 px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
					/>
					{/* Seach results */}
					{filteredThreads.length > 0 && (
						<div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 p-2 text-left shadow-xl">
							<div className="max-h-72 overflow-y-auto">
								{filteredThreads.slice(0, 3).map((thread) => (
									<Link
										key={thread.id}
										to={`/communities/${thread.id}`}
										className="block rounded-xl px-4 py-3 transition hover:bg-white"
									>
										<div className="flex items-center justify-between gap-4">
											<div>
												<p className="text-sm font-semibold text-gray-800">
													{thread.name}
												</p>
												<p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
													{thread.category}
												</p>
											</div>
										</div>
									</Link>
								))}
							</div>
						</div>
					)}
				</form>
			</div>
		</nav>
	);
};

export default Navbar;
