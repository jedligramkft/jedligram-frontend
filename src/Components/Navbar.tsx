import { Link } from "react-router-dom";
import DynamicFAIcon from "./Utils/DynamicFaIcon";
import { Searchbar } from "./Searchbar/Searchbar";
import { useTranslation } from "react-i18next";
import { GhostButton } from "./Buttons";

interface NavbarProps {
	onToggleSidebar?: () => void;
	isSidebarOpen: boolean;
}

const Navbar = ({ onToggleSidebar, isSidebarOpen }: NavbarProps) => {
	const { i18n, t } = useTranslation();
	const language = i18n.language;

	const handleLanguageChange = (lang: string) => {
		i18n.changeLanguage(lang);
		localStorage.setItem("language", lang);
	};

	return (
		<nav className="bg-linear-to-r from-[#1a1d23] to-[#2a2d31] border-b border-gray-700 text-white shadow-lg sticky top-0 z-70 poppins-regular">
			<div className="pl-3 pr-6 md:pl-6 md:pr-12 py-4 flex items-center justify-between relative">
				<GhostButton
					onClick={() => {
						onToggleSidebar?.();
					}}
					className="h-12 w-12">
					{isSidebarOpen ? (
						<DynamicFAIcon exportName="faTimes" size="lg" />
					) : (
						<DynamicFAIcon exportName="faBars" size="lg" />
					)}
				</GhostButton>

				<div className="flex flex-row gap-10">
					<div className="flex bg-white/5 rounded-lg p-1">
						<GhostButton
							onClick={() => handleLanguageChange("hu")}
							className={`px-3 py-1 rounded-md transition
							${language === "hu" ? "bg-blue-500 text-white" : "hover:bg-white/10"}`}>
							HU
						</GhostButton>

						<GhostButton
							onClick={() => handleLanguageChange("en")}
							className={`px-3 py-1 rounded-md transition
							${language === "en" ? "bg-blue-500 text-white" : "hover:bg-white/10"}`}>
							EN
						</GhostButton>
					</div>
					<Link to="/">
						<img
							src="/Images/jedligram_logo.png"
							alt={t("common.brand_logo_alt")}
							className="h-12 w-12 opacity-90 brightness-200"
						/>
					</Link>
				</div>

				<Searchbar
					formClass="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2"
					searchbarPlaceholder={t("navbar.search_placeholder")}
					searchbarClass="w-72 lg:w-96 px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
					hasButton={false}
				/>
			</div>
		</nav>
	);
};

export default Navbar;
