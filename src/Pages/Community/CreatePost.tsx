import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import httpClient from "../../api/httpClient";
import axios from "axios";

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
      await httpClient.post(`/api/threads/${encodeURIComponent(id)}/post`, {
        title,
        content
      });
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
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-black/30 backdrop-blur">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/15 via-cyan-400/10 to-purple-500/15" />
          <div className="relative z-10 p-8 md:p-10">
            <h1 className="text-3xl font-bold text-white md:text-4xl">Új poszt létrehozása</h1>

            <form className="mt-6 flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <input type="text" placeholder="Cím" className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500" value={title} onChange={(e) => setTitle(e.target.value)}/>
              <textarea placeholder="Tartalom" className="h-40 w-full resize-none rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500" value={content} onChange={(e) => setContent(e.target.value)}/>
              <button type="submit" disabled={creating} className="self-end rounded-lg bg-linear-to-r from-blue-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:from-blue-600 hover:to-blue-700 disabled:opacity-70">
                Poszt létrehozása
              </button>
            </form>
            {created && (
              <p className="mt-4 text-sm font-semibold text-emerald-300">Sikeresen létrehozva.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreatePost;
