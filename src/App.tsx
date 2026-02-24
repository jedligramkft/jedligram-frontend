import CapacitorNavigator from "./Components/Utils/NavigationManager";
import { Route, Routes } from "react-router-dom";
import AuthLayout from "./Layouts/AuthLayout";
import NavbarLayout from "./Layouts/MainLayout";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import Home from "./Pages/Home/Home";
import Profile from "./Pages/Profile/Profile";
import UserProfile from "./Pages/Profile/UserProfile";
import AllCommunities from "./Pages/Communities/AllCommunities";
import Community from "./Pages/Community/Community";
import CreateCommunity from "./Pages/Communities/CreateCommunity";
import VerifyEmail from "./Pages/Auth/VerifyEmail";
import CreatePost from "./Pages/Community/CreatePost";

function App() {
  const authTokenName = import.meta.env.VITE_AUTH_TOKEN_NAME ?? "jedligram_token";
  const isLoggedIn = Boolean(localStorage.getItem(authTokenName));

  return (
    <>
      <CapacitorNavigator />
      <Routes>

		    <Route element={<NavbarLayout isLoggedIn={isLoggedIn} />}>
          <Route index element={<Home />} />
			    <Route path="all-communities" element={<AllCommunities isLoggedIn={isLoggedIn} />} />
			    <Route path="create-community" element={<CreateCommunity isLoggedIn={isLoggedIn} />} />
          <Route path="communities/:id" element={<Community />} />
          <Route path="communities/:id/posts/new" element={<CreatePost />} />
          <Route path="profile" element={<Profile />} />
          <Route path="users/:id" element={<UserProfile />} />
        </Route>

        <Route path="auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify-email" element={<VerifyEmail />} />
        </Route>

      </Routes>
    </>
  );
}

export default App;

