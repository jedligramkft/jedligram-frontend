import CapacitorNavigator from "./Components/Utils/NavigationManager";
import { Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import AuthLayout from "./Layouts/AuthLayout";
import NavbarLayout from "./Layouts/MainLayout";
import Register from "./Pages/Auth/Register";
import Home from "./Pages/Home/Home";
import Profile from "./Pages/Profile/Profile";
import UserProfile from "./Pages/Profile/UserProfile";
import AllCommunities from "./Pages/Communities/AllCommunities";
import Community from "./Pages/Community/Community";
import CreateCommunity from "./Pages/Communities/CreateCommunity";
import VerifyEmail from "./Pages/Auth/VerifyEmail";
import CreatePost from "./Pages/Community/CreatePost";
import ChangePassword from "./Pages/Auth/ChangePassword";
import LoginPage from "./Pages/Auth/Login";

function App() {
  const authTokenName = import.meta.env.VITE_AUTH_TOKEN_NAME ?? "jedligram_token";
  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    Boolean(localStorage.getItem(authTokenName)),
  );

  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(Boolean(localStorage.getItem(authTokenName)));
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === authTokenName) {
        syncAuth();
      }
    };

    window.addEventListener("auth-changed", syncAuth);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("auth-changed", syncAuth);
      window.removeEventListener("storage", onStorage);
    };
  }, [authTokenName]);

  return (
    <>
      <CapacitorNavigator />
      <Routes>

		    <Route element={<NavbarLayout isLoggedIn={isLoggedIn} />}>
          <Route index element={<Home />} />
			    <Route path="all-communities" element={<AllCommunities isLoggedIn={isLoggedIn} />} />
			    <Route path="create-community" element={<CreateCommunity isLoggedIn={isLoggedIn} />} />
          <Route path="communities/:id" element={<Community isLoggedIn={isLoggedIn} /> } />
          <Route path="communities/:id/posts/new" element={<CreatePost />}/>
          <Route path="profile" element={<Profile isLoggedIn={isLoggedIn} />}  />
          <Route path="users/:id" element={<UserProfile />} />
        </Route>

        <Route path="auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<Register />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

      </Routes>
    </>
  );
}

export default App;

