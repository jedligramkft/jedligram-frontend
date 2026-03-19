import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { CreatePostInThread } from "../../api/threads";

const CreatePost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    const authTokenName = import.meta.env.VITE_AUTH_TOKEN_NAME ?? "jedligram_token";
    const token = localStorage.getItem(authTokenName);

    if (!token) {
      navigate("/auth/login", { replace: true });
      return;
    }

    if (!id) {
      alert("Érvénytelen közösség!");
      return;
    }

    setCreating(true);
    try{
      await CreatePostInThread(Number(id), { title, content });
      setCreated(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = (err.response?.data as any)?.message;
        alert(message ?? "Nem sikerült létrehozni a posztot.");
        return;
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular">
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]' />
      <div className='absolute inset-0 bg-black/30' />
      <div className="container mx-auto px-6 py-10">
        <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-black/30 backdrop-blur">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/15 via-cyan-400/10 to-purple-500/15" />
          <div className="relative z-10 p-8 md:p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-black text-white md:text-4xl">Új poszt</h1>
                <p className="mt-2 text-sm text-white/70">Oszd meg a gondolataid a közösséggel</p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/10 px-4 py-2 text-xs font-semibold text-white/80">
                  <span className="text-white/60">Közösség</span>
                  <span className="text-white/90">#{id ?? "—"}</span>
                </div>
              </div>

              <button type="button" onClick={() => navigate(id ? `/communities/${encodeURIComponent(id)}` : "/all-communities")} className="cursor-pointer h-10 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10">
                Vissza
              </button>
            </div>
            <form className="mt-8 grid gap-5" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-white/60">Cím</label>
                <input type="text" placeholder="Adj egy rövid címet…" className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/20" value={title} onChange={(e) => setTitle(e.target.value)}/>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-white/60">Tartalom</label>
                <textarea placeholder="Írd le részletesebben…" className="mt-2 h-44 w-full resize-none rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/20" value={content} onChange={(e) => setContent(e.target.value)}/>
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-white/55">A poszt a közösség feedjében jelenik meg.</p>
                  <button type="submit" disabled={creating} className="cursor-pointer rounded-xl bg-linear-to-r from-blue-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white keep-white shadow-md transition hover:from-blue-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-70">
                  {creating ? "Létrehozás…" : "Poszt létrehozása"}
                </button>
              </div>
            </form>

            {created && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-4">
                <p className="text-sm font-semibold text-emerald-300">Sikeresen létrehozva.</p>
                <button type="button" onClick={() => navigate(id ? `/communities/${encodeURIComponent(id)}` : "/all-communities")} className="cursor-pointer mt-3 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10">
                  Vissza a közösségbe
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreatePost;
