import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Verify2FA } from "../../api/auth";
import DynamicFAIcon from "../../Components/Utils/DynamicFaIcon";
import { InputComponent } from "../../Components/InputFields/InputComponent";
import { PrimaryButton } from "../../Components/Buttons";

export const VerificationPage = () => {
	const searchParams = useSearchParams();
	const navigate = useNavigate();

	const [email, setEmail] = useState(searchParams[0].get("email") || "");
	const [verificationCode, setVerificationCode] = useState(
		searchParams[0].get("code") || "",
	);

	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { t } = useTranslation();

	async function handleVerification(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault();
		if (isSubmitting) return;
		setIsSubmitting(true);
		setError(null);

		if (!email || !verificationCode) {
			setError(t("auth.verification.empty_fields_error"));
			setIsSubmitting(false);
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			setError(t("auth.verification.invalid_email_error"));
			setIsSubmitting(false);
			return;
		}

		try {
			const response = await Verify2FA(email, verificationCode);

			if (response.status === 200) {
				if (response.data.user) {
					window.dispatchEvent(new Event("auth-changed"));
					navigate("/");
				} else {
					console.log("switch");
					navigate(-1);
				}
			}
		} catch {
			setError(t("auth.verification.generic_error"));
		}

		setIsSubmitting(false);
	}

	return (
		<section className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-2xl shadow-black/30 backdrop-blur space-y-2">
			<h1 className="text-2xl font-black">
				{t("auth.verification.title")}
			</h1>
			<p className="text-sm text-white/70">
				{t("auth.verification.subtitle")}
			</p>

			{error && (
				<div className="w-full rounded-xl flex items-center p-4 border border-red-500 bg-red-500/10 text-red-500 bg-linear-60 from-red-500/10 to-red-500/20">
					<DynamicFAIcon
						exportName="faExclamationCircle"
						className="text-2xl"
					/>
					<p className="text-sm text-white ml-3">{error}</p>
				</div>
			)}
			<form
				className={`flex flex-col gap-4 *:flex *:flex-col *:gap-1 ${error ? "mt-2" : "mt-6"}`}
			>
				<InputComponent
					label={t("auth.verification.email_label")}
					type="email"
					value={email}
					placeholder={t("auth.verification.email_placeholder")}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<InputComponent
					label={t("auth.verification.code_label")}
					type="text"
					value={verificationCode}
					placeholder={t("auth.verification.code_placeholder")}
					onChange={(e) => setVerificationCode(e.target.value)}
				/>
				<PrimaryButton
					type="submit"
					onClick={handleVerification}
					disabled={isSubmitting}
					className="mt-2px-4 py-3"
				>
					{t("auth.verification.submit_button")}
				</PrimaryButton>
			</form>
		</section>
	);
};
