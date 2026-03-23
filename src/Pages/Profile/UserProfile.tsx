"use client";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { UserData } from "../../Interfaces/UserData";
import { GetUserProfile, ProfilePictureUpload } from "../../api/users";
import DynamicFAIcon from "../../Components/Utils/DynamicFaIcon";
import { TextAreaComponent } from "../../Components/InputFields/TextAreaComponent";
import { InputComponent } from "../../Components/InputFields/InputComponent";
import { Logout } from "../../api/auth";

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

	const checkIsMyProfile = async () => {
		const requesterId = JSON.parse(
			localStorage.getItem(profileStorageKey) || "{}",
		)?.id;
		const targetId = Number(params.id);

		setIsMyProfile(requesterId === targetId);
	};

	useEffect(() => {
		const getViewedUserProfile = async (userId: number) => {
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
				console.log("Betöltött felhasználói adatok:", response.data);
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
		setIsSavingChanges(true);
		setIsSavingChanges(false);
	}

	return (
		<>
			<div
				className="absolute max-w-full w-dvw h-1 z-50"
				style={{ backgroundColor: isMyProfile ? "green" : "red" }}
			/>
			{/* <section className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]" />
				<div className="absolute inset-0 bg-black/30" />

				<div className="relative z-10 mx-auto flex max-w-xl flex-col px-4 pb-12 pt-12">
					<div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h1 className="text-3xl font-black text-white">
									{targetUser?.name} profilja
								</h1>
								<p className="mt-2 text-sm text-white/70">
									Megtekintés (nem szerkeszthető)
								</p>
								<p className="mt-3 text-xs font-semibold uppercase tracking-wider text-white/60">
									User ID:{" "}
									<span className="text-white/80">
										{targetUser?.id ?? "—"}
									</span>
								</p>
							</div>

							<Link
								to="/all-communities"
								className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10"
							>
								Vissza
							</Link>
						</div>

						<div className="mt-8 flex flex-col items-center gap-4">
							<img
								src={targetUser?.image_url}
								alt={targetUser?.name}
								className="h-28 w-28 rounded-full border border-white/20 bg-linear-to-br from-blue-500/30 to-indigo-500/30 shadow-lg"
							/>
							<p className="text-sm font-semibold text-white/80">
								{targetUser?.username}
							</p>
						</div>

						<div className="mt-10 grid gap-5">
							<div>
								<label className="text-xs font-semibold uppercase tracking-wider text-white/60">
									Felhasználónév
								</label>
								<div className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/85">
									{targetUser?.name}
								</div>
							</div>

							<div>
								<label className="text-xs font-semibold uppercase tracking-wider text-white/60">
									Bemutatkozás
								</label>
								<div className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/85">
									{targetUser?.bio ||
										"Nincs bemutatkozás megadva."}
								</div>
							</div>
						</div>

						<div className="mt-10">
							<h2 className="text-xl font-semibold text-white">
								Közösségek
							</h2>
							<p className="mt-1 text-sm text-white/60">
								Amikben benne van
							</p>

							<div className="mt-4 space-y-3">
								{joinedCommunities.length === 0 ? (
									<div className="text-sm text-white/60">
										Nincs megjeleníthető közösség.
									</div>
								) : (
									joinedCommunities.map((community) => (
										<div
											key={community.id}
											className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 p-4"
										>
											<div>
												<p className="text-sm font-semibold text-white">
													{community.name}
												</p>
												<p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
													{community.role}
												</p>
											</div>
											<Link
												to={`/communities/${community.id}`}
												className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10"
											>
												Megnézem
											</Link>
										</div>
									))
								)}
							</div>
						</div>
					</div>
				</div>
			</section> */}
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
								{/* <input
									ref={fileInputRef}
									type="file"
									accept=".jpeg,.jpg,.png,.gif"
									className="hidden"
									onChange={handleFileInputChange}
								/> */}
								{/* <button
									className="absolute -bottom-2 -right-2 h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-blue-700 transition-transform duration-200 hover:scale-110 disabled:bg-gray-500 disabled:cursor-not-allowed"
									onClick={() =>
										fileInputRef.current?.click()
									}
									disabled={isUploading}
									aria-label="Profilkép módosítása"
								>
									{isUploading ? (
										<DynamicFAIcon
											exportName="faSpinner"
											className="animate-spin"
										/>
									) : (
										<DynamicFAIcon exportName="faCamera" />
									)}
								</button> */}
							</div>
							<div className="text-center md:text-left">
								<h1 className="text-4xl font-bold">
									{editedUser?.name || "Felhasználó"}
								</h1>
								<p className="mt-2 text-lg text-gray-400">
									{editedUser?.email}
								</p>
								<p className="mt-4 text-sm text-gray-300 max-w-md">
									{editedUser?.bio || "Nincs bemutatkozás."}
								</p>
							</div>
						</div>

						{/* <div className="*:w-96 flex justify-center px-8 py-8 border-b border-gray-700/50">
						<DragnDrop
							onFileSelected={onProfilePictureSelected}
							isUploading={isUploading}
							title="Húzd ide az új profilképet"
							description="Elfogadott formátumok: JPEG, JPG, PNG, GIF • Maximum méret: 2MB"
							selectButtonLabel="Fájl kiválasztása"
							uploadingLabel="Feltöltés..."
						/>
					</div> */}

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
										value={targetUser?.name ?? ""}
										onChange={(e) =>
											// setUsername(e.target.value)
											setTargetUser({
												...targetUser,
												name: e.target.value,
											} as UserData)
										}
									/>
								</div>
								<div>
									<InputComponent
										label="Email"
										placeholder="email@pelda.hu"
										value={targetUser?.email ?? ""}
										onChange={(e) =>
											// setEmail(e.target.value);
											setTargetUser({
												...targetUser,
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
										value={targetUser?.bio ?? ""}
										onChange={(e) => {
											// setBio(e.target.value);
											setTargetUser({
												...targetUser,
												bio: e.target.value,
											} as UserData);
										}}
										rows={3}
										textAreaClassName="resize-none"
									/>
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
