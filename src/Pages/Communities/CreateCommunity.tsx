import axios from "axios";
import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
	CreateThread,
	UploadThreadHeaderImage,
	UploadThreadImage,
} from "../../api/threads";
import { InputComponent } from "../../Components/InputFields/InputComponent";
import { TextAreaComponent } from "../../Components/InputFields/TextAreaComponent";
import { DragnDrop } from "../../Components/DragnDrop/DragnDrop";
import DynamicFAIcon from "../../Components/Utils/DynamicFaIcon";

interface CreateCommunityProps {
	isLoggedIn: boolean;
}

const CreateCommunity = ({ isLoggedIn }: CreateCommunityProps) => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [created, setCreated] = useState(false);
	const [communityId, setCommunityId] = useState<number | null>(null);
	const [communityName, setCommunityName] = useState("");
	const [description, setDescription] = useState("");
	const [rules, setRules] = useState("");
	const [communityImage, setCommunityImage] = useState<File | null>(null);
	const [communityHeaderImage, setCommunityHeaderImage] =
		useState<File | null>(null);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!communityName.trim() || !description.trim() || !rules.trim()) {
			alert(t("createCommunity.validation_error"));
			return;
		}
		try {
			const response = await CreateThread({
				id: -1,
				name: communityName.trim(),
				description: description.trim(),
				rules: rules.trim(),
				image: "",
				header: "",
			});
			const newThreadId = response.data.id;

			// Feltöltsd a képet ha van
			if (communityImage) {
				await UploadThreadImage(newThreadId, communityImage);
			}

			if (communityHeaderImage) {
				await UploadThreadHeaderImage(
					newThreadId,
					communityHeaderImage,
				);
			}

			setCreated(true);
			setCommunityId(newThreadId);
		} catch (err) {
			if (axios.isAxiosError(err)) {
				const message = (err.response?.data as any)?.message;
				alert(message ?? t("createCommunity.create_error"));
				return;
			}
		}
	};

	useEffect(() => {
		if (!isLoggedIn) {
			navigate("/auth/login");
		}
	}, [isLoggedIn, navigate]);

	useEffect(() => {
		if (created) {
			navigate(`/communities/${communityId}`);
		}
	});

	return (
		<section className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]" />
			<div className="absolute inset-0 bg-black/30" />

			<div className="container mx-auto px-6 py-10">
				<div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-black/30 backdrop-blur">
					<div className="absolute inset-0 bg-linear-to-br from-blue-500/15 via-cyan-400/10 to-purple-500/15" />

					<div className="relative z-10 p-8 md:p-10">
						<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
							<div>
								<h1 className="text-3xl font-black text-white md:text-4xl">
									{t("createCommunity.title")}
								</h1>
								<p className="mt-2 text-sm text-white/70">
									{t("createCommunity.description")}
								</p>
							</div>

							<button
								type="button"
								onClick={() => navigate("/all-communities")}
								className="cursor-pointer h-10 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10"
							>
								{t("createCommunity.back_button")}
							</button>
						</div>

						<form
							className="mt-8 grid gap-5"
							onSubmit={handleSubmit}
						>
							<InputComponent
								label={t("createCommunity.name_label")}
								placeholder={t(
									"createCommunity.name_placeholder",
								)}
								value={communityName}
								onChange={(e) =>
									setCommunityName(e.target.value)
								}
								maxLength={20}
							/>

							<TextAreaComponent
								label={t("createCommunity.description_label")}
								placeholder={t(
									"createCommunity.description_placeholder",
								)}
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={4}
								maxLength={50}
							/>

							<TextAreaComponent
								label={t("createCommunity.rules_label")}
								placeholder={t(
									"createCommunity.rules_placeholder",
								)}
								value={rules}
								onChange={(e) => setRules(e.target.value)}
								rows={6}
							/>

							<div className="flex flex-col gap-2">
								<label
									htmlFor="image"
									className="text-xs font-semibold uppercase tracking-wider text-white/60"
								>
									{t("createCommunity.image_label")}
								</label>
								{(communityImage && (
									<div className="rounded-xl border-2 border-dashed p-6 text-center transition border-green-500/70 bg-green-500/5 space-y-2">
										<p className="text-sm font-semibold text-green-300">
											{t(
												"profile.edit_profile.file_selected",
											)}
										</p>
										<img
											src={URL.createObjectURL(
												communityImage,
											)}
											alt="Preview"
											className="h-32 w-32 object-cover rounded-lg mx-auto"
										/>
										<button
											type="button"
											onClick={() =>
												setCommunityImage(null)
											}
											className="mt-4 inline-flex items-center justify-center rounded-lg bg-red-900 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-red-800 disabled:bg-gray-500 disabled:cursor-not-allowed"
										>
											<DynamicFAIcon
												exportName="faX"
												className="mr-2"
											/>
											{t(
												"profile.edit_profile.remove_file",
											)}
										</button>
									</div>
								)) || (
									<DragnDrop
										description={t(
											"createCommunity.image_tip",
										)}
										onFileSelected={(file) => {
											setCommunityImage(file);
										}}
									/>
								)}
							</div>

							<div className="flex flex-col gap-2">
								<label
									htmlFor="header"
									className="text-xs font-semibold uppercase tracking-wider text-white/60"
								>
									{t("createCommunity.header_label")}
								</label>
								{(communityHeaderImage && (
									<div className="rounded-xl border-2 border-dashed p-6 text-center transition border-green-500/70 bg-green-500/5 space-y-2">
										<p className="text-sm font-semibold text-green-300">
											{t(
												"profile.edit_profile.file_selected",
											)}
										</p>
										<img
											src={URL.createObjectURL(
												communityHeaderImage,
											)}
											alt="Preview"
											className="h-32 w-32 object-cover rounded-lg mx-auto"
										/>
										<button
											type="button"
											onClick={() =>
												setCommunityHeaderImage(null)
											}
											className="mt-4 inline-flex items-center justify-center rounded-lg bg-red-900 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-red-800 disabled:bg-gray-500 disabled:cursor-not-allowed"
										>
											<DynamicFAIcon
												exportName="faX"
												className="mr-2"
											/>
											{t(
												"profile.edit_profile.remove_file",
											)}
										</button>
									</div>
								)) || (
									<DragnDrop
										maxFileSizeBytes={4 * 1024 * 1024} // 5MB
										description={t(
											"createCommunity.header_tip",
										)}
										onFileSelected={(file) => {
											setCommunityHeaderImage(file);
										}}
									/>
								)}
							</div>

							<div className="flex items-center justify-between gap-4">
								<p className="text-xs text-white/55">
									{t("createCommunity.info_text")}
								</p>
								<button
									type="submit"
									className="cursor-pointer rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white keep-white shadow-md transition hover:from-blue-600 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
								>
									{t("createCommunity.submit_button")}
								</button>
							</div>

							<div className="pt-1 text-center text-xs text-white/50">
								{t("createCommunity.disclaimer")}
							</div>
						</form>
					</div>
				</div>
			</div>
		</section>
	);
};

export default CreateCommunity;
