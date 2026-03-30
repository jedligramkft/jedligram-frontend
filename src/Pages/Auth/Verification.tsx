import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Verify2FA } from "../../api/auth";

export const VerificationPage = () => {
	const searchParams = useSearchParams();
	const navigate = useNavigate();

	const [email, setEmail] = useState(searchParams[0].get("email") || "");
	const [verificationCode, setVerificationCode] = useState(
		searchParams[0].get("code") || "",
	);

	async function handleVerification(
		event: React.MouseEvent<HTMLButtonElement>,
	) {
		event.currentTarget.disabled = true;

		const response = await Verify2FA(email, verificationCode);

		if (response.status === 200) {
			if (response.data.user) {
				console.log("Login");
				window.dispatchEvent(new Event("auth-changed"));
				navigate("/");
			} else {
				console.log("switch");
				navigate(-1);
			}
		}

		event.currentTarget.disabled = false;
	}

	return (
		<section className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-2xl shadow-black/30 backdrop-blur">
			<h1 className="text-2xl font-black">Kétfaktoros azonosítás</h1>
			<p className="mt-2 text-sm text-white/70">
				Kérjük, ellenőrizze email-jét a visszaigazolási linkért.
			</p>
			<div className="mt-6 flex flex-col gap-3">
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/20"
				/>
				<input
					type="text"
					placeholder="Verification code"
					value={verificationCode}
					onChange={(e) => setVerificationCode(e.target.value)}
					className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/20"
				/>
			</div>
			<button
				onClick={(e) => {
					handleVerification(e);
				}}
				className="mt-4 w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 focus:outline-none disabled:bg-blue-800 disabled:text-neutral-400">
				Ellenőrzés
			</button>
			<a
				href="#"
				className="mt-4 inline-block text-sm text-blue-500 hover:underline">
				Email újraküldése
			</a>
		</section>
	);
};
