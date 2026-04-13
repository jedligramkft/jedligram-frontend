import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
	const { t } = useTranslation();

	const currentYear = new Date().getFullYear();
	const logoUrl = new URL("/Images/jedligram_logo.png", import.meta.url).href;

	return (
		<footer className="relative overflow-hidden border-t border-white/10 bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]" />
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]" />
			<div className="pointer-events-none absolute inset-0 bg-black/25" />

			<div className="relative z-10 w-full h-full flex flex-col md:flex-row gap-10 items-center justify-evenly *:w-full md:*:w-1/6 py-10">
				<div
					className="flex flex-col md:items-start items-center justify-center gap-4 md:gap-1
					*:text-white/60 *:hover:text-white *:transition"
				>
					<Link to="/" className="">
						{t("footer.home")}
					</Link>
					<Link
						to="https://github.com/jedligramkft"
						target="_blank"
						rel="noopener noreferrer"
					>
						{t("footer.github")}
					</Link>
					<Link
						to="mailto:jedligram@gmail.com"
						target="_blank"
						rel="noopener noreferrer"
					>
						{t("footer.contact")}
					</Link>
					<Link
						to="https://www.jedlik.eu"
						target="_blank"
						rel="noopener noreferrer"
					>
						{t("footer.jedlik")}
					</Link>
				</div>
				<div className="flex items-center justify-center md:justify-center">
					<span>
						&copy; {currentYear} Jedligram. {t("footer.copyright")}
					</span>
				</div>
				<div className="flex items-center justify-center">
					<img
						src={logoUrl}
						alt={t("common.brand_logo_alt")}
						className="h-14 w-14 opacity-90 brightness-200"
						loading="lazy"
					/>
				</div>
			</div>
			{/* <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-10 text-sm text-white/70 md:px-12">
				<div className="flex items-center justify-between gap-8 text-center bg-blue-500">
					<div className="flex items-center justify-center md:justify-start">
						<img
							src={logoUrl}
							alt="Jedligram logo"
							className="h-14 w-14 opacity-90 brightness-200"
							loading="lazy"
						/>
					</div>
					<div className="flex items-center justify-center md:justify-center">
						<span>
							&copy; {currentYear} Jedligram.{" "}
							{t("footer.copyright")}
						</span>
					</div>
					<div className="grid grid-cols-2 gap-2 h-full text-center">
						<Link
							to="/"
							className="text-white/70 hover:text-white transition"
						>
							{t("footer.home")}
						</Link>
						<Link
							to="https://github.com/jedligramkft"
							target="_blank"
							rel="noopener noreferrer"
						>
							{t("footer.github")}
						</Link>
						<Link
							to="mailto:jedligram@gmail.com"
							target="_blank"
							rel="noopener noreferrer"
						>
							{t("footer.contact")}
						</Link>
						<Link
							to="https://www.jedlik.eu"
							target="_blank"
							rel="noopener noreferrer"
						>
							{t("footer.jedlik")}
						</Link>
					</div>
				</div>
			</div> */}
		</footer>
	);
};

export default Footer;
