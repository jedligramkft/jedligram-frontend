import "./App.css";
import Navbar from "./Components/Navbar";
import Hero from "./Components/Hero";
import Communities from "./Components/Communities";
import Footer from "./Components/Footer";
import Android from "./Pages/Test/Android";

function App() {
	return (
		<>
			<Navbar />
			<Hero />
			<Communities />
			<Footer />

			<Android />
		</>
	);
}

export default App;
