import { useEffect, useState } from "react";
import DynamicFAIcon from "../../../../Components/Utils/DynamicFaIcon";
import { GhostButton } from "../../../../Components/Buttons";
import { VoteOnPost } from "../../../../api/vote";

const VoteComponent = ({
	id,
	startScore,
	myVote,
}: {
	id: number;
	startScore: number;
	myVote: boolean | null;
}) => {
	const [myLocalVote, setMyLocalVote] = useState<boolean | null>(null); // The vote that I personally have on this post. 1=up, -1=down, null=no vote
	const [clientVoteCount, setClientVoteCount] = useState(startScore || 0); // The current vote count for this post, as tracked by the client. This starts at the value provided by the server, but is then updated optimistically whenever I vote, so that the UI can reflect my vote immediately without a refetch.
	const [isLoading, setIsLoading] = useState(true); // Whether we are currently loading the user's vote from the server.

	useEffect(() => {
		async function load() {
			setIsLoading(true);

			setMyLocalVote(myVote);
			if (myVote === true) {
				setClientVoteCount(clientVoteCount - 1);
			} else if (myVote === false) {
				setClientVoteCount(clientVoteCount + 1);
			}

			setIsLoading(false);
		}
		load();
	}, [myVote]);

	async function HandleVote(postId: number, isUpvote: boolean) {
		const response = await VoteOnPost(postId, isUpvote);
		if (response.status === 201) {
			if (response.data.is_upvote === true) {
				setMyLocalVote(true);
			} else if (response.data.is_upvote === false) {
				setMyLocalVote(false);
			}
		} else if (response.status === 204) {
			setMyLocalVote(null);
		}
	}

	return (
		<div className="bg-white/10 flex items-center gap-2 p-1 rounded-xl">
			{isLoading ? (
				<DynamicFAIcon exportName="faSpinner" className="animate-spin" />
			) : (
				<>
					<GhostButton
						onClick={() => {
							HandleVote(id, true);
						}}
						className="h-full px-0.5 rounded-lg"
						style={{
							backgroundColor: myLocalVote === true ? "green" : "transparent",
						}}>
						<DynamicFAIcon exportName="faAngleUp" />
					</GhostButton>
					<span>
						{clientVoteCount +
							(myLocalVote ? 1 : myLocalVote === false ? -1 : 0)}
					</span>
					<GhostButton
						onClick={() => {
							HandleVote(id, false);
						}}
						className="h-full px-0.5 rounded-lg"
						style={{
							backgroundColor: myLocalVote === false ? "red" : "transparent",
						}}>
						<DynamicFAIcon exportName="faAngleDown" />
					</GhostButton>
				</>
			)}
		</div>
	);
};

export default VoteComponent;
