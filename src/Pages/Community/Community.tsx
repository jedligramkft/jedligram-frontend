import { useParams, useNavigate } from "react-router-dom";
import CommunityHeader from "./components/CommunityHeader";
import CommunitySidebar from "./components/CommunitySidebar";
import PostList from "./components/PostList";
import { useCommunity } from "./hooks/useCommunity";
// import { useComments } from "./hooks/useComments";

interface CommunityProps {
	isLoggedIn: boolean;
}

const Community = ({ isLoggedIn }: CommunityProps) => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const threadId = id ? Number(id) : NaN;

	const community = useCommunity(threadId, id, isLoggedIn, navigate);
	// const comments = useComments(isLoggedIn);

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
						<PostList id={id} isJoined={community.isJoined} />
					</div>
					<CommunitySidebar
						joinedUsers={community.joinedUsers}
						showAllMembers={community.showAllMembers}
						onLoadMore={community.handleLoadMoreUsernames}
						postsCount={community.posts.length}
					/>
				</div>
			</div>
		</section>
	);
};

export default Community;
