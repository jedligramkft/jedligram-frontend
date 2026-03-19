import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Login } from "../../api/auth";
import type { UserData } from "../../Interfaces/UserData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

export const InputComponent = (props: {
	label: string;
	type: string;
	value: string;
	placeholder?: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
	const { label, type, value, placeholder, onChange } = props;

	return (
		<div>
			<label
				htmlFor={label}
				className="text-sm font-semibold text-white/70 ml-3"
			>
				{label}
			</label>
			<input
				name={label}
				type={type}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/20"
			/>
		</div>
	);
};

const LoginPage = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		const button = e.currentTarget;
		button.disabled = true;

		const userData: UserData = {
			id: -1,
			username: username,
			email: "",
			password: password,
		};

		if (!username || !password) {
			setError("Felhasználónév és jelszó megadása kötelező.");
			button.disabled = false;
			return;
		}

		try {
			const response = await Login(userData);
			if (response.status === 200) {
				window.dispatchEvent(new Event("auth-changed"));
				navigate("/", { replace: true });
			}
		} catch (error) {
			if (!(error instanceof Error)) {
				setError("Hiba történt a bejelentkezés során. Kérlek próbáld újra.");
				return;
			}

			if (error.message.includes("401")) {
				setError("Érvénytelen felhasználónév vagy jelszó.");
				return;
			}

			setError("Hiba történt a bejelentkezés során. Kérlek próbáld újra.");
		} finally {
			button.disabled = false;
		}
	};

	return (
		<section className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-2xl shadow-black/30 backdrop-blur space-y-2">
			<h1 className="text-2xl font-black">Bejelentkezés</h1>
			<p className="text-sm text-white">Lépj be a Jedligram fiókodba.</p>

			{error && (
				<div className="w-full rounded-xl flex items-center p-4 border border-red-500 bg-red-500/10 text-red-500 bg-linear-60 from-red-500/10 to-red-500/20">
					<FontAwesomeIcon icon={faExclamationCircle} className="text-2xl" />
					<p className="text-sm text-white ml-3">{error}</p>
				</div>
			)}

			<div
				className={`flex flex-col gap-4 *:flex *:flex-col *:gap-1 ${error ? "mt-2" : "mt-6"}`}
			>
				<InputComponent
					label="Jedlikes bejelentkezés"
					type="text"
					value={username}
					placeholder="Vezetéknév.Keresztnév"
					onChange={(e) => setUsername(e.target.value)}
				/>
				<div>
					<InputComponent
						label="Jelszó"
						type="password"
						value={password}
						placeholder="Jelszó"
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
				<button
					type="button"
					onClick={(e) => {
						handleLogin(e);
					}}
					className="mt-2 rounded-xl bg-linear-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white keep-white shadow-md transition hover:from-blue-600 hover:to-blue-700
					active:scale-[0.98] duration-150 ease-in-out disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:opacity-50
					"
				>
					Bejelentkezés
				</button>
			</div>
		</section>
	);
};

export default LoginPage;
