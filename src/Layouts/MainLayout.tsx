import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import Footer from "../Components/Footer";
import ScrollToTopButton from "../Components/Utils/ScrollToTopButton";

interface MainLayoutProps {
	isLoggedIn: boolean;
}

const MainLayout = ({ isLoggedIn }: MainLayoutProps) => {
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
				isLoggedIn={isLoggedIn}
			/>
			<Outlet />
			<Footer />
			<ScrollToTopButton />
		</>
	);
};

export default MainLayout;
