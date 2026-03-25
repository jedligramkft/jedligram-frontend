import { Link } from "react-router-dom";

type Props = {
  joinedUsernames: string[];
  showAllMembers: boolean;
  onLoadMore: () => void;
  postsCount: number;
};

const CommunitySidebar = ({ joinedUsernames: joinedUserId, showAllMembers, onLoadMore, postsCount }: Props) => (
  <aside className="space-y-6">
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
      <h2 className="text-xl font-semibold text-white">Tagok</h2>
      <div className="mt-4 space-y-3">
        {joinedUserId.length === 0 ? (
          <div className="text-sm text-white/70">Nincsenek tagok.</div>
        ) : (
          (showAllMembers ? joinedUserId : joinedUserId.slice(0, 5)).map((username, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/10 ring-1 ring-white/15" />
              <span className="text-sm text-white/80">@{username}</span>
              <Link to={`/users/${username}`} className="ml-auto rounded-xl border border-white/20 px-3 py-1 text-xs font-semibold text-white/90 transition hover:bg-white/10">
                Profil
              </Link>
            </div>
          ))
        )}
        {joinedUserId.length > 5 && !showAllMembers && (
          <button onClick={onLoadMore} className="w-full rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold text-white/90 transition hover:bg-white/10">
            +{joinedUserId.length - 5} tag
          </button>
        )}
      </div>
    </div>
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
      <h2 className="text-xl font-semibold text-white">Statisztika</h2>
      <div className="mt-4 grid gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Tagok</div>
          <div className="mt-1 text-2xl font-bold text-white">{joinedUserId.length}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Posztok</div>
          <div className="mt-1 text-2xl font-bold text-white">{postsCount}</div>
        </div>
      </div>
    </div>
  </aside>
);

export default CommunitySidebar;
