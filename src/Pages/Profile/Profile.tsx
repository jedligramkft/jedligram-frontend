const Profile = () => {
  return (
    <section className='relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]' />
      <div className='absolute inset-0 bg-black/30' />

      <div className='relative z-10 mx-auto flex max-w-xl flex-col px-4 pt-12 pb-12'>
        <div className='rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur'>
          <h1 className='text-3xl font-black text-white'>Profil</h1>
          <p className='mt-2 text-sm text-white/70'>Kezeld a fiókadataidat és személyes beállításaidat</p>

          <div className='mt-8 flex flex-col items-center gap-4'>
            <div className='h-28 w-28 rounded-full border border-white/20 bg-linear-to-br from-blue-500/30 to-indigo-500/30 shadow-lg' />
            <button className='text-sm font-semibold text-blue-400 transition hover:text-blue-300'>Profilkép módosítása</button>
          </div>

          <div className='mt-10 grid gap-5'>
            <div>
              <label className='text-xs font-semibold uppercase tracking-wider text-white/60'>Felhasználónév</label>
              <input type='text' placeholder='jedlik_user' className='mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/20'/>
            </div>

            <div>
              <label className='text-xs font-semibold uppercase tracking-wider text-white/60'>Email</label>
              <input type='email' placeholder='email@pelda.hu' className='mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/20'/>
            </div>

            <div>
              <label className='text-xs font-semibold uppercase tracking-wider text-white/60'>Bemutatkozás</label>
              <textarea placeholder='Pár szó magadról...' className='mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/20'/>
            </div>
          </div>

          <div className='mt-8 flex items-center justify-between'>
            <button className='text-sm font-semibold text-white/60 transition hover:text-white'>Jelszó módosítása</button>
            <button className='mt-2 rounded-xl bg-linear-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:from-blue-600 hover:to-blue-700'>Mentés</button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Profile
