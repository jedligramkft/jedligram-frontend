import axios from "axios";
import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CreateThread } from "../../api/threads";

interface CreateCommunityProps {
    isLoggedIn: boolean;
}

const CreateCommunity = ({ isLoggedIn }: CreateCommunityProps) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [created, setCreated] = useState(false);
    const [communityId, setCommunityId] = useState<number | null>(null);
    const [communityName, setCommunityName] = useState("");
    const [description, setDescription] = useState("");
    const [rules, setRules] = useState("");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(!communityName.trim() || !description.trim() || !rules.trim()){
            alert(t('createCommunity.validation_error'));
            return;
        }
        try{
            const response = await CreateThread({
                id: -1,
                name: communityName.trim(),
                description: description.trim(),
                rules: rules.trim(),
            });
            setCreated(true);
            setCommunityId(response.data.id);
        } catch(err){
        if(axios.isAxiosError(err)){
            const message = (err.response?.data as any)?.message;
            alert(message ?? t('createCommunity.create_error'));
            return;
        }
        }
    };

    useEffect(() => {
        if(!isLoggedIn){
            navigate("/auth/login");
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        if(created){
            navigate(`/communities/${communityId}`);
        }
    })

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
                                <h1 className="text-3xl font-black text-white md:text-4xl">{t('createCommunity.title')}</h1>
                                <p className="mt-2 text-sm text-white/70">{t('createCommunity.description')}</p>
                            </div>

                            <button type="button" onClick={() => navigate("/all-communities")} className="cursor-pointer h-10 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10">
                                {t('createCommunity.back_button')}
                            </button>
                        </div>

                        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-white/60">{t('createCommunity.name_label')}</label>
                                <input  type="text" id="name" value={communityName} onChange={(e) => setCommunityName(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/20" placeholder={t('createCommunity.name_placeholder')}
                                />
                            </div>

                            <div>
                                <label htmlFor="rules" className="text-xs font-semibold uppercase tracking-wider text-white/60">{t('createCommunity.rules_label')}</label>
                                <textarea id="rules" value={rules} onChange={(e) => setRules(e.target.value)} className="mt-2 h-32 w-full resize-none rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/20" placeholder={t('createCommunity.rules_placeholder')}/>
                            </div>

                            <div>
                                <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-white/60">{t('createCommunity.description_label')}</label>
                                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none transition focus:border-white/20" placeholder={t('createCommunity.description_placeholder')}/>
                                <p className="mt-2 text-xs text-white/55">{t('createCommunity.description_tip')}</p>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <p className="text-xs text-white/55">{t('createCommunity.info_text')}</p>
                                <button type="submit" className="cursor-pointer rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white keep-white shadow-md transition hover:from-blue-600 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70">
                                    {t('createCommunity.submit_button')}
                                </button>
                            </div>

                            <div className="pt-1 text-center text-xs text-white/50">{t('createCommunity.disclaimer')}</div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CreateCommunity;