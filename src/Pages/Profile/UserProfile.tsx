"use client";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { UserData } from "../../Interfaces/UserData";
import { GetUserProfile } from "../../api/users";
import DynamicFAIcon from "../../Components/Utils/DynamicFaIcon";
import { Logout } from "../../api/auth";
import { EditProfile } from "./EditProfile";

const profileStorageKey =
	import.meta.env.VITE_PROFILE_STORAGE_KEY ?? "jedligram_profile";
const authTokenName = import.meta.env.VITE_AUTH_TOKEN_NAME ?? "jedligram_token";
const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8080";

const UserProfile = () => {
	const params = useParams();
	const navigate = useNavigate();
	// const [joinedCommunities, setJoinedCommunities] = useState<{ id: number; name: string; role: string }[]>([]);

	// useEffect(() => {
	//   const fetchUserThreads = async () => {
	//     if (!id) return;

	//     try {
	//       const response = await GetUserThreads(Number(id));
	//       setJoinedCommunities(response.data);
	//     } catch (err) {
	//       console.warn("Nem sikerült betölteni a közösségeket.", err);
	//       setJoinedCommunities([]);
	//     }
	//   };

	//   fetchUserThreads();
	// }, [id]);
	const [isMyProfile, setIsMyProfile] = useState(false);
	const [targetUser, setTargetUser] = useState<UserData | null>(null);

	const checkIsMyProfile = async () => {
		const requesterId = JSON.parse(
			localStorage.getItem(profileStorageKey) || "{}",
		)?.id;
		const targetId = Number(params.id);

		setIsMyProfile(requesterId === targetId);
	};

	useEffect(() => {
		const getViewedUserProfile = async (userId: number) => {
			if (isNaN(userId)) {
				console.warn("Érvénytelen user ID:", params.id);
				setTargetUser(null);
				return;
			}
			try {
				const response = await GetUserProfile(userId);
				if (response.status !== 200) {
					console.warn(
						"Nem sikerült betölteni a felhasználói adatokat.",
					);
					setTargetUser(null);
					return;
				}
				//Successfully got user data
				setTargetUser(response.data);
			} catch (err) {
				console.error(
					"Hiba történt a felhasználói adatok lekérése közben:",
					err,
				);
				setTargetUser(null);
			}
		};
		checkIsMyProfile();

		getViewedUserProfile(Number(params.id));
	}, []);

	const handleLogout = async () => {
		try {
			await Logout();
		} catch (err) {
			console.error("Logout failed:", err);
		} finally {
			localStorage.removeItem(authTokenName);
			localStorage.removeItem(profileStorageKey);
			window.dispatchEvent(new Event("auth-changed"));
			navigate("/auth/login", { replace: true });
		}
	};

	return (
		<>
			<div
				className="absolute max-w-full w-dvw h-1 z-50"
				style={{ backgroundColor: isMyProfile ? "green" : "red" }}
			/>
			<section className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] text-white poppins-regular">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]" />
				<div className="absolute inset-0 bg-black/30" />

				<div className="relative z-10 mx-auto max-w-4xl px-4 py-16">
					<div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
						<div className="p-8 border-b border-gray-700/50 flex flex-col md:flex-row items-center gap-8">
							<div className="relative">
								<div className="h-32 w-32 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-5xl font-black shadow-lg">
									{targetUser?.image_url ? (
										<img
											src={targetUser.image_url}
											alt="Profilkép"
											className="h-full w-full object-cover rounded-full"
										/>
									) : (
										<span>
											{targetUser?.name
												?.split(" ")[0]
												?.charAt(0)}{" "}
											{targetUser?.name
												?.split(" ")[1]
												?.charAt(0)}
										</span>
									)}
								</div>
							</div>
							<div className="text-center md:text-left">
								<h1 className="text-4xl font-bold">
									{targetUser?.name || "Felhasználó"}
								</h1>
								<p className="mt-2 text-lg text-gray-400">
									{targetUser?.email}
								</p>
								<p className="mt-4 text-sm text-gray-300 max-w-md">
									{targetUser?.bio || "Nincs bemutatkozás."}
								</p>
							</div>
						</div>

						<div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6 text-center">
							<div>
								<p className="text-xs font-semibold uppercase tracking-wider text-white/60">
									Közösség
								</p>
								{/* <p className="mt-1 text-lg font-bold text-white">
									{joinedThreadIds.length}
								</p> */}
							</div>
							<div>
								<p className="text-xs font-semibold uppercase tracking-wider text-white/60">
									Posztok
								</p>
								<p className="mt-1 text-lg font-bold text-white">
									TBI
								</p>
							</div>
							<div>
								<p className="text-xs font-semibold uppercase tracking-wider text-white/60">
									Hozzászólások
								</p>
								<p className="mt-1 text-lg font-bold text-white">
									TBI
								</p>
							</div>
						</div>

						{isMyProfile && targetUser && (
							<>
								<EditProfile
									targetUser={targetUser}
									saveCallback={setTargetUser}
								/>
								{/* Logout */}
								<div className="p-6 border-t border-gray-700/50 text-center">
									<button
										onClick={handleLogout}
										className="flex items-center justify-center w-full md:w-auto md:mx-auto gap-2 text-sm font-semibold text-red-500 transition hover:text-red-400"
									>
										<DynamicFAIcon exportName="faSignOutAlt" />
										Kijelentkezés
									</button>
								</div>
							</>
						)}
					</div>
				</div>
			</section>
		</>
	);
};

export default UserProfile;
