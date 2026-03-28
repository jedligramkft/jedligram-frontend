import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getActiveTheme, toggleTheme } from "../theme";
import DynamicFAIcon from "./Utils/DynamicFaIcon";
import { MoonIcon } from "./CustomIcons/MoonIcon";
import { SunIcon } from "./CustomIcons/SunIcon";
import { Searchbar } from "./Searchbar/Searchbar";
import { useTranslation } from "react-i18next";

interface NavbarProps {
	onToggleSidebar?: () => void;
	isSidebarOpen: boolean;
}

const Navbar = ({ onToggleSidebar, isSidebarOpen }: NavbarProps) => {
	const [activeTheme, setActiveTheme] = useState(() => getActiveTheme());
	const { i18n } = useTranslation();
	const language = i18n.language;

	const handleLanguageChange = (lang: string) => {
		i18n.changeLanguage(lang);
		localStorage.setItem("language", lang);
	};

	useEffect(() => {
		const onThemeChanged = () => setActiveTheme(getActiveTheme());
		window.addEventListener("theme-changed", onThemeChanged);
		return () =>
			window.removeEventListener("theme-changed", onThemeChanged);
	}, []);

	return (
		<nav className="bg-linear-to-r from-[#1a1d23] to-[#2a2d31] border-b border-gray-700 text-white shadow-lg sticky top-0 z-50 poppins-regular">
			<div className="pl-3 pr-6 md:pl-6 md:pr-12 py-4 flex items-center justify-between relative">
				<button
					onClick={() => {
						onToggleSidebar?.();
					}}
					className="h-12 w-12 text-white flex items-center justify-center cursor-pointer"
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
						{activeTheme === "dark" ? <SunIcon /> : <MoonIcon />}
					</button>
					<div className="flex bg-white/5 rounded-lg p-1">
						<button onClick={() => handleLanguageChange("hu")} className={`px-3 py-1 rounded-md transition
							${language === "hu"
									? "bg-blue-500 text-white"
									: "hover:bg-white/10"
								}`}
							>HU
						</button>

						<button onClick={() => handleLanguageChange("en")} className={`px-3 py-1 rounded-md transition
							${language === "en"
								? "bg-blue-500 text-white"
								: "hover:bg-white/10"
								}`}
							>EN
						</button>
					</div>
					<Link to="/">
						<img
							src="/Images/jedligram_logo.png"
							alt="Jedligram logo"
							className="h-12 w-12 opacity-90 brightness-200"
						/>
					</Link>
				</div>

				<Searchbar
					formClass="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2"
					searchbarPlaceholder={i18n.t("navbar.search_placeholder")}
					searchbarClass="w-72 lg:w-96 px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
					hasButton={false}
				/>
			</div>
		</nav>
	);
};

export default Navbar;
