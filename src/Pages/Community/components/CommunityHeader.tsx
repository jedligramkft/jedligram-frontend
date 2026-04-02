import { Link } from "react-router-dom";
import type { ThreadData } from "../../../Interfaces/ThreadData";
import WelcomeBanner from "../../../Components/Utils/WelcomeBanner";
import { useTranslation } from "react-i18next";

type Props = {
  id?: string;
  thread: ThreadData | null;
  isJoined: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onInvite: () => void;
};

const CommunityHeader = ({ id, thread, isJoined, onJoin, onLeave, onInvite }: Props) => {
  const { t } = useTranslation();

  return (
    <>
      <WelcomeBanner communityName={thread?.name} />
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-black/30 backdrop-blur">
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/15 via-cyan-400/10 to-purple-500/15" />
        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-5">
              <div className="shrink-0 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <img src={thread?.image} alt={thread?.name} className="h-full w-full rounded-2xl object-cover" />
                {/* <span className="text-2xl font-bold text-white/60">{thread?.name.charAt(0).toUpperCase()}</span> */}
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">{t("community.community_header.community")} {id ? `#${id}` : ""}</div>
                <h1 className="text-3xl font-bold text-white md:text-4xl">{thread?.name ?? t("community.community_header.unknown_community")}</h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {isJoined ? (
                <button onClick={onLeave} className="cursor-pointer rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/35 hover:bg-white/10">
                  {t("community.community_header.leave")}
                </button>
              ) : (
                <button onClick={onJoin} className="cursor-pointer rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/35 hover:bg-white/10">
                  {t("community.community_header.join")}
                </button>
              )}
              <button onClick={onInvite} className="cursor-pointer rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/35 hover:bg-white/10">
                {t("community.community_header.invite")}
              </button>
              <Link to="/all-communities" className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10">
                {t("community.community_header.back")}
              </Link>
            </div>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{t("community.community_header.description")}</div>
              <div className="mt-2 text-sm text-white/75">{thread?.description || t("community.community_header.no_description")}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{t("community.community_header.rules")}</div>
              <ul className="mt-2 space-y-1 text-sm text-white/75">
              {thread?.rules ? thread.rules.split("\n").map((rule, i) => (
                  <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 text-xs font-bold text-white/80">•</span>
                      <span>{rule}</span>
                  </li>
                  )) : <li className="text-white/70">{t("community.community_header.no_rules")}</li>
              }
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommunityHeader;
