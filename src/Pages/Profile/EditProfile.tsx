import { useState } from "react";
import type { UserData } from "../../Interfaces/UserData";
import { ProfilePictureUpload, UpdateUserProfile } from "../../api/users";
import { InputComponent } from "../../Components/InputFields/InputComponent";
import { TextAreaComponent } from "../../Components/InputFields/TextAreaComponent";
import { DragnDrop } from "../../Components/DragnDrop/DragnDrop";
import DynamicFAIcon from "../../Components/Utils/DynamicFaIcon";

export const EditProfile = (props: {
	targetUser: UserData;
	saveCallback: (updatedUser: UserData) => void | Promise<void>;
}) => {
	const [editedUser, setEditedUser] = useState<UserData | null>(
		props.targetUser,
	);
	const [isSavingChanges, setIsSavingChanges] = useState(false);
	const [fileToUpload, setFileToUpload] = useState<File | null>(null);

	async function handleSave(): Promise<void> {
		if (!editedUser) return;
		if (!props.targetUser) return;

		setIsSavingChanges(true);
		//profil adatainak frissítése
		try {
			const response = await UpdateUserProfile(editedUser);
			if (response.status === 200) {
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
				setEditedUser({
					...editedUser,
					image_url: response.data.imageUrl,
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

		await props.saveCallback(editedUser);
		await localStorage.setItem("lastSavedAt", new Date().toISOString());
		setIsSavingChanges(false);
	}

	const onProfilePictureSelected = async (file: File) => {
		if (!file) return;
		if (!props.targetUser) return;

		await setFileToUpload(file);
	};

	return (
		<>
			<div className="p-8 border-t border-gray-700/50">
				<h2 className="text-2xl font-bold mb-6">Fiók beállítások</h2>
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
										src={URL.createObjectURL(fileToUpload)}
										alt="Preview"
										className="h-10 w-10 object-cover rounded-full inline-block ml-2"
									/>
									<button
										className="p-4"
										onClick={() => setFileToUpload(null)}
									>
										<DynamicFAIcon exportName="faX" />
									</button>
								</p>
							</div>
						)) || (
							<DragnDrop
								onFileSelected={onProfilePictureSelected}
								title="Profilkép feltöltése"
								description="Húzd ide az új profilképet, vagy kattints ide a kiválasztáshoz."
							/>
						)}
						<p className="text-xs text-gray-500 mt-1">
							Utoljára mentve:{" "}
							{localStorage
								.getItem("lastSavedAt")
								?.split(".")[0]
								.replace("T", " ") || "N/A"}
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
		</>
	);
};
