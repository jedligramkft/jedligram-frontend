import DynamicFAIcon from "../../../../Components/Utils/DynamicFaIcon";
import { useTranslation } from "react-i18next";
import { GhostButton } from "../../../../Components/Buttons";

const SharePost = ({
	postId,
	communityId,
}: {
	postId: string;
	communityId: number;
}) => {
	const { t } = useTranslation();

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
		<GhostButton className="gap-1" onClick={handleShare}>
			<DynamicFAIcon exportName="faShare" />
			{t("community.post_item.share")}
		</GhostButton>
	);
};

export default SharePost;
