import { useState } from "react";

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

    const handleChangePassword = async () => {
        //
    }

  return (
    <section className='w-full rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-2xl shadow-black/30 backdrop-blur'>
        <h1 className='text-2xl font-black'>Jelszó módosítása</h1>
        <p className='mt-2 text-sm text-white/70'>Add meg új jelszavadat a Jedligram fiókodhoz.</p>

        <div className='mt-6 flex flex-col gap-3'>
            <input type='password' placeholder='Régi jelszó' value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className='w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/20'/>
            <input type='password' placeholder='Új jelszó' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className='w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/20'/>
            <input type='password' placeholder='Új jelszó újra' value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} className='w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/20'/>
            <button type='button' onClick={handleChangePassword} className='mt-2 rounded-xl bg-linear-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:from-blue-600 hover:to-blue-700'>Jelszó módosítása</button>
        </div>
            
    </section>
  )
}

export default ChangePassword
