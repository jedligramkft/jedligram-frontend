import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateThread } from "../../api/threads";

interface CreateCommunityProps {
    isLoggedIn: boolean;
}

const CreateCommunity = ({ isLoggedIn }: CreateCommunityProps) => {
    const navigate = useNavigate();
    const [created, setCreated] = useState(false);
    const [creating, setCreating] = useState(false); 
    const [communityName, setCommunityName] = useState("");
    const [category, setCategory] = useState("Stratégia");
    const [description, setDescription] = useState("");
    const [rules, setRules] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setCreating(true);
        if(!communityName.trim() || !description.trim() || !category.trim() || !rules.trim()){
            alert("Kérem, töltse ki a kötelező mezőket!");
            setCreating(false);
            return;
        }
        try{
            await CreateThread({
                id: -1,
                name: communityName.trim(),
                description: description.trim(),
                category: category.trim(),
                rules: rules.trim(),
            });
            setCreated(true);
            navigate("/all-communities");
        } catch(err){
        if(axios.isAxiosError(err)){
            const message = (err.response?.data as any)?.message;
            alert(message ?? "Nem sikerült létrehozni a közösséget.");
            return;
        }
        } finally {
            setCreating(false);
        }
    };

    useEffect(() => {
        if(!isLoggedIn){
            navigate("/auth/login");
        }
    }, [isLoggedIn, navigate]);

    return (
        <section className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular">
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]' />
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]' />
            <div className='absolute inset-0 bg-black/30' />

            <div className="relative container mx-auto px-6 py-10 flex max-w-5xl items-center justify-center">
                <div className="w-full max-w-xl">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/30 backdrop-blur">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-white">Közösség létrehozása</h1>
                            <p className="mt-1 text-sm text-white/70">
                                Add meg az alapadatokat. Később bármikor módosíthatod a közösség beállításait.
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-white/90">
                                    Közösség neve
                                </label>
                                <input type="text" id="name" value={communityName} onChange={(e) => setCommunityName(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/20" placeholder="Írd be a közösség nevét"/>
                            </div>

                            <div>
                                <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-white/90">
                                    Kategória
                                </label>
                                <div className="relative">
                                    <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="block w-full appearance-none rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 pr-10 text-sm text-white outline-none transition  focus:border-white/20">
                                        <option className="bg-[#1f2226]">Stratégia</option>
                                        <option className="bg-[#1f2226]">RPG</option>
                                        <option className="bg-[#1f2226]">Akció</option>
                                    </select>

                                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/60">
                                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="rules" className="mb-1.5 block text-sm font-medium text-white/90">Szabályok</label>
                                <textarea id="rules" value={rules} onChange={(e) => setRules(e.target.value)} className="block w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/20" placeholder="Írd be a közösség szabályait"/>
                            </div>

                            <div>
                                <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-white/90">Leírás</label>
                                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="block w-full resize-none rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/20" placeholder="Írd be a közösség leírását"/>
                                <p className="mt-2 text-xs text-white/50">
                                    Tipp: pár mondatban írd le, miről szól a közösség és kinek ajánlott.
                                </p>
                            </div>
                            <button type="submit" disabled={creating} className="group w-full rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20">
                                Létrehozás
                            </button>
                            <div className="pt-1 text-center text-xs text-white/50">
                                A „Létrehozás” gombbal elfogadod a közösségi irányelveket.
                            </div>
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

export default CreateCommunity;