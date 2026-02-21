import { useParams } from "react-router-dom";

const CreatePost = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <section className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular">
      <div className="container mx-auto px-6 py-10">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-black/30 backdrop-blur">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/15 via-cyan-400/10 to-purple-500/15" />
          <div className="relative z-10 p-8 md:p-10">
            <h1 className="text-3xl font-bold text-white md:text-4xl">Új poszt létrehozása</h1>

            <form className="mt-6 flex flex-col gap-4" onSubmit={(e) => {e.preventDefault(); void id;}}>
              <input type="text" placeholder="Cím" className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              <textarea placeholder="Tartalom" className="h-40 w-full resize-none rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              <button type="submit" className="self-end rounded-lg bg-linear-to-r from-blue-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:from-blue-600 hover:to-blue-700">
                Poszt létrehozása
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreatePost;
