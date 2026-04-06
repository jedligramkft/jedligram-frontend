import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { CreatePostInThread } from "../../api/posts";
import { DragnDrop } from "../../Components/DragnDrop/DragnDrop";
import {
	PrimaryButton,
	SecondaryButton,
} from "../../Components/Buttons";

const CreatePost = () => {
	const { t } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [creating, setCreating] = useState(false);
	const [created, setCreated] = useState(false);
	const [content, setContent] = useState("");

	const handleSubmit = async () => {
		const authTokenName =
			import.meta.env.VITE_AUTH_TOKEN_NAME ?? "jedligram_token";
		const token = localStorage.getItem(authTokenName);

		if (!token) {
			navigate("/auth/login", { replace: true });
			return;
		}

		if (!id) {
			alert(t("createPost.invalid_community_error"));
			return;
		}

		setCreating(true);
		try {
			await CreatePostInThread(Number(id), content, fileToUpload);
			setCreated(true);
		} catch (err) {
			if (axios.isAxiosError(err)) {
				const message = (err.response?.data as any)?.message;
				alert(message ?? t("createPost.create_error"));
				return;
			}
		} finally {
			setCreating(false);
		}
	};

	useEffect(() => {
		if (created) {
			navigate(`/communities/${encodeURIComponent(id ?? "")}`);
		}
	});

	const [fileToUpload, setFileToUpload] = useState<File | null>(null);

	const onProfilePictureSelected = async (file: File) => {
		if (!file) return;

		await setFileToUpload(file);
	};

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
								<h1 className="text-2xl font-bold text-white">
									{t("createPost.title")}
								</h1>
								<p className="mt-2 text-sm text-white/70">
									{t("createPost.description")}
								</p>
								<div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/10 px-4 py-2 text-xs font-semibold text-white/80">
									<span className="text-white/60">
										{t("createPost.community_label")}
									</span>
									<span className="text-white/90">
										#{id ?? "—"}
									</span>
								</div>
							</div>

							<SecondaryButton
								type="button"
								onClick={() =>
									navigate(
										id
											? `/communities/${encodeURIComponent(id)}`
											: "/all-communities",
									)
								}
								className="px-6 py-2"
							>
								{t("createPost.back_button")}
							</SecondaryButton>
						</div>
						<form
							className="mt-8 grid gap-5"
							onSubmit={(e) => {
								e.preventDefault();
								handleSubmit();
							}}
						>
							<div>
								<label className="text-xs font-semibold uppercase tracking-wider text-white/60">
									{t("createPost.content_label")}
								</label>
								<textarea
									placeholder={t(
										"createPost.content_placeholder",
									)}
									className="mt-2 h-44 w-full resize-none rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/20"
									value={content}
									onChange={(e) => setContent(e.target.value)}
								/>
							</div>

							<DragnDrop
								onFileSelected={onProfilePictureSelected}
								onFileRemoved={() => {
									setFileToUpload(null);
								}}
								selectedFile={fileToUpload}
								title={t("createPost.image_upload_title")}
								description={t(
									"createPost.image_upload_description",
								)}
								maxFileSizeBytes={4096 * 1024}
								previewImageClassName="rounded-sm"
							/>

							<div className="flex items-center justify-between gap-4">
								<p className="text-xs text-white/55">
									{t("createPost.info_text")}
								</p>
								<PrimaryButton
									type="submit"
									disabled={creating}
									className="px-6 py-3"
								>
									{creating
										? t("createPost.submit_button_loading")
										: t("createPost.submit_button")}
								</PrimaryButton>
							</div>
						</form>
					</div>
				</div>
			</div>
		</section>
	);
};

export default CreatePost;
