import { useEffect, useState } from "react";
import DynamicFAIcon from "../../../../Components/Utils/DynamicFaIcon";
import { MyVoteOnPost, VoteOnPost } from "../../../../api/vote";

const VoteComponent = ({
	id,
	startScore,
}: {
	id: number;
	startScore: number;
}) => {
	const [myVote, setMyVote] = useState<1 | -1 | null>(null); // The vote that I personally have on this post. 1=up, -1=down, null=no vote
	const [clientVoteCount, setClientVoteCount] = useState(startScore || 0); // The current vote count for this post, as tracked by the client. This starts at the value provided by the server, but is then updated optimistically whenever I vote, so that the UI can reflect my vote immediately without a refetch.

	/*
	 If i have already voted, I need to change the total amount of votes fetched from the api
	 to reflect my vote. If i skip this step and dont change the total votes, then the UI will desync from the server
	 after I vote, because the server will return the same total votes as before (since my vote is already included in that total),
	 but my client state will now reflect that I have voted, so the UI will show the wrong total votes (it will look like my vote didnt count, even though it did).
	*/
	async function fetchMyVote() {
		const response = await MyVoteOnPost(id);
		await new Promise((resolve) => setTimeout(resolve, 5000));
		if (response.status === 200 && response.data) {
			if (response.data.is_upvote === true) {
				setMyVote(1);
				setClientVoteCount(clientVoteCount - 1);
			} else if (response.data.is_upvote === false) {
				setMyVote(-1);
				setClientVoteCount(clientVoteCount + 1);
			}
		}
		if (response.status === 404) {
			setMyVote(null);
		}
	}

	async function HandleVote(postId: number, isUpvote: boolean) {
		const response = await VoteOnPost(postId, isUpvote);
		if (response.status === 201) {
			if (response.data.is_upvote) {
				setMyVote(1);
			} else {
				setMyVote(-1);
			}
		} else if (response.status === 204) {
			setMyVote(null);
		}
	}

	useEffect(() => {
		async function load() {
			await fetchMyVote();
		}
		load();
	}, []);

	return (
		// TODO style this component
		<div className="bg-white/10 flex items-center gap-2 px-2 py-1 rounded-xl">
			<button
				onClick={() => {
					HandleVote(id, true);
				}}
				style={{
					backgroundColor: myVote === 1 ? "green" : "transparent",
				}}
			>
				<DynamicFAIcon exportName="faAngleUp" />
			</button>
			<span>{clientVoteCount + (myVote || 0)}</span>
			<button
				onClick={() => {
					HandleVote(id, false);
				}}
				style={{
					backgroundColor: myVote === -1 ? "red" : "transparent",
				}}
			>
				<DynamicFAIcon exportName="faAngleDown" />
			</button>
		</div>
	);
};

export default VoteComponent;
