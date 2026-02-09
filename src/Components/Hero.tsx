import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

const Hero = () => {
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
						<input
							type="text"
							placeholder="Keress csoportot..."
							className="md:w-200 sm:w-xs px-6 py-3 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
						/>
						<button className="bg-linear-to-r from-blue-500 to-blue-600 px-6 py-3 rounded-lg text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-md">
							<FontAwesomeIcon icon={faMagnifyingGlass} />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Hero;
