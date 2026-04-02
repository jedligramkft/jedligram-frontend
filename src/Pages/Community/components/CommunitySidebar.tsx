import { Link } from "react-router-dom";
import type { UserData } from "../../../Interfaces/UserData";
import { useTranslation } from "react-i18next";

type Props = {
  joinedUsers: UserData[];
  showAllMembers: boolean;
  onLoadMore: () => void;
  postsCount: number;
  userRole?: number;
  currentUserId?: number;
  onPromoteUser?: (userId: number) => Promise<void> | void;
  onBanUser?: (userId: number) => Promise<void> | void;
};

const CommunitySidebar = ({ joinedUsers: joinedUsers, showAllMembers, onLoadMore, postsCount, userRole, currentUserId, onPromoteUser, onBanUser }: Props) => {
  const { t } = useTranslation();
  const canPromote = userRole === 1 && typeof onPromoteUser === "function";
  const canBan = (userRole === 1 || userRole === 2) && typeof onBanUser === "function";
  const bannedRoleId = 4;
  const filteredUsers = (showAllMembers ? joinedUsers : joinedUsers.slice(0, 5))
    .filter(u => u.role_id !== bannedRoleId);

  return (
    <aside className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
        <h2 className="text-xl font-semibold text-white">{t("community.community_sidebar.members")}</h2>
        <div className="mt-4 space-y-3">
        {filteredUsers.length === 0 ? (
            <div className="text-sm text-white/70">{t("community.community_sidebar.no_members")}</div>
          ) : (
            filteredUsers.map(user => (
              <div key={user.id} className="flex items-center gap-3">
                <img src={user.image_url} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                <span className="text-sm text-white/80">@{user.name}</span>
                {userRole === 1 &&  (
                  <span className="rounded-md bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-400">
                    {t("community.community_sidebar.owner")}
                  </span>
                )}
                {userRole === 2 && (
                  <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-400">
                    {t("community.community_sidebar.moderator")}
                  </span>
                )}
                <div className="ml-auto flex items-center gap-2">
                  {canPromote && Number(user.id) !== Number(currentUserId) && (
                    <button
                      onClick={async () => { await onPromoteUser(user.id) }}
                      className="rounded-xl border border-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-400/80 transition hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-70">
                      {t("community.community_sidebar.promote")}
                    </button>
                  )}
                  {canBan && Number(user.id) !== Number(currentUserId) && (
                    <button
                      onClick={async () => { await onBanUser(user.id) }}
                      className="rounded-xl border border-white/20 px-3 py-1 text-xs font-semibold text-white/90 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70">
                      {t("community.community_sidebar.ban")}
                    </button>
                  )}
                  <Link
                    to={`/users/${user.id}`}
                    className="rounded-xl border border-white/20 px-3 py-1 text-xs font-semibold text-white/90 transition hover:bg-white/10">
                    {t("community.community_sidebar.profile")}
                  </Link>
                </div>
              </div>
            ))
          )}
          {filteredUsers.length > 5 && !showAllMembers && (
            <button onClick={onLoadMore} className="w-full rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold text-white/90 transition hover:bg-white/10">
              +{filteredUsers.length - 5} {t("community.community_sidebar.member")}
            </button>
          )}
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
        <h2 className="text-xl font-semibold text-white">{t("community.community_sidebar.stats")}</h2>
        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{t("community.community_sidebar.members")}</div>
            <div className="mt-1 text-2xl font-bold text-white">{filteredUsers.length}</div>
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
