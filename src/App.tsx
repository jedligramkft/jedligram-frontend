import "./App.css";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CapacitorNavigator from "./Components/Utils/NavigationManager";
import Home from "./Pages/Home/Home";
import UserProfile from "./Pages/Test/UserProfile";

function App() {
	return (
		<>
		<Navbar />
		<BrowserRouter>
			<CapacitorNavigator />

			<Routes>
				<Route path="/" element={<Home />} />
        		<Route path="/user/:id" element={<UserProfile />} />
			</Routes>
		</BrowserRouter>
		<Footer />
		</>
	);
}

export default App;
