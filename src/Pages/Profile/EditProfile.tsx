import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { UserData } from "../../Interfaces/UserData";
import { ProfilePictureUpload, UpdateUserProfile } from "../../api/users";
import { InputComponent } from "../../Components/InputFields/InputComponent";
import { TextAreaComponent } from "../../Components/InputFields/TextAreaComponent";
import { DragnDrop } from "../../Components/DragnDrop/DragnDrop";
import DynamicFAIcon from "../../Components/Utils/DynamicFaIcon";
import ConfirmationModal from "../../Components/Modal/Modal";
import Switch from "../../Components/InputFields/SwitchComponent";
import { useNavigate } from "react-router-dom";
import { IsVerificationEnabled, Toggle2FA } from "../../api/auth";

export const EditProfile = (props: {
	targetUser: UserData;
	saveCallback: (updatedUser: UserData) => void | Promise<void>;
}) => {
	const navigate = useNavigate();
	const { t } = useTranslation();

	const [editedUser, setEditedUser] = useState<UserData | null>(
		props.targetUser,
	);
	const [isSavingChanges, setIsSavingChanges] = useState(false);
	const [isSaveConfirmationOpen, setIsSaveConfirmationOpen] = useState(false);
	const [fileToUpload, setFileToUpload] = useState<File | null>(null);

	const [hasError, setHasError] = useState(false);

	const [isVerificationEnabled, setIsVerificationEnabled] = useState(false);
	const [isVerificationLoading, setIsVerificationLoading] = useState(false);
	const [isSwitching2FA, setIsSwitching2FA] = useState(false);

	async function handleSave(): Promise<void> {
		if (!editedUser) return;
		if (!props.targetUser) return;

		setHasError(false);
		setIsSavingChanges(true);

		if (editedUser.name?.trim() === "" || editedUser.email?.trim() === "") {
			setHasError(true);
			return;
		}

		// ékezet lehet és space is
		const usernameRegex = /^[a-zA-Z0-9_áéíÁÉÍöÖüÜ\s]+$/;
		if (!usernameRegex.test(editedUser.name!)) {
			setHasError(true);
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(editedUser.email!)) {
			setHasError(true);
			return;
		}

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
		await localStorage.setItem(
			"lastSavedAt",
			new Date().toISOString().split(".")[0].replace("T", " "),
		);
		setIsSavingChanges(false);
	}

	const onProfilePictureSelected = async (file: File) => {
		if (!file) return;
		if (!props.targetUser) return;

		await setFileToUpload(file);
	};

	async function handle2faChange() {
		setIsVerificationLoading(true);
		const response = await Toggle2FA();
		setIsVerificationLoading(false);
		if (response.status === 202 && response.data?.requires_verification) {
			setIsSwitching2FA(false);
			navigate(
				"/auth/verification?email=" +
					encodeURIComponent(editedUser?.email || ""),
			);
		}
	}

	async function getVerificationButton() {
		const isEnabled = (await IsVerificationEnabled()).data.is_2fa_enabled;

		setIsVerificationEnabled(isEnabled);
	}

	useEffect(() => {
		async function Init() {
			await getVerificationButton();
		}
		Init();
	}, []);

	return (
		<>
			<div className="p-4 md:p-8 border-t border-gray-700/50">
				<h2 className="text-xl md:text-2xl font-bold mb-6">
					{t("profile.edit_profile.account_settings")}
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
					<div>
						<InputComponent
							label={t("profile.edit_profile.username_label")}
							placeholder={t(
								"profile.edit_profile.username_placeholder",
							)}
							value={editedUser?.name ?? ""}
							onChange={(e) =>
								setEditedUser({
									...editedUser,
									name: e.target.value.slice(0, 50),
								} as UserData)
							}
							maxLength={50}
						/>
					</div>
					<div>
						<InputComponent
							label={t("profile.edit_profile.email_label")}
							placeholder={t(
								"profile.edit_profile.email_placeholder",
							)}
							value={editedUser?.email ?? ""}
							onChange={(e) =>
								setEditedUser({
									...editedUser,
									email: e.target.value.slice(0, 100),
								} as UserData)
							}
							type={"email"}
							maxLength={100}
						/>
					</div>
					<div className="md:col-span-2">
						<TextAreaComponent
							label={t("profile.edit_profile.bio_label")}
							placeholder={t(
								"profile.edit_profile.bio_placeholder",
							)}
							value={editedUser?.bio ?? ""}
							onChange={(e) => {
								setEditedUser({
									...editedUser,
									bio: e.target.value.slice(0, 100),
								} as UserData);
							}}
							rows={3}
							textAreaClassName="resize-none"
							maxLength={100}
						/>
					</div>
					<div className="md:col-span-2">
						<Switch
							title={t("profile.edit_profile.two_fa")}
							subtitle={t("profile.edit_profile.two_fa_subtitle")}
							icon={"faShieldAlt"}
							containerClass="w-full rounded-lg p-3 md:p-4 border border-white/10 bg-white/5 text-white"
							onChange={() => {
								setIsSwitching2FA(true);
								setIsVerificationEnabled((prev) => !prev);
							}}
							checked={isVerificationEnabled}
						/>
					</div>
					<div className="md:col-span-2">
						{(fileToUpload && (
							<div className="mb-4 p-3 md:p-4 bg-green-600/20 border border-green-600 rounded">
								<p className="text-xs md:text-sm text-green-300 flex flex-wrap items-center gap-2">
									<span>
										{t(
											"profile.edit_profile.file_selected",
										)}
									</span>
									<img
										src={URL.createObjectURL(fileToUpload)}
										alt="Preview"
										className="h-10 w-10 object-cover rounded-full"
									/>
									<button
										className="p-2 hover:bg-green-600/30 rounded transition"
										onClick={() => setFileToUpload(null)}
									>
										<DynamicFAIcon exportName="faX" />
									</button>
								</p>
							</div>
						)) || (
							<DragnDrop
								onFileSelected={onProfilePictureSelected}
								title={t(
									"profile.edit_profile.upload_profile_picture",
								)}
								description={t(
									"profile.edit_profile.drag_picture_text",
								)}
							/>
						)}
					</div>
					<p className="text-xs text-gray-500 mt-1">
						{t("profile.edit_profile.last_saved")}{" "}
						{localStorage.getItem("lastSavedAt") || "N/A"}
					</p>
				</div>
				<div className="mt-6 md:mt-8 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
					<button
						onClick={() => setIsSaveConfirmationOpen(true)}
						disabled={isSavingChanges}
						className="w-full md:w-auto flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 md:px-6 py-2 md:py-3 text-xs md:text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-wait"
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
								? t("profile.edit_profile.saving")
								: t("profile.edit_profile.save_changes")}
						</span>
					</button>
				</div>
			</div>

			{/* Mentés megerősítése */}
			<ConfirmationModal
				isOpen={isSaveConfirmationOpen}
				title={t("profile.edit_profile.save_profile_title")}
				description={t("profile.edit_profile.save_profile_description")}
				cancelText={t("profile.edit_profile.cancel")}
				confirmText={t("profile.edit_profile.save")}
				cancelButtonClassName="border border-white/20 bg-transparent text-white/90 hover:bg-white/10 disabled:opacity-60"
				confirmButtonClassName="bg-blue-600 hover:bg-blue-500 disabled:opacity-75"
				onClose={() => setIsSaveConfirmationOpen(false)}
				onConfirm={async () => {
					setIsSaveConfirmationOpen(false);
					await handleSave();
				}}
				isConfirmLoading={isSavingChanges}
			/>

			{/* Hibás adatok */}
			<ConfirmationModal
				isOpen={hasError}
				title={t("profile.edit_profile.invalid_data_title")}
				description={t("profile.edit_profile.invalid_data_description")}
				cancelText=""
				confirmText={t("profile.edit_profile.ok")}
				cancelButtonClassName="hidden"
				confirmButtonClassName="bg-blue-600 hover:bg-blue-500 disabled:opacity-75"
				onClose={() => setHasError(false)}
				onConfirm={async () => {
					setHasError(false);
				}}
				isConfirmLoading={isSavingChanges}
			/>

			{/* 2FA váltás megerősítése */}
			<ConfirmationModal
				isOpen={isSwitching2FA}
				title={t("profile.edit_profile.two_fa_confirm_title")}
				description={t(
					"profile.edit_profile.two_fa_confirm_description",
				)}
				cancelText={t("profile.edit_profile.two_fa_cancel")}
				confirmText={t("profile.edit_profile.two_fa_confirm")}
				cancelButtonClassName="border border-white/20 bg-transparent text-white/90 hover:bg-white/10 disabled:opacity-60"
				confirmButtonClassName="bg-blue-600 hover:bg-blue-500 disabled:opacity-75"
				onClose={() => {
					setIsSwitching2FA(false);
					setIsVerificationEnabled((prev) => !prev);
				}}
				onConfirm={async () => {
					await handle2faChange();
				}}
				isConfirmLoading={isVerificationLoading}
			/>
		</>
	);
};
