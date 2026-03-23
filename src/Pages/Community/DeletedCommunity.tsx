import { Link } from "react-router-dom";

const DeletedCommunity = () => {
    return (
        <section className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-2xl shadow-black/30 backdrop-blur">
            <h1 className="text-2xl font-black">Ez a közösség már nem elérhető</h1>
            <p className="mt-2 text-sm text-white/70">
                Ez a közösség törlésre került, és már nem érhető el. Lehetséges, hogy a közösség tulajdonosa vagy egy adminisztrátor törölte.
            </p>
            <Link to="/communities" className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                Vissza a közösségekhez
            </Link>
        </section>
    );
};

export default DeletedCommunity;