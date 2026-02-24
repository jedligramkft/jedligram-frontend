import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from "axios";

const Login = () => {

const navigate = useNavigate();
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')

const handleLogin = async () => {
  try {
    const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {email, password});

	  const authTokenName = import.meta.env.VITE_AUTH_TOKEN_NAME ?? "jedligram_token";
	  localStorage.setItem(authTokenName, data.access_token);
    navigate('/');
    
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unknown error occurred";
    alert(message);
  }
};

  return (
    <section className='w-full rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-2xl shadow-black/30 backdrop-blur'>
      <h1 className='text-2xl font-black'>Bejelentkezés</h1>
      <p className='mt-2 text-sm text-white/70'>Lépj be a Jedligram fiókodba.</p>

      <div className='mt-6 flex flex-col gap-3'>
        <input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} className='w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/20'/>
        <input type='password' placeholder='Jelszó' value={password} onChange={(e) => setPassword(e.target.value)} className='w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/20'/>
        <button type='button' onClick={handleLogin} className='mt-2 rounded-xl bg-linear-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:from-blue-600 hover:to-blue-700'>Bejelentkezés</button>
      </div>

      <p className='mt-4 text-sm text-white/70'> Nincs még fiókod?{' '}
        <Link to='/auth/register' className='font-semibold text-white hover:underline'>Regisztráció</Link>
      </p>
    </section>
  )
}

export default Login
