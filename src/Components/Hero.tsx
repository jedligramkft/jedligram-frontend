import { useState, useEffect } from "react";
import { getActiveTheme } from "../theme";
import { Searchbar } from "./Searchbar/Searchbar";

const Hero = () => {
	const [activeTheme, setActiveTheme] = useState(() => getActiveTheme());

	useEffect(() => {
		const onThemeChanged = () => setActiveTheme(getActiveTheme());
		window.addEventListener("theme-changed", onThemeChanged);
		return () =>
			window.removeEventListener("theme-changed", onThemeChanged);
	}, []);

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
					<Searchbar
						hasButton={true}
						searchbarPlaceholder="Keress közösségeket..."
						searchbarClass="flex-1 px-6 py-3 bg-white text-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						buttonClass="cursor-pointer bg-linear-to-r from-blue-500 to-blue-600 px-6 py-3 rounded-r-lg text-white keep-white font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-md"
						formClass="flex items-center justify-center relative w-full max-w-2xl mx-auto"
					/>
				</div>
			</div>
		</div>
	);
};

export default Hero;
