import CapacitorNavigator from "./Components/Utils/NavigationManager";
import { Route, Routes } from "react-router-dom";
import AuthLayout from "./Layouts/AuthLayout";
import NavbarLayout from "./Layouts/MainLayout";
import LoginPage from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import Home from "./Pages/Home/Home";
import Profile from "./Pages/Profile/Profile";
import AllCommunities from "./Pages/Communities/AllCommunities";
import Community from "./Pages/Community/Community";
import CreateCommunity from "./Pages/Communities/CreateCommunity";
import VerifyEmail from "./Pages/Auth/VerifyEmail";
import { isLoggedIn } from "./api/auth";

function App() {
	return (
		<>
			<CapacitorNavigator />
			<Routes>
				<Route element={<NavbarLayout />}>
					<Route index element={<Home />} />
					<Route
						path="all-communities"
						element={<AllCommunities isLoggedIn={isLoggedIn()} />}
					/>
					<Route
						path="create-community"
						element={<CreateCommunity isLoggedIn={isLoggedIn()} />}
					/>
					<Route path="communities/:id" element={<Community />} />
					<Route path="profile" element={<Profile />} />
				</Route>

				<Route path="auth" element={<AuthLayout />}>
					<Route path="login" element={<LoginPage />} />
					<Route path="register" element={<Register />} />
					<Route path="verify-email" element={<VerifyEmail />} />
				</Route>
			</Routes>
		</>
	);
}

export default App;
