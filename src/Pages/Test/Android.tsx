import NetworkModule from "../../Components/Android/NetworkModule/NetworkModule";

const Android = () => {
	return (
		<>
			<div className="bg-[#424549] *:text-center min-h-screen flex justify-center flex-col border border-red-500 p-5 pt-25">
				<h1 className="text-2xl text-white font-bold">Android modules</h1>

				<NetworkModule />
			</div>
		</>
	);
};

export default Android;
