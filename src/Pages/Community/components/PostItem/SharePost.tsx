import DynamicFAIcon from "../../../../Components/Utils/DynamicFaIcon";

const SharePost = ({
	postId,
	communityId,
}: {
	postId: number;
	communityId: number;
}) => {
	async function handleShare() {
		try {
			const inviteUrl = new URL(
				`/communities/${communityId}#${postId}`,
				window.location.origin,
			).toString();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			await (navigator as any).share({ url: inviteUrl });
			return;
		} catch (err) {
			console.error("Error sharing post:", err);
		}
	}

	return (
		<button
			className="text-white/75 hover:text-white text-sm transition-colors"
			onClick={handleShare}
		>
			<DynamicFAIcon exportName="faShare" /> Share
		</button>
	);
};

export default SharePost;
