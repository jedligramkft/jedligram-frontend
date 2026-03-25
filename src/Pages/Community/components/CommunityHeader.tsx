import { Link } from "react-router-dom";
import type { ThreadData } from "../../../Interfaces/ThreadData";
import WelcomeBanner from "../../../Components/Utils/WelcomeBanner";

type Props = {
  id?: string;
  thread: ThreadData | null;
  isJoined: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onInvite: () => void;
};

const CommunityHeader = ({ id, thread, isJoined, onJoin, onLeave, onInvite }: Props) => (
  <>
    <WelcomeBanner communityName={thread?.name} />
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-black/30 backdrop-blur">
      <div className="absolute inset-0 bg-linear-to-br from-blue-500/15 via-cyan-400/10 to-purple-500/15" />
      <div className="relative z-10 p-8 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-white/10 ring-1 ring-white/15" />
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Community {id ? `#${id}` : ""}</div>
              <h1 className="text-3xl font-bold text-white md:text-4xl">{thread?.name ?? "Ismeretlen Közösség"}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isJoined ? (
              <button onClick={onLeave} className="cursor-pointer rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/35 hover:bg-white/10">
                Közösség elhagyása
              </button>
            ) : (
              <button onClick={onJoin} className="cursor-pointer rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/35 hover:bg-white/10">
                Csatlakozás
              </button>
            )}
            <button onClick={onInvite} className="cursor-pointer rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/35 hover:bg-white/10">
              Meghívás
            </button>
            <Link to="/all-communities" className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10">
              Vissza
            </Link>
          </div>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Leírás</div>
            <div className="mt-2 text-sm text-white/75">{thread?.description || "Nincs leírás."}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Szabályok</div>
            <ul className="mt-2 space-y-1 text-sm text-white/75">
            {thread?.rules ? thread.rules.split("\n").map((rule, i) => (
                <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 text-xs font-bold text-white/80">•</span>
                    <span>{rule}</span>
                </li>
                )) : <li className="text-white/70">Nincsenek szabályok.</li>
            }
            </ul>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default CommunityHeader;
