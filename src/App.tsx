/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { VerificationPage } from "./Pages/Auth/Verification";

function App() {
	const location = useLocation();
	const authTokenName =
		import.meta.env.VITE_AUTH_TOKEN_NAME ?? "jedligram_token";
	const [isLoggedIn, setIsLoggedIn] = useState(() =>
		Boolean(localStorage.getItem(authTokenName)),
	);

	useEffect(() => {
		// Check if the URL contains a hash (e.g., #post-123). If not, exit early.
		const hash = location.hash;
		if (!hash) {
			window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
			return;
		}

		// Decode the hash to get the target element ID (e.g., "post-123").
		// This is necessary because URL fragments are percent-encoded.
		const targetId = decodeURIComponent(hash.slice(1));
		let attempt = 0; // Track the number of scroll attempts.
		let timeoutId: number | undefined; // Store the timeout ID for cleanup.

		// Function to attempt scrolling to the target element.
		const scrollToTarget = () => {
			// Find the target element by its ID.
			const targetElement = document.getElementById(targetId);
			if (targetElement) {
				// If the element exists, scroll it into view smoothly and center it in the viewport.
				targetElement.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});

				targetElement.classList.add("transition");
				targetElement.classList.add("duration-200");
				targetElement.classList.add("bg-white/10");
				setTimeout(() => {
					targetElement.classList.remove("bg-white/10");
				}, 1500);

				return; // Stop further attempts once scrolling is successful.
			}

			// If the element is not found and the maximum attempts are reached, stop retrying.
			if (attempt >= 20) {
				return;
			}

			// Increment the attempt counter and retry after a short delay (100ms).
			attempt += 1;
			timeoutId = window.setTimeout(scrollToTarget, 100);
		};

		// Start the scrolling attempts.
		scrollToTarget();

		// Cleanup function to clear any pending timeouts when the component unmounts
		// or when the dependency array changes.
		return () => {
			if (timeoutId !== undefined) {
				window.clearTimeout(timeoutId);
			}
		};
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
			<meta charSet="UTF-8" />
			<meta
				name="viewport"
				content="width=device-width, initial-scale=1.0"
			/>
			<meta
				name="description"
				content="Jedligram - A Reddit-like platform"
			/>
			<meta name="title" content="Jedligram" />
			<meta name="author" content="Jedligram Team" />
			<meta
				name="keywords"
				content="reddit, forum, discussion, community, jedlik, jedligram, social media, threads, posts, comments, upvote, downvote, suli, techkinum"
			/>

			<title>Jedligram</title>
			<link rel="icon" href="/favicon.ico" />

			<CapacitorNavigator />
			<Routes>
				<Route element={<NavbarLayout isLoggedIn={isLoggedIn} />}>
					<Route index element={<Home />} />
					<Route path="search" element={<SearchResults />} />
					<Route
						path="all-communities"
						element={<AllCommunities />}
					/>
					<Route
						path="create-community"
						element={<CreateCommunity />}
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
					<Route path="verification" element={<VerificationPage />} />
				</Route>
			</Routes>
		</>
	);
}

export default App;

{
	/* 
	TODO
		- DONE Drag-and-drop UI to handle uploaded file preview,
		- DONE Footer-ben a linkek kicserélése
		- Scrollbar
		- Gomb animációk
		- Fordítás
		- App.tsx isLoggedin eltüntetése
		- intercetptor nézze a 401-et és dobja be a login ablakot
		- Interceptor kezelheti az errorokat és dobhat egy toastot
	*/
}
