import { useState } from "react";
import { Link } from "react-router-dom";

interface SidebarProps {
  closeSidebar: () => void;
  isSidebarOpen: boolean;
  userCommunities: { id: number; name: string; image: string }[] | null;
  isLoggedIn: boolean;
}


const Sidebar = ({ closeSidebar, isSidebarOpen, userCommunities, isLoggedIn }: SidebarProps) => {
  const [activeCommunity, setActiveCommunity] = useState(1);

//   const communities = [
//     { id: 1, name: "Community 1", image: "/Images/communityLogo.png" },
//     { id: 2, name: "Community 2", image: "/Images/communityLogo.png" },
//     { id: 3, name: "Community 3", image: "/Images/communityLogo.png" },
//   ];

  return (
    <>
      <div onClick={closeSidebar} className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} />
        <div className={`fixed top-0 left-0 h-screen w-48 md:w-64 z-50 flex flex-col py-4 items-center transform transition-transform duration-300 ease-in-out bg-linear-to-r from-[#1a1d23] to-[#2a2d31] ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {isLoggedIn ? (
          userCommunities && userCommunities.length > 0 ? (
            userCommunities.map(c => (
            <div key={c.id} onClick={() => { setActiveCommunity(c.id); closeSidebar(); }} className="flex items-center cursor-pointer mb-4">
                <img src={c.image} alt={c.name} className={`w-12 h-12 rounded-full transition-all duration-200 ${activeCommunity === c.id ? "rounded-2xl" : "group-hover:rounded-2xl"}`} />
                <span className="ml-4 text-white font-medium">{c.name}</span>
            </div>
            ))
        ) : (
            <div className="flex flex-col items-center justify-center mt-20 text-white text-center px-4">
              <p className="mb-4">Nem vagy egy közösség tagja sem.</p>
            </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center mt-20 text-white text-center px-4">
          <p className="mb-4">Kérlek, jelentkezz be a közösségek megtekintéséhez.</p>
          <Link to="/auth/login" className="rounded-2xl bg-blue-500 px-6 py-2 font-semibold hover:bg-blue-600 transition">
            Jelentkezz be
          </Link>
        </div>
        )}
        </div>
    </>
  );
};

export default Sidebar;
