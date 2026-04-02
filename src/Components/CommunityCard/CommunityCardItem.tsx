import { Link } from "react-router-dom"
import type { ThreadData } from "../../Interfaces/ThreadData"
import { useTranslation } from "react-i18next";

const CommunityCardItem = ({ threads }: { threads: ThreadData[] }) => {
  const { t } = useTranslation();

  return (
    <Link to={`/communities/${threads[0]?.id}`} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur transition hover:-translate-y-1 hover:border-white/20">
      {threads[0]?.header && (
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${threads[0].header})` }}/>
      )}

      <div className={`absolute inset-0 ${threads[0]?.header ? 'bg-black/30' : ''}`} />
        <div className="relative z-10 flex h-full flex-col gap-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                <span className="px-2 py-1 rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white/80">{threads[0]?.users_count ?? "N/A"} {t('allCommunities.members')}</span>
            </div>
            <div className="flex items-start gap-4">
                <div className="shrink-0 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                    {threads[0]?.image ? (
                        <img src={threads[0].image} alt={threads[0].name} className="h-full w-full rounded-2xl object-cover" />
                    ) : (
                        <span className="text-2xl font-bold text-white/60">{threads[0]?.name.charAt(0).toUpperCase() ?? "?"}</span>
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-white">
                        {threads[0]?.name}
                    </h3>
                    <p className="text-sm text-white/70">
                        {threads[0]?.description || t('allCommunities.default_description')}
                    </p>
                </div>
            </div>
            <div className="mt-auto flex items-center justify-end">
                <Link to={`/communities/${threads[0]?.id}`} className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:border-white/40 hover:bg-white/10">
                    {t('allCommunities.view_button')}
                </Link>
            </div>
        </div>
    </Link>
  )
}

export default CommunityCardItem
