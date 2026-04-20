import { useParams, useNavigate } from "react-router-dom";
import CommunitySidebar from "./components/Sidebar/CommunitySidebar";
import { useCommunity } from "./hooks/useCommunity";
import CommunityHeader from "./components/CommunityHeader";
import PostList from "./components/PostList.tsx";
// import { useComments } from "./hooks/useComments";

const Community = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const threadId = id ? Number(id) : NaN;

	const community = useCommunity(threadId, navigate);

	return (
		<section className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]" />
			<div className="absolute inset-0 bg-black/30" />
			<div className="container mx-auto px-6 py-10">
				<CommunityHeader
					id={id}
					thread={community.thread}
					isJoined={community.isUserJoined}
					onJoin={community.handleJoin}
					onLeave={community.handleLeave}
					onInvite={community.handleInvite}
				/>
				<div className="mt-8 grid gap-6 lg:grid-cols-3">
					<div className="lg:col-span-2">
						<PostList
							id={threadId}
							isJoined={community.isUserJoined}
							myRank={community.thread?.my_role ?? 3}
							posts={community.posts}
						/>
					</div>
					<CommunitySidebar
						threadId={threadId}
						myRank={community.thread?.my_role ?? 3}
						members={community.members || null}
						postsCount={community.posts.totalCount}
						myId={community.myId}
					/>
				</div>
			</div>
		</section>
	);
};

export default Community;
