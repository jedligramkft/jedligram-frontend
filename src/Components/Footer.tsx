const Footer = () => {
	const currentYear = new Date().getFullYear();
	const logoUrl = new URL("/Images/jedligram_logo.png", import.meta.url).href;

	return (
		<footer className="relative overflow-hidden border-t border-white/10 bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]" />
			<div className="absolute inset-0 bg-black/25" />

			<div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-10 text-sm text-white/70 md:px-12">
				<div className="grid items-center gap-8 text-center md:grid-cols-3 md:text-left">
					<div className="flex items-center justify-center md:justify-start">
						<img
							src={logoUrl}
							alt="Jedligram logo"
							className="h-14 w-14 opacity-90 brightness-200"
							loading="lazy"
						/>
					</div>
					<div className="flex items-center justify-center md:justify-center">
						<span>&copy; {currentYear} Jedligram. Minden jog fenntartva.</span>
					</div>
					<div className="flex items-center justify-center gap-4 md:justify-end">
						<a href="#" className="text-white/70 hover:text-white transition">
							Közösség
						</a>
						<a href="#" className="text-white/70 hover:text-white transition">
							Játékok
						</a>
						<a href="#" className="text-white/70 hover:text-white transition">
							Profil
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
