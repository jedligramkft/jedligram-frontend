const CreateCommunity = () => {
    return (
        <div className="flex h-screen items-center justify-center bg-gradient-to-b from-black/10 to-black">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/30 backdrop-blur">
                <h1 className="mb-6 text-2xl font-bold text-white">Közösség létrehozása</h1>
                <form className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-white">Közösség neve</label>
                        <input type="text" id="name" className="mt-1 block w-full rounded-lg border border-white/20 bg-black/10 px-4 py-2 text-sm text-white focus:border-blue-500 focus:ring focus:ring-blue-500/50" placeholder="Írd be a közösség nevét" />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-white">Kategória</label>
                        <select id="category" className="mt-1 block w-full rounded-lg border border-white/20 bg-black/10 px-4 py-2 text-sm text-white focus:border-blue-500 focus:ring focus:ring-blue-500/50">
                            <option>Stratégia</option>
                            <option>RPG</option>
                            <option>Akció</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-white">Leírás</label>
                        <textarea id="description" className="mt-1 block w-full rounded-lg border border-white/20 bg-black/10 px-4 py-2 text-sm text-white focus:border-blue-500 focus:ring focus:ring-blue-500/50" placeholder="Írd be a közösség leírását" />
                    </div>
                    <button type="submit" className="w-full rounded-lg bg-linear-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-blue-600 hover:to-blue-700">
                        Létrehozás
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateCommunity;