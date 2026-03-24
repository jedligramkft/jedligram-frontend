"use client";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { UserData } from "../../Interfaces/UserData";
import {
	GetUserProfile,
	ProfilePictureUpload,
	UpdateUserProfile,
} from "../../api/users";
import DynamicFAIcon from "../../Components/Utils/DynamicFaIcon";
import { TextAreaComponent } from "../../Components/InputFields/TextAreaComponent";
import { InputComponent } from "../../Components/InputFields/InputComponent";
import { Logout } from "../../api/auth";
import { DragnDrop } from "../../Components/DragnDrop/DragnDrop";

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

	const [editedUser, setEditedUser] = useState<UserData | null>(null);
	const [isSavingChanges, setIsSavingChanges] = useState(false);

	const [fileToUpload, setFileToUpload] = useState<File | null>(null);

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
				setEditedUser(response.data);
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

	const onProfilePictureSelected = async (file: File) => {
		if (!file) return;
		if (!targetUser) return;

		await setFileToUpload(file);
	};

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

	async function handleSave(): Promise<void> {
		if (!editedUser) return;
		if (!targetUser) return;

		setIsSavingChanges(true);
		//profil adatainak frissítése
		try {
			const response = await UpdateUserProfile(editedUser);
			if (response.status === 200) {
				setTargetUser(response.data);
				console.log("Profil sikeresen frissítve:", response.data);
			} else {
				console.warn("Nem sikerült frissíteni a profilt:", response);
			}
		} catch (error) {
			console.error("Hiba történt a profil frissítésekor:", error);
		}

		//fájl feltöltés
		if (fileToUpload) {
			try {
				const response = await ProfilePictureUpload(fileToUpload);
				setTargetUser({
					...targetUser,
					image_url: response.data.user.image_url,
				});
			} catch (err) {
				const message =
					err instanceof Error
						? err.message
						: "Nem sikerült feltölteni a profilképet.";
				alert(`Hiba: ${message}`);
			}
			setFileToUpload(null);
		}
		setIsSavingChanges(false);
	}

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
						<div className="p-8 border-t border-gray-700/50">
							<h2 className="text-2xl font-bold mb-6">
								Fiók beállítások
							</h2>
							<div className="grid md:grid-cols-2 gap-6">
								<div>
									<InputComponent
										label="Felhasználónév"
										placeholder="jedlik_user"
										value={editedUser?.name ?? ""}
										onChange={(e) =>
											setEditedUser({
												...editedUser,
												name: e.target.value,
											} as UserData)
										}
									/>
								</div>
								<div>
									<InputComponent
										label="Email"
										placeholder="email@pelda.hu"
										value={editedUser?.email ?? ""}
										onChange={(e) =>
											setEditedUser({
												...editedUser,
												email: e.target.value,
											} as UserData)
										}
										type={"email"}
									/>
								</div>
								<div className="md:col-span-2">
									<TextAreaComponent
										label="Bemutatkozás"
										placeholder="Pár szó magadról..."
										value={editedUser?.bio ?? ""}
										onChange={(e) => {
											setEditedUser({
												...editedUser,
												bio: e.target.value,
											} as UserData);
										}}
										rows={3}
										textAreaClassName="resize-none"
									/>
								</div>
								<div className="md:col-span-2">
									{(fileToUpload && (
										<div className="mb-4 p-4 bg-green-600/20 border border-green-600 rounded">
											<p className="text-sm text-green-300">
												<p>Fájl kiválasztva: </p>
												<img
													src={URL.createObjectURL(
														fileToUpload,
													)}
													alt="Preview"
													className="h-10 w-10 object-cover rounded-full inline-block ml-2"
												/>
												<button
													className="p-4"
													onClick={() =>
														setFileToUpload(null)
													}
												>
													<DynamicFAIcon exportName="faX" />
												</button>
											</p>
										</div>
									)) || (
										<DragnDrop
											onFileSelected={
												onProfilePictureSelected
											}
											title="Profilkép feltöltése"
											description="Húzd ide az új profilképet, vagy kattints ide a kiválasztáshoz."
										/>
									)}
									<p className="text-xs text-gray-500 mt-1">
										Utoljára mentve:{" "}
										{/* {formatDateTime(lastSavedAt)} */}
									</p>
								</div>
							</div>
							<div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
								<button
									onClick={handleSave}
									disabled={isSavingChanges}
									className="w-full md:w-auto flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-wait"
								>
									{isSavingChanges ? (
										<DynamicFAIcon
											exportName="faSpinner"
											className="animate-spin"
										/>
									) : (
										<DynamicFAIcon exportName="faSave" />
									)}
									<span>
										{isSavingChanges
											? "Mentés..."
											: "Változtatások mentése"}
									</span>
								</button>
							</div>
						</div>

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
					</div>
				</div>
			</section>
		</>
	);
};

export default UserProfile;
