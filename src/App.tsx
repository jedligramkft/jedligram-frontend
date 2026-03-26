import CapacitorNavigator from "./Components/Utils/NavigationManager";
import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import AuthLayout from "./Layouts/AuthLayout";
import NavbarLayout from "./Layouts/MainLayout";
import Home from "./Pages/Home/Home";
import UserProfile from "./Pages/Profile/UserProfile";
import AllCommunities from "./Pages/Communities/AllCommunities";
import Community from "./Pages/Community/Community";
import CreateCommunity from "./Pages/Communities/CreateCommunity";
import CreatePost from "./Pages/Community/CreatePost";
import LoginPage from "./Pages/Auth/Login";
import SearchResults from "./Pages/Search/SearchResults";
import { GetUserThreads } from "./api/users";
import DeletedCommunity from "./Pages/Community/DeletedCommunity";
import { Verify2fa } from "./Pages/Auth/Verify2fa";

function App() {
	const location = useLocation();
	const authTokenName =
		import.meta.env.VITE_AUTH_TOKEN_NAME ?? "jedligram_token";
	const [isLoggedIn, setIsLoggedIn] = useState(() =>
		Boolean(localStorage.getItem(authTokenName)),
	);

	useEffect(() => {
		if (location.hash) return;
		window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
	}, [location.pathname, location.search, location.hash]);

	useEffect(() => {
		const profileKey = "jedligram_profile";

		const readProfile = (): any => {
			try {
				const raw = localStorage.getItem(profileKey);
				return raw ? JSON.parse(raw) : {};
			} catch {
				return {};
			}
		};

		const writeProfile = (next: any) => {
			localStorage.setItem(profileKey, JSON.stringify(next));
			window.dispatchEvent(new Event("joined-threads-changed"));
		};

		const syncJoinedThreads = async () => {
			if (!isLoggedIn) return;
			const profile = readProfile();
			const rawId = profile?.userId;
			const userId =
				typeof rawId === "number"
					? rawId
					: typeof rawId === "string"
						? Number(rawId)
						: NaN;

			const resolvedUserId = Number.isFinite(userId) ? userId : undefined;
			if (!resolvedUserId) return;

			try {
				const response = await GetUserThreads(resolvedUserId);
				const raw = response.data;
				const list = Array.isArray(raw)
					? raw
					: Array.isArray((raw as any)?.threads)
						? (raw as any).threads
						: Array.isArray((raw as any)?.data)
							? (raw as any).data
							: [];

				const joinedThreads = list
					.filter(
						(t: any) =>
							t &&
							(typeof t.id === "number" ||
								typeof t.id === "string"),
					)
					.map((t: any) => ({
						id: Number(t.id),
						name: typeof t.name === "string" ? t.name : undefined,
					}))
					.filter((t: any) => Number.isFinite(t.id));

				const joinedThreadIds = joinedThreads.map((t: any) => t.id);
				writeProfile({
					...profile,
					userId: profile?.userId ?? resolvedUserId,
					joinedThreads,
					joinedThreadIds,
				});
			} catch {
				console.warn(
					"Failed to sync joined threads for user",
					resolvedUserId,
				);
			}
		};

		syncJoinedThreads();
	}, [isLoggedIn]);

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
					<Route path="search" element={<SearchResults />} />
					<Route
						path="all-communities"
						element={<AllCommunities isLoggedIn={isLoggedIn} />}
					/>
					<Route
						path="create-community"
						element={<CreateCommunity isLoggedIn={isLoggedIn} />}
					/>
					<Route
						path="communities/:id"
						element={<Community isLoggedIn={isLoggedIn} />}
					/>
					<Route
						path="communities/:id/deleted"
						element={<DeletedCommunity />}
					/>
					<Route
						path="communities/:id/posts/new"
						element={<CreatePost />}
					/>
					{/* <Route path="profile" element={<Profile isLoggedIn={isLoggedIn} />} /> */}
					<Route path="users/:id" element={<UserProfile />} />
				</Route>

				<Route path="auth" element={<AuthLayout />}>
					<Route path="login" element={<LoginPage />} />
					<Route path="verify-2fa" element={<Verify2fa />} />
				</Route>
			</Routes>
		</>
	);
}

export default App;
