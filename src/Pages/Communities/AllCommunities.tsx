import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ThreadData } from "../../Interfaces/ThreadData";
import { GetThreads } from "../../api/threads";
import WelcomeBanner from "../../Components/Utils/WelcomeBanner";
import CommunityCardItem from "../../Components/CommunityCard/CommunityCardItem";
import { IsLoggedIn } from "../../api/auth";
import { PrimaryButton } from "../../Components/Buttons";

const AllCommunities = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [threads, setThreads] = useState<ThreadData[]>([]);

	const isLoggedIn = IsLoggedIn();

	useEffect(() => {
		const fetchThreads = async () => {
			try {
				const response = await GetThreads();
				const data = (response.data?.threads ??
					response.data) as unknown;
				setThreads(Array.isArray(data) ? (data as ThreadData[]) : []);
			} catch (error) {
				{
					const message = (error as any)?.response?.data?.message;
					if (message) {
						alert(message);
						return;
					}
				}
				console.error("Error fetching threads:", error);
			}
		};

		fetchThreads();
	}, []);

	return (
		<section className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]" />
			<div className="absolute inset-0 bg-black/30" />
			<div className="container mx-auto px-6 py-12">
				<WelcomeBanner />
				<div className="flex items-center justify-between mb-8">
					<div className="z-10">
						<h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
							{t("allCommunities.title")}
						</h1>
						<p className="mt-2 max-w-2xl text-sm text-white/70">
							{t("allCommunities.description")}
						</p>
						<div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur">
							<span className="text-white/60">
								{t("allCommunities.total")}
							</span>
							<span className="text-white">{threads.length}</span>
							<span className="text-white/60">
								{t("allCommunities.community_count")}
							</span>
						</div>
					</div>
					{isLoggedIn && (
						<PrimaryButton
							onClick={() => navigate("/create-community")}
							className="px-6 py-3 z-10"
						>
							{t("allCommunities.create_button")}
						</PrimaryButton>
					)}
					{!isLoggedIn && (
						<PrimaryButton
							onClick={() => navigate("/auth/login")}
							className="px-6 py-3 z-10"
						>
							{t("allCommunities.login_button")}
						</PrimaryButton>
					)}
				</div>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{threads.map((thread) => {
						return (
							<CommunityCardItem
								key={thread.id}
								threads={[thread]}
							/>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default AllCommunities;
