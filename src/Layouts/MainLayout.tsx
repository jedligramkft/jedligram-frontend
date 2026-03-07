import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import Footer from "../Components/Footer";

interface MainLayoutProps {
	isLoggedIn: boolean;
}

const MainLayout = ({ isLoggedIn }: MainLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
	    <Navbar toggleSidebar={() => setIsSidebarOpen(prev => !prev)} isLoggedIn={isLoggedIn} />
        <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} isLoggedIn={isLoggedIn} />
      <Outlet />
      <Footer isLoggedIn={isLoggedIn} />
    </>
  );
};

export default MainLayout;
