"use client";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { UserData } from "../../Interfaces/UserData";
import { GetUserProfile, GetUserThreads } from "../../api/users";
import DynamicFAIcon from "../../Components/Utils/DynamicFaIcon";
import { Logout } from "../../api/auth";
import { EditProfile } from "./EditProfile";
import type { ThreadData } from "../../Interfaces/ThreadData";

const profileStorageKey =
	import.meta.env.VITE_PROFILE_STORAGE_KEY ?? "jedligram_profile";
const authTokenName = import.meta.env.VITE_AUTH_TOKEN_NAME ?? "jedligram_token";

const UserProfile = () => {
	const params = useParams();
	const navigate = useNavigate();

	const [isMyProfile, setIsMyProfile] = useState(false);
	const [targetUser, setTargetUser] = useState<UserData | null>(null);
	const [joinedThreads, setJoinedThreads] = useState<ThreadData[]>([]);

	// Check if the profile being viewed belongs to the logged-in user.
	const checkIsMyProfile = async (targetId: number) => {
		const requesterId = JSON.parse(
			localStorage.getItem(profileStorageKey) || "{}",
		)?.id;

		setIsMyProfile(requesterId === targetId);
		return requesterId === targetId;
	};

	// Fetch the profile data of the user being viewed.
	const getCurrentlyViewedUserProfile = async (userId: number) => {
		try {
			const response = await GetUserProfile(userId);
			if (response.status !== 200) {
				console.warn(
					"Nem sikerült betölteni a felhasználói adatokat.",
					response,
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

	// Fetch the number of threads the user has joined.
	const getJoinedThreads = async (userId: number) => {
		try {
			const response = await GetUserThreads(userId);
			if (response.status !== 200) {
				console.warn(
					"Nem sikerült betölteni a felhasználó közösségeit.",
					response,
				);
				setJoinedThreads({});
				return;
			}
			console.log(response.data);
			setJoinedThreads(response.data);
		} catch (err) {
			console.error(
				"Hiba történt a felhasználó közösségeinek lekérése közben:",
				err,
			);
			setJoinedThreads({});
		}
	};

	// Handle user logout and cleanup.
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

	useEffect(() => {
		const asyncInit = async () => {
			const targetId = Number(params.id);

			if (isNaN(targetId)) {
				console.warn("Érvénytelen user ID az URL-ben:", params.id);
				return;
			}
			if (!targetId) {
				console.warn("Nincs user ID az URL-ben.");
				return;
			}

			await checkIsMyProfile(targetId);

			await getCurrentlyViewedUserProfile(targetId);
			await getJoinedThreads(targetId);
		};

		asyncInit();
	}, [params.id]);

	return (
		<>
			<section className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] text-white poppins-regular">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]" />
				<div className="absolute inset-0 bg-black/30" />

				<div className="relative z-10 mx-auto max-w-4xl px-4 py-16">
					<div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
						<div className="p-8 flex flex-col md:flex-row items-center gap-8">
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
						<hr className="text-gray-700/50" />

						{isMyProfile && targetUser && (
							<>
								{/* Logout */}
								<div className="p-6 text-center">
									<button
										onClick={handleLogout}
										className="flex items-center justify-center w-full md:w-auto md:mx-auto gap-2 text-sm font-semibold text-red-500 transition hover:text-red-400"
									>
										<DynamicFAIcon exportName="faSignOutAlt" />
										Kijelentkezés
									</button>
								</div>
								<EditProfile
									targetUser={targetUser}
									saveCallback={setTargetUser}
								/>
							</>
						)}

						<hr className="text-gray-700/50" />
						<div className="flex flex-col items-center justify-center py-4">
							<p className="text-xs font-semibold uppercase tracking-wider text-white/60">
								Közösségek
							</p>
							<p className="mt-1 text-lg font-bold text-white">
								{joinedThreads.length || 0}
							</p>
						</div>
						<div className="flex gap-2.5 flex-wrap justify-center">
							{joinedThreads.length === 0 && (
								<p className="text-sm text-gray-500 col-span-full text-center">
									Nem csatlakozott közösségekhez.
								</p>
							)}
							{joinedThreads.map((thread) => (
								<div
									key={thread.id}
									onClick={() => {
										navigate("/communities/" + thread.id);
									}}
									className="w-full md:w-[calc(50%-10px)] bg-white/5 border border-white/10 rounded-lg p-4 cursor-pointer transition hover:bg-white/10"
								>
									<h3 className="text-lg font-semibold text-white">
										{thread.name}
									</h3>
									<p className="text-sm text-gray-400">
										{thread.description}
									</p>
									<p className="mt-2 text-xs text-gray-500">
										{thread.users_count} tag
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>
		</>
	);
};

export default UserProfile;
