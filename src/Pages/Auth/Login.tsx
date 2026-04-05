import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Login } from "../../api/auth";
import type { UserData } from "../../Interfaces/UserData";
import DynamicFAIcon from "../../Components/Utils/DynamicFaIcon";
import { InputComponent } from "../../Components/InputFields/InputComponent";
import { PrimaryButton } from "../../Components/Buttons";

const LoginPage = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isPasswordVisible, setPasswordVisible] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();

	const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		if (isSubmitting) return;
		setIsSubmitting(true);
		setError(null);

		const userData: UserData = {
			id: -1,
			username: username,
			email: "",
			password: password,
		};

		if (!username || !password) {
			setError("Felhasználónév és jelszó megadása kötelező.");
			setIsSubmitting(false);
			return;
		}

		try {
			const response = await Login(userData);
			if (
				response.status === 202 &&
				response.data?.requires_verification
			) {
				navigate("/auth/verification");
			} else if (response.status === 200) {
				window.dispatchEvent(new Event("auth-changed"));
				navigate("/");
			}
		} catch (error) {
			console.log(error);
			if (!(error instanceof Error)) {
				setError(
					"Hiba történt a bejelentkezés során. Kérlek próbáld újra.",
				);
				return;
			}

			if (error.message.includes("401")) {
				setError("Érvénytelen felhasználónév vagy jelszó.");
				return;
			}

			setError(
				"Hiba történt a bejelentkezés során. Kérlek próbáld újra.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-2xl shadow-black/30 backdrop-blur space-y-2">
			<h1 className="text-2xl font-black">Bejelentkezés</h1>
			<p className="text-sm text-white/70">
				Lépj be a Jedligram fiókodba.
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
					label="Jedlikes bejelentkezés"
					type="text"
					value={username}
					placeholder="Vezetéknév.Keresztnév"
					onChange={(e) => setUsername(e.target.value)}
				/>

				<InputComponent
					label="Jelszó"
					type={isPasswordVisible ? "text" : "password"}
					value={password}
					placeholder="Jelszó"
					onChange={(e) => setPassword(e.target.value)}
					absoluteChildren={
						<>
							<div
								className="h-full w-12 absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer"
								onClick={() => {
									setPasswordVisible(!isPasswordVisible);
								}}
							>
								<div
									className={`${isPasswordVisible ? "block" : "hidden"}`}
								>
									<DynamicFAIcon
										exportName="faEye"
										className="text-md scale-x-110"
									/>
								</div>
								<div
									className={`${isPasswordVisible ? "hidden" : "block"}`}
								>
									<DynamicFAIcon
										exportName="faEyeSlash"
										className="text-md scale-x-110"
									/>
								</div>
							</div>
						</>
					}
				/>

				<PrimaryButton
					type="submit"
					onClick={handleLogin}
					disabled={isSubmitting}
					className="mt-2 px-4 py-3"
				>
					Bejelentkezés
				</PrimaryButton>
			</form>
		</section>
	);
};

export default LoginPage;
