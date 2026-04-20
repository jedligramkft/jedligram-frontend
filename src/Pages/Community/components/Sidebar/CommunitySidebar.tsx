import { useTranslation } from "react-i18next";
import MembersList from "./MembersList";

type Props = {
	id: number;
	myRank: number | null;
};

const CommunitySidebar = ({
	id,
	myRank,
}: Props) => {
	const { t } = useTranslation();

	return (
		<aside className="relative z-40 space-y-6 overflow-visible">
			<div className="relative z-30 overflow-visible rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
				<h2 className="text-xl font-semibold text-white">
					{t("community.community_sidebar.members")}
				</h2>
				<div className="mt-4 space-y-3 overflow-visible">
					<MembersList threadId={id} myRank={myRank} />
				</div>
			</div>
			<div className="relative z-10 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
				<h2 className="text-xl font-semibold text-white">
					{t("community.community_sidebar.stats")}
				</h2>
				<div className="mt-4 grid gap-3">
					<div className="rounded-2xl border border-white/10 bg-black/10 p-4">
						<div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
							{t("community.community_sidebar.members")}
						</div>
						<div className="mt-1 text-2xl font-bold text-white">
							{/* {joinedMembers.length} */}
							TBI
						</div>
					</div>
					<div className="rounded-2xl border border-white/10 bg-black/10 p-4">
						<div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
							{t("community.community_sidebar.posts")}
						</div>
						<div className="mt-1 text-2xl font-bold text-white">
							{/* {postsCount} */}
							TBI
						</div>
					</div>
				</div>
			</div>
		</aside>
	);
};

export default CommunitySidebar;
