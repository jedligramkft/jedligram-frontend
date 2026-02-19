import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import Footer from "../Components/Footer";
import { isLoggedIn } from "../api/auth";

const MainLayout = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	return (
		<>
			<Navbar
				isLoggedIn={isLoggedIn()}
				toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
			/>
			<Sidebar
				isSidebarOpen={isSidebarOpen}
				closeSidebar={() => setIsSidebarOpen(false)}
				userCommunities={null}
				isLoggedIn={isLoggedIn()}
			/>
			<Outlet />
			<Footer />
		</>
	);
};

export default MainLayout;
