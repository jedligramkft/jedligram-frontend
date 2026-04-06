import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { GhostButton } from "../Buttons";

interface WelcomeBannerProps {
	username?: string;
	communityName?: string;
}

const WelcomeBanner = ({ communityName }: WelcomeBannerProps) => {
	const [isVisible, setIsVisible] = useState(false);
	const storageKey = communityName
		? `jedligram_welcome_${communityName}`
		: "jedligram_welcome_shown";
	const { t } = useTranslation();

	useEffect(() => {
		const hasSeenWelcome = localStorage.getItem(storageKey);
		if (!hasSeenWelcome) {
			setIsVisible(true);
		}
	}, [storageKey]);

	const handleDismiss = () => {
		setIsVisible(false);
		localStorage.setItem(storageKey, "true");
	};

	if (!isVisible) return null;

	return (
		<div className="mb-6 overflow-hidden rounded-2xl border border-blue-500/20 bg-linear-to-r from-blue-500/10 to-purple-500/10 p-4 backdrop-blur">
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-start gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
						<span className="text-xl">👋</span>
					</div>
					<div>
						<h3 className="font-semibold text-white">
							{communityName
								? t("welcome_banner.CommunityTitle", {
										communityName,
									})
								: t("welcome_banner.AllCommunitytitle")}
						</h3>
						<p className="mt-1 text-sm text-white/70">
							{communityName
								? t("welcome_banner.CommunityDescription")
								: t("welcome_banner.AllCommunitydescription")}
						</p>
					</div>
				</div>
				<GhostButton
					onClick={handleDismiss}
					className="shrink-0 rounded-lg p-1 px-1 py-1 text-white/50 transition hover:bg-white/10 hover:text-white"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fillRule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clipRule="evenodd"
						/>
					</svg>
				</GhostButton>
			</div>
		</div>
	);
};

export default WelcomeBanner;
