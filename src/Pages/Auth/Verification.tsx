import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Verify2FA } from "../../api/auth";
import DynamicFAIcon from "../../Components/Utils/DynamicFaIcon";
import { InputComponent } from "../../Components/InputFields/InputComponent";

export const VerificationPage = () => {
	const searchParams = useSearchParams();
	const navigate = useNavigate();

	const [email, setEmail] = useState(searchParams[0].get("email") || "");
	const [verificationCode, setVerificationCode] = useState(
		searchParams[0].get("code") || "",
	);

	const [error, setError] = useState<string | null>(null);

	async function handleVerification(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault();
		const button = e.currentTarget;
		button.disabled = true;
		setError(null);

		if (!email || !verificationCode) {
			setError("Email és ellenőrző kód megadása kötelező.");
			button.disabled = false;
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			setError("Érvénytelen e-mail cím formátum.");
			button.disabled = false;
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
		} catch (err) {
			setError(`${"Hiba történt az ellenőrzés során."}`);
		}

		button.disabled = false;
	}

	return (
		<section className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-2xl shadow-black/30 backdrop-blur space-y-2">
			<h1 className="text-2xl font-black">Kétfaktoros azonosítás</h1>
			<p className="text-sm text-white/70">
				Kérjük, ellenőrizze email-jét a visszaigazolási kódért.
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
				className={`flex flex-col gap-4 *:flex *:flex-col *:gap-1 ${error ? "mt-2" : "mt-6"}`}>
				<InputComponent
					label="Fiók email"
					type="email"
					value={email}
					placeholder="Írd be az email címed"
					onChange={(e) => setEmail(e.target.value)}
				/>
				<InputComponent
					label="Ellenőrző kód"
					type="text"
					value={verificationCode}
					placeholder="Írd be az ellenőrző kódot"
					onChange={(e) => setVerificationCode(e.target.value)}
				/>
				<button
					type="submit"
					onClick={(e) => {
						handleVerification(e);
					}}
					className="mt-2 rounded-xl bg-linear-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white keep-white shadow-md transition hover:from-blue-600 hover:to-blue-700
					active:scale-[0.98] duration-150 ease-in-out disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:opacity-50
					">
					Ellenőrzés
				</button>
			</form>
		</section>
	);
};
