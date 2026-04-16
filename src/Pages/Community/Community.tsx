import { useParams, useNavigate } from "react-router-dom";
import CommunityHeader from "./components/CommunityHeader";
import CommunitySidebar from "./components/Sidebar/CommunitySidebar";
import PostList from "./components/PostList";
import { useCommunity } from "./hooks/useCommunity";
import { useEffect, useState } from "react";
// import { useComments } from "./hooks/useComments";

const Community = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const threadId = id ? Number(id) : NaN;

	const community = useCommunity(threadId, id, navigate);
	// const comments = useComments(isLoggedIn);

	const profileKey = import.meta.env.VITE_LOCAL_STORAGE_PROFILE_KEY;
	const [myRank, setMyRank] = useState<number | null>(null);

	useEffect(() => {
		async function load() {
			const rawProfile = localStorage.getItem(profileKey);
			if (!rawProfile) return;
			const myProfile = community.joinedUsers.find(
				(member) => member.id === JSON.parse(rawProfile).id,
			);

			if (!myProfile) return;
			setMyRank(myProfile.role_id ?? null);
		}
		load();
	}, [community.joinedUsers]);

	return (
		<section className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]" />
			<div className="absolute inset-0 bg-black/30" />
			<div className="container mx-auto px-6 py-10">
				<CommunityHeader
					id={id}
					thread={community.thread}
					isJoined={community.isJoined}
					onJoin={community.handleJoin}
					onLeave={community.handleLeave}
					onInvite={community.handleInvite}
				/>
				<div className="mt-8 grid gap-6 lg:grid-cols-3">
					<div className="lg:col-span-2">
						<PostList id={id} isJoined={community.isJoined} myRank={myRank} />
					</div>
					<CommunitySidebar
						id={Number(id)}
						joinedUsers={community.joinedUsers}
						showAllMembers={community.showAllMembers}
						onLoadMore={community.handleLoadMoreUsernames}
						postsCount={community.posts.length}
						myRank={myRank}
					/>
				</div>
			</div>
		</section>
	);
};

export default Community;
