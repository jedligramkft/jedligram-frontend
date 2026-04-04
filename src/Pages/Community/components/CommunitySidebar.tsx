import { Link } from "react-router-dom";
import type { UserData } from "../../../Interfaces/UserData";
import { useTranslation } from "react-i18next";

type Props = {
  joinedUsers: UserData[];
  showAllMembers: boolean;
  onLoadMore: () => void;
  postsCount: number;
};

const CommunitySidebar = ({ joinedUsers: joinedUsers, showAllMembers, onLoadMore, postsCount }: Props) => {
  const { t } = useTranslation();

  return (
    <aside className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
        <h2 className="text-xl font-semibold text-white">{t("community.community_sidebar.members")}</h2>
        <div className="mt-4 space-y-3">
          {joinedUsers.length === 0 ? (
            <div className="text-sm text-white/70">{t("community.community_sidebar.no_members")}</div>
          ) : (
            (showAllMembers ? joinedUsers : joinedUsers.slice(0, 5)).map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <img src={user.image_url} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                <span className="text-sm text-white/80">@{user.name}</span>
                <Link to={`/users/${user.id}`} className="ml-auto rounded-xl border border-white/20 px-3 py-1 text-xs font-semibold text-white/90 transition hover:bg-white/10">
                  {t("community.community_sidebar.profile")}
                </Link>
              </div>
            ))
          )}
          {joinedUsers.length > 5 && !showAllMembers && (
            <button onClick={onLoadMore} className="w-full rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold text-white/90 transition hover:bg-white/10">
              +{joinedUsers.length - 5} {t("community.community_sidebar.member")}
            </button>
          )}
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
        <h2 className="text-xl font-semibold text-white">{t("community.community_sidebar.stats")}</h2>
        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{t("community.community_sidebar.members")}</div>
            <div className="mt-1 text-2xl font-bold text-white">{joinedUsers.length}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{t("community.community_sidebar.posts")}</div>
            <div className="mt-1 text-2xl font-bold text-white">{postsCount}</div>
          </div>
        </div>
      </div>
    </aside>
  )
};

export default CommunitySidebar;
