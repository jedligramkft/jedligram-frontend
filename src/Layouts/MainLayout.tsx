import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import Footer from "../Components/Footer";
import ScrollToTopButton from "../Components/Utils/ScrollToTopButton";

const MainLayout = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	return (
		<>
			<Navbar
				onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
				isSidebarOpen={isSidebarOpen}
			/>
			<Sidebar
				isSidebarOpen={isSidebarOpen}
				closeSidebar={() => setIsSidebarOpen(false)}
			/>
			<Outlet />
			<Footer />
			<ScrollToTopButton />
		</>
	);
};

export default MainLayout;
