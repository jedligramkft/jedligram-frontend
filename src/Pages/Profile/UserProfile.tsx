import { Link, useParams } from 'react-router-dom'

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();

  const communities = [
    { name: 'Jedlik Esport', role: 'Member' },
    { name: 'Arcane RPG Klub', role: 'Admin' },
    { name: 'Taktikus Stratégák', role: 'Member' },
  ]

  return (
    <section className='relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]' />
      <div className='absolute inset-0 bg-black/30' />

      <div className='relative z-10 mx-auto flex max-w-xl flex-col px-4 pb-12 pt-12'>
        <div className='rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <h1 className='text-3xl font-black text-white'>Felhasználó profilja</h1>
              <p className='mt-2 text-sm text-white/70'>Megtekintés (nem szerkeszthető)</p>
              <p className='mt-3 text-xs font-semibold uppercase tracking-wider text-white/60'>
                User ID: <span className='text-white/80'>{id ?? '—'}</span>
              </p>
            </div>

            <Link to='/all-communities' className='rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10'>
              Vissza
            </Link>
          </div>

          <div className='mt-8 flex flex-col items-center gap-4'>
            <div className='h-28 w-28 rounded-full border border-white/20 bg-linear-to-br from-blue-500/30 to-indigo-500/30 shadow-lg' />
            <p className='text-sm font-semibold text-white/80'>@username</p>
          </div>

          <div className='mt-10 grid gap-5'>
            <div>
              <label className='text-xs font-semibold uppercase tracking-wider text-white/60'>Felhasználónév</label>
              <div className='mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/85'>
                jedlik_user
              </div>
            </div>

            <div>
              <label className='text-xs font-semibold uppercase tracking-wider text-white/60'>Bemutatkozás</label>
              <div className='mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/85'>
                Pár szó magáról…
              </div>
            </div>
          </div>
          
          <div className='mt-10'>
            <h2 className='text-xl font-semibold text-white'>Közösségek</h2>
            <p className='mt-1 text-sm text-white/60'>Amikben benne van</p>

            <div className='mt-4 space-y-3'>
              {communities.map((community) => (
                <div key={community.name} className='flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 p-4'>
                  <div>
                    <p className='text-sm font-semibold text-white'>{community.name}</p>
                    <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/50'>{community.role}</p>
                  </div>
                  <Link to='/all-communities' className='rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10'>
                    Megnézem
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserProfile
