import { useNavigate } from "react-router-dom";
import type { UserData } from "../../../../Interfaces/UserData";
import { useTranslation } from "react-i18next";
import { SecondaryButton } from "../../../../Components/Buttons";
import { useEffect, useState } from "react";
import { GetThreadMembers } from "../../../../api/threads";
import MembersList from "./MembersList";

type Props = {
	id: number;
	joinedUsers: UserData[];
	showAllMembers: boolean;
	onLoadMore: () => void;
	postsCount: number;
};

const profileStorageKey =
	import.meta.env.VITE_PROFILE_STORAGE_KEY || "jedligram_profile";

const CommunitySidebar = ({
	// joinedUsers: joinedUsers,
	id,
	// showAllMembers,
	// onLoadMore,
	postsCount,
}: Props) => {
	const navigate = useNavigate();
	const { t } = useTranslation();

	const [isLoadingMembers, setIsLoadingMembers] = useState(true);

	const [joinedMembers, setJoinedMembers] = useState<UserData[]>([]);

	useEffect(() => {
		async function load() {
			setJoinedMembers([]);
			try {
				setIsLoadingMembers(true);

				const users = (await GetThreadMembers(id)) as {
					data: UserData[];
				};

				users.data.sort((a, b) => a.role_id! - b.role_id!); // Sort users by role (Admin > Moderator > Member > Banned)

				// my user should be the first
				const rawProfile =
					localStorage.getItem(profileStorageKey) ?? "{}";
				const myId = JSON.parse(rawProfile).id;
				if (myId) {
					const myIndex = users.data.findIndex((u) => u.id === myId);
					if (myIndex > -1) {
						const [myUser] = users.data.splice(myIndex, 1);
						users.data.unshift(myUser);
					}
				}

				setJoinedMembers(users.data);
			} catch (error) {
				console.error("Failed to load members:", error);
			} finally {
				setIsLoadingMembers(false);
			}
		}

		load();
		//TODO: paginated endpoint for members and load more on button click instead of loading all at once
	}, []);

	return (
		<aside className="space-y-6">
			<div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
				<h2 className="text-xl font-semibold text-white">
					{t("community.community_sidebar.members")}
				</h2>
				<div className="mt-4 space-y-3">
					<MembersList
						joinedMembers={joinedMembers}
						isLoadingMembers={isLoadingMembers}
						threadId={id}
					/>
				</div>
			</div>
			<div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
				<h2 className="text-xl font-semibold text-white">
					{t("community.community_sidebar.stats")}
				</h2>
				<div className="mt-4 grid gap-3">
					<div className="rounded-2xl border border-white/10 bg-black/10 p-4">
						<div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
							{t("community.community_sidebar.members")}
						</div>
						<div className="mt-1 text-2xl font-bold text-white">
							{joinedMembers.length}
						</div>
					</div>
					<div className="rounded-2xl border border-white/10 bg-black/10 p-4">
						<div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
							{t("community.community_sidebar.posts")}
						</div>
						<div className="mt-1 text-2xl font-bold text-white">
							{postsCount}
						</div>
					</div>
				</div>
			</div>
		</aside>
	);
};

export default CommunitySidebar;
