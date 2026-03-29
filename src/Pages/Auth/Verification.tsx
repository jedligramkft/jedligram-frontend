import { useState } from "react";
import { useSearchParams } from "react-router";

export const VerificationPage = () => {
	const searchParams = useSearchParams();
	const [email, setEmail] = useState(searchParams[0].get("email") || "");
	const [verificationCode, setVerificationCode] = useState(
		searchParams[0].get("code") || "",
	);

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
			<button className="mt-4 w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white keep-white hover:bg-blue-600 focus:outline-none">
				Ellenőrzés
			</button>
			<a
				href="#"
				className="mt-4 inline-block text-sm text-blue-500 hover:underline"
			>
				Email újraküldése
			</a>
		</section>
	);
};
