"use client";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { UserData } from "../../Interfaces/UserData";
import { GetUserProfile, GetUserThreads } from "../../api/users";
import DynamicFAIcon from "../../Components/Utils/DynamicFaIcon";
import { Logout } from "../../api/auth";
import { EditProfile } from "./EditProfile";
import type { ThreadData } from "../../Interfaces/ThreadData";
import ConfirmationModal from "../../Components/Modal/Modal";
import { PrimaryButton, SecondaryButton } from "../../Components/Buttons";

const profileStorageKey =
	import.meta.env.VITE_PROFILE_STORAGE_KEY ?? "jedligram_profile";
const authTokenName = import.meta.env.VITE_AUTH_TOKEN_NAME ?? "jedligram_token";

const UserProfile = () => {
	const params = useParams();
	const navigate = useNavigate();
	const { t } = useTranslation();

	const [isMyProfile, setIsMyProfile] = useState(false);
	const [targetUser, setTargetUser] = useState<UserData | null>(null);
	const [joinedThreads, setJoinedThreads] = useState<ThreadData[]>([]);
	const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] =
		useState(false);

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
				setJoinedThreads([]);
				return;
			}
			setJoinedThreads(response.data);
		} catch (err) {
			console.error(
				"Hiba történt a felhasználó közösségeinek lekérése közben:",
				err,
			);
			setJoinedThreads([]);
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

		setTargetUser(null);
		setJoinedThreads([]);

		asyncInit();
	}, [params.id]);

	return (
		<>
			<section className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] text-white poppins-regular">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]" />
				<div className="absolute inset-0 bg-black/30" />

				<div className="relative z-10 mx-auto max-w-4xl px-3 md:px-4 py-8 md:py-16">
					<div className="rounded-2xl md:rounded-3xl border border-white/10 bg-white/5 p-4 md:p-8 shadow-2xl shadow-black/30 backdrop-blur">
						<div className="w-full h-full p-3 md:p-6 flex flex-col md:flex-row items-center md:items-stretch gap-4">
							<div className="flex items-center justify-center">
								<div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl md:text-5xl font-black shadow-lg">
									{targetUser?.image_url && (
										<img
											src={targetUser.image_url}
											alt="Profilkép"
											className="h-full w-full object-cover rounded-full"
										/>
									)}
								</div>
							</div>
							<div className="w-3/4 md:w-full text-center md:text-left ">
								<h1 className="text-2xl md:text-4xl font-bold wrap-anywhere">
									{targetUser?.name ||
										t("profile.user_profile.user")}
								</h1>
								<p className="mt-1 md:mt-2 text-sm md:text-lg text-gray-400 wrap-anywhere">
									{targetUser?.email || "-"}
								</p>
								<p className="mt-2 md:mt-4 text-xs md:text-sm text-gray-300 wrap-anywhere">
									{targetUser?.bio ||
										t("profile.user_profile.no_bio")}
								</p>
							</div>
							<div className="flex flex-col justify-between gap-4 *:px-6 *:py-3">
								<SecondaryButton
									onClick={() => navigate("/")}
									className="gap-2 px-4 py-2 whitespace-nowrap"
								>
									<DynamicFAIcon exportName="faHome" />
									{t("profile.user_profile.back_to_home")}
								</SecondaryButton>
								{isMyProfile && targetUser && (
									<PrimaryButton
										onClick={() =>
											setIsLogoutConfirmationOpen(true)
										}
										className="gap-2 px-4 py-2 whitespace-nowrap"
									>
										<DynamicFAIcon exportName="faSignOutAlt" />
										{t("profile.user_profile.logout")}
									</PrimaryButton>
								)}
							</div>
						</div>

						<hr className="text-gray-700/50" />

						<div className="flex items-center justify-evenly gap-6">
							<div className="flex flex-col items-center justify-center py-3 md:py-4">
								<p className="text-xs font-semibold uppercase tracking-wider text-white/60">
									{t("profile.user_profile.communities")}
								</p>
								<p className="mt-1 text-base md:text-lg font-bold text-white">
									{joinedThreads.length || 0}
								</p>
							</div>
							<div className="flex flex-col items-center justify-center py-3 md:py-4">
								<p className="text-xs font-semibold uppercase tracking-wider text-white/60">
									Karma
								</p>
								<p className="mt-1 text-base md:text-lg font-bold text-white">
									{targetUser?.post_karma || 0}
								</p>
							</div>
						</div>

						{isMyProfile && targetUser && (
							<EditProfile
								targetUser={targetUser}
								saveCallback={setTargetUser}
							/>
						)}

						<hr className="text-gray-700/50" />
						<div className="flex flex-col items-center justify-center py-3 md:py-4">
							<h3 className="text-base md:text-lg font-semibold text-white/75 wrap-break-word">
								A felhasználó közösségei
							</h3>
						</div>
						<div className="flex gap-2 md:gap-2.5 flex-wrap justify-center px-2 md:px-0">
							{joinedThreads.length === 0 && (
								<p className="text-xs md:text-sm text-gray-500 col-span-full text-center">
									{t(
										"profile.user_profile.no_joined_communities",
									)}
								</p>
							)}
							{joinedThreads.map((thread) => (
								<div
									key={thread.id}
									onClick={() => {
										navigate("/communities/" + thread.id);
									}}
									className="w-full md:w-[calc(50%-10px)] bg-white/5 border border-white/10 rounded-lg p-3 md:p-4 cursor-pointer transition hover:bg-white/10"
								>
									<h3 className="text-base md:text-lg font-semibold text-white wrap-break-word">
										{thread.name}
									</h3>
									<p className="text-xs md:text-sm text-gray-400 wrap-break-word">
										{thread.description}
									</p>
									<p className="mt-2 text-xs text-gray-500">
										{thread.users_count}{" "}
										{t(
											"profile.user_profile.community_members",
										)}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			<ConfirmationModal
				isOpen={isLogoutConfirmationOpen}
				title={t("profile.user_profile.logout_confirm_title")}
				description={t(
					"profile.user_profile.logout_confirm_description",
				)}
				cancelText={t("profile.user_profile.logout_confirm_cancel")}
				confirmText={t("profile.user_profile.logout_confirm")}
				cancelButtonClassName="border border-white/20 bg-transparent text-white/90 hover:bg-white/10 disabled:opacity-60"
				confirmButtonClassName="bg-red-600 hover:bg-red-500 disabled:opacity-75"
				onClose={() => setIsLogoutConfirmationOpen(false)}
				onConfirm={async () => {
					setIsLogoutConfirmationOpen(false);
					await handleLogout();
				}}
			/>
		</>
	);
};

export default UserProfile;
