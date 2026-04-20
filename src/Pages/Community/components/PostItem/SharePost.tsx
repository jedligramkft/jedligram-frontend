import DynamicFAIcon from "../../../../Components/Utils/DynamicFaIcon";
import { useTranslation } from "react-i18next";
import { GhostButton } from "../../../../Components/Buttons";

const SharePost = ({
	postId,
	communityId,
	pageFromEnd,
}: {
	postId: string;
	communityId: number;
	pageFromEnd?: number | null;
}) => {
	const { t } = useTranslation();

	async function handleShare() {
		try {
			const inviteUrl = new URL(
				`/communities/${communityId}`,
				window.location.origin,
			);

			if (
				typeof pageFromEnd === "number" &&
				Number.isFinite(pageFromEnd) &&
				pageFromEnd >= 1
			) {
				inviteUrl.searchParams.set(
					"pfe",
					String(Math.floor(pageFromEnd)),
				);
			}

			inviteUrl.hash = postId;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			await (navigator as any).share({ url: inviteUrl.toString() });
			return;
		} catch (err) {
			console.error("Error sharing post:", err);
		}
	}

	return (
		<GhostButton className="gap-1" onClick={handleShare}>
			<DynamicFAIcon exportName="faShare" />
			<span className="hidden md:inline">
				{t("community.post_item.share")}
			</span>
		</GhostButton>
	);
};

export default SharePost;
