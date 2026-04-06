import { useEffect, useState } from "react";
import DynamicFAIcon from "../../../../Components/Utils/DynamicFaIcon";
import { MyVoteOnPost, VoteOnPost } from "../../../../api/vote";
import { GhostButton } from "../../../../Components/Buttons";

const VoteComponent = ({
	id,
	startScore,
}: {
	id: number;
	startScore: number;
}) => {
	const [myVote, setMyVote] = useState<1 | -1 | null>(null); // The vote that I personally have on this post. 1=up, -1=down, null=no vote
	const [clientVoteCount, setClientVoteCount] = useState(startScore || 0); // The current vote count for this post, as tracked by the client. This starts at the value provided by the server, but is then updated optimistically whenever I vote, so that the UI can reflect my vote immediately without a refetch.
	const [isLoading, setIsLoading] = useState(true); // Whether we are currently loading the user's vote from the server.

	/*
	 If i have already voted, I need to change the total amount of votes fetched from the api
	 to reflect my vote. If i skip this step and dont change the total votes, then the UI will desync from the server
	 after I vote, because the server will return the same total votes as before (since my vote is already included in that total),
	 but my client state will now reflect that I have voted, so the UI will show the wrong total votes (it will look like my vote didnt count, even though it did).
	*/
	async function fetchMyVote() {
		const response = await MyVoteOnPost(id);
		if (response.status === 200 && response.data) {
			if (response.data.is_upvote === true) {
				setMyVote(1);
				setClientVoteCount(clientVoteCount - 1);
			} else if (response.data.is_upvote === false) {
				setMyVote(-1);
				setClientVoteCount(clientVoteCount + 1);
			} else {
				setMyVote(null);
			}
		}
	}

	async function HandleVote(postId: number, isUpvote: boolean) {
		const response = await VoteOnPost(postId, isUpvote);
		if (response.status === 201) {
			if (response.data.is_upvote === true) {
				setMyVote(1);
			} else if (response.data.is_upvote === false) {
				setMyVote(-1);
			}
		} else if (response.status === 204) {
			setMyVote(null);
		}
	}

	useEffect(() => {
		async function load() {
			setIsLoading(true);
			await fetchMyVote();
			setIsLoading(false);
		}
		load();
	}, []);

	return (
		<div className="bg-white/10 flex items-center gap-2 p-1 rounded-xl">
			{isLoading ? (
				<DynamicFAIcon
					exportName="faSpinner"
					className="animate-spin"
				/>
			) : (
				<>
					<GhostButton
						onClick={() => {
							HandleVote(id, true);
						}}
						className="h-full px-0.5 rounded-lg"
						style={{
							backgroundColor:
								myVote === 1 ? "green" : "transparent",
						}}
					>
						<DynamicFAIcon exportName="faAngleUp" />
					</GhostButton>
					<span>{clientVoteCount + (myVote || 0)}</span>
					<GhostButton
						onClick={() => {
							HandleVote(id, false);
						}}
						className="h-full px-0.5 rounded-lg"
						style={{
							backgroundColor:
								myVote === -1 ? "red" : "transparent",
						}}
					>
						<DynamicFAIcon exportName="faAngleDown" />
					</GhostButton>
				</>
			)}
		</div>
	);
};

export default VoteComponent;
