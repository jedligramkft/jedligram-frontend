"use client";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFilteredThreads } from "./SearchEngine";
import { getActiveTheme } from "../../theme";
import DynamicFAIcon from "../Utils/DynamicFaIcon";

interface SearchbarProps {
	formClass?: string;
	SearchbarClass?: string;
	SearchbarPlaceholder?: string;
	hasButton: boolean;
	buttonClass?: string;
}

export const Searchbar = ({
	formClass,
	SearchbarClass,
	SearchbarPlaceholder,
	hasButton,
	buttonClass,
}: SearchbarProps) => {
	const navigate = useNavigate();
	const [query, setQuery] = useState("");
	const filteredThreads = useFilteredThreads(query);

	const [activeTheme, setActiveTheme] = useState(() => getActiveTheme());

	useEffect(() => {
		const onThemeChanged = () => setActiveTheme(getActiveTheme());
		window.addEventListener("theme-changed", onThemeChanged);
		return () =>
			window.removeEventListener("theme-changed", onThemeChanged);
	}, []);

	const dropdownClass =
		activeTheme === "dark"
			? "absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-lg border border-gray-700 bg-[#0b0d0f] p-2 text-left shadow-xl"
			: "absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 p-2 text-left shadow-xl";

	const itemTextClass =
		activeTheme === "dark"
			? "text-sm font-semibold text-white"
			: "text-sm font-semibold text-gray-800";

	const itemCategoryClass =
		activeTheme === "dark"
			? "text-xs font-semibold uppercase tracking-[0.2em] text-gray-300"
			: "text-xs font-semibold uppercase tracking-[0.2em] text-gray-500";

	const itemHoverClass =
		activeTheme === "dark" ? "hover:bg-white/5" : "hover:bg-white";

	const handleClick = () => {
		const q = query.trim();
		if (q === "") return;
		navigate(`/search?q=${encodeURIComponent(q)}`);
	};

	return (
		<>
			{/* Search Bar */}
			<form
				className={formClass ? formClass : "relative"}
				onSubmit={(e) => {
					e.preventDefault();
					handleClick();
				}}
			>
				{/* Search Input */}
				<input
					type="text"
					placeholder={
						SearchbarPlaceholder
							? SearchbarPlaceholder
							: "Keress közösséget..."
					}
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
					}}
					className={
						SearchbarClass
							? SearchbarClass
							: "w-full px-4 py-2 rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
					}
				/>
				{hasButton && (
					<button
						type="button"
						onClick={handleClick}
						className={
							buttonClass
								? buttonClass
								: "absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
						}
					>
						<DynamicFAIcon exportName="faMagnifyingGlass" />
					</button>
				)}
				{/* Search results */}
				{filteredThreads.length > 0 && (
					<div className={dropdownClass}>
						<div className="max-h-72 overflow-y-auto">
							{filteredThreads.slice(0, 3).map((thread) => (
								<Link
									key={thread.id}
									to={`/communities/${thread.id}`}
									className={`block rounded-xl px-4 py-3 transition ${itemHoverClass}`}
								>
									<div className="flex items-center justify-between gap-4">
										<div>
											<p className={itemTextClass}>
												{thread.name}
											</p>
											<p className={itemCategoryClass}>
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
		</>
	);
};
