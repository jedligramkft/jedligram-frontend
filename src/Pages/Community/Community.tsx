import { Link, useParams } from "react-router-dom";

const Community = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <section className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular">
      <div className="container mx-auto px-6 py-10">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-black/30 backdrop-blur">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/15 via-cyan-400/10 to-purple-500/15" />
          <div className="relative z-10 p-8 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 rounded-2xl bg-white/10 ring-1 ring-white/15" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Community {id ? `#${id}` : ""}</div>
                  <h1 className="text-3xl font-bold text-white md:text-4xl">Jedlik teszt</h1>
                  <p className="mt-1 text-sm text-white/70">Akció • 3.2k tag • Aktív</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button className="rounded-xl bg-linear-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-blue-600 hover:to-blue-700">Csatlakozás</button>
                <button className="rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/35 hover:bg-white/10">Meghívás</button>
                <Link to="/all-communities" className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10">
                  Vissza
                </Link>
              </div>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Leírás</div>
                <div className="mt-2 text-sm text-white/75">
                    Csatlakozz heti eseményekhez, közös stratégiákhoz és barátságos versenyekhez.
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Szabályok</div>
                <ul className="mt-2 space-y-1 text-sm text-white/75">
                  <li>• Tisztelet mindenkivel</li>
                  <li>• Spam tilos</li>
                  <li>• Spoiler jelölés</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Közelgő</div>
                <div className="mt-2 text-sm text-white/75">Szerda 19:00 — Ranked est</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Feed</h2>
        <Link
          to={id ? `/communities/${id}/posts/new` : "/all-communities"}
          className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
        >
          Új poszt
        </Link>
              </div>

              <div className="mt-5 space-y-4">
                {[1,2,3,4,5].map((n) => (
                  <article key={n} className="rounded-2xl border border-white/10 bg-black/10 p-5 transition hover:border-white/20">
                    <div className="flex items-center justify-between text-xs text-white/55">
                      <span>Admin • 2 órája</span>
                      <span className="rounded-full bg-white/10 px-3 py-1">Esemény</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-white">Tesztelés</h3>
                    <p className="mt-2 text-sm text-white/75">sziasztok</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10">Tetszik</button>
                      <button className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10">Komment</button>
                      <button className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10">Megosztás</button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
              <h2 className="text-xl font-semibold text-white">Tagok</h2>
              <div className="mt-4 space-y-3">
                {["Oliver", "Bence", "Anna", "Nóri"].map((name) => (
                  <div key={name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/10 ring-1 ring-white/10" />
                      <div>
                        <div className="text-sm font-semibold text-white">{name}</div>
                        <div className="text-xs text-white/55">Tag</div>
                      </div>
                    </div>
                    <button className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10">Profil</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
              <h2 className="text-xl font-semibold text-white">Statisztika</h2>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Posztok</div>
                  <div className="mt-1 text-2xl font-bold text-white">128</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Aktivitás</div>
                  <div className="mt-1 text-2xl font-bold text-white">Magas</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Community;
