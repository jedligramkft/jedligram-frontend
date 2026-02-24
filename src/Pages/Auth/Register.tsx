import { Link } from 'react-router-dom'
import { useState } from 'react'
import type { UserData } from '../../Interfaces/UserData'

import { Register } from '../../api/auth'

const RegisterPage = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmpassword, setConfirmPassword] = useState('')
	const [userName, setUserName] = useState('')

	
	const handleRegister = async (e: React.FormEvent<HTMLButtonElement>) => {
		

		e.preventDefault();
		(e.target as HTMLButtonElement).disabled = true;
		const errors: string[] = [];

		if (
			email.trim() === '' || 
			password.trim() === '' || 
			confirmpassword.trim() === '' || 
			userName.trim() === ''
		) {
			errors.push('Kérem, töltse ki az összes mezőt!');
		}

		if (!/\S+@\S+\.\S+/.test(email)) {
			errors.push('Kérem, adjon meg egy érvényes email címet!');
		}

		if (password !== confirmpassword) {
			errors.push('A jelszavak nem egyeznek!');
		}

		if(errors.length !== 0) {
			alert(errors.join('\n'));
		}else{
			const userData: UserData = {id: -1, email: email, password: password, username: userName};
			
			const response = await Register(userData);
			console.log(response);
		}

		(e.target as HTMLButtonElement).disabled = false;
	}

	return (
		<section className='w-full rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-2xl shadow-black/30 backdrop-blur'>
			<h1 className='text-2xl font-black'>Regisztráció</h1>
			<p className='mt-2 text-sm text-white/70'>Hozz létre fiókot a Jedligramhoz.</p>

			<div className='mt-6 flex flex-col gap-3'>
				<input type='text' placeholder='Felhasználónév' value={userName} onChange={(e) => setUserName(e.target.value)} className='w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/20'/>
				<input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} className='w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/20'/>
				<input type='password' placeholder='Jelszó' value={password} onChange={(e) => setPassword(e.target.value)} className='w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/20'/>
				<input type='password' placeholder='Jelszó újra' value={confirmpassword} onChange={(e) => setConfirmPassword(e.target.value)} className='w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/20'/>
				<button type='button' onClick={handleRegister} className='mt-2 rounded-xl bg-linear-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:from-blue-600 hover:to-blue-700'>Regisztráció</button>
			</div>

			<p className='mt-4 text-sm text-white/70'>Van már fiókod?{' '}
				<Link to='/auth/login' className='font-semibold text-white hover:underline'>Bejelentkezés</Link>
			</p>
		</section>
	)
}

export default RegisterPage
