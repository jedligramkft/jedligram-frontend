import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ThreadData } from "../../Interfaces/ThreadData";
import { GetThreads } from "../../api/threads";
import WelcomeBanner from "../../Components/Utils/WelcomeBanner";
import CommunityCardItem from "../../Components/CommunityCard/CommunityCardItem";
import { IsLoggedIn } from "../../api/auth";
import { PrimaryButton } from "../../Components/Buttons";
import { toast } from "react-toastify";
import ScreenLoader from "../../Components/Utils/ScreenLoader";

const AllCommunities = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [threads, setThreads] = useState<ThreadData[]>([]);

	const [isLoading, setIsLoading] = useState(true);
	// Ref-based paging avoids stale closure state when scroll callbacks fire rapidly.
	const nextPageRef = useRef(1);

	const isLoggedIn = IsLoggedIn();
	const [hasMore, setHasMore] = useState(false);
	const [totalThreads, setTotalThreads] = useState(0);

	//TODO: Infinite scroll

	const fetchThreads = async () => {
		const pageToFetch = nextPageRef.current;
		setIsLoading(true);
		try {
			const response = await GetThreads(pageToFetch);
			const responseData = response.data as { data: ThreadData[] }; // contains data, links, meta
			nextPageRef.current = pageToFetch + 1;
			setHasMore(response.data["links"]["next"] !== null);
			setTotalThreads(response.data["meta"]["total"] ?? 0);

			return responseData.data;
		} catch (error) {
			{
				const message = (
					error as { response?: { data?: { message?: string } } }
				)?.response?.data?.message;
				if (message) {
					alert(message);
					return;
				}
				toast.error(t("allCommunities.fetch_threads_error"));
			}
			console.error("Error fetching threads:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		async function load() {
			setThreads([]);
			nextPageRef.current = 1;
			setHasMore(false);
			const threads = await fetchThreads();
			if (threads) setThreads(threads);
		}
		load();
	}, []);

	async function loadMoreCommunities() {
		if (!hasMore) {
			return;
		}

		const threads = await fetchThreads();
		if (threads) {
			setThreads((prevThreads) => {
				// Keep a dedupe merge as a defensive guard if API pages overlap.
				const existingThreadIds = new Set(
					prevThreads.map((thread) => thread.id),
				);
				const uniqueIncomingThreads = threads.filter(
					(thread) => !existingThreadIds.has(thread.id),
				);

				return [...prevThreads, ...uniqueIncomingThreads];
			});
		}
	}

	return (
		<section className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]" />
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]" />
			<div className="pointer-events-none absolute inset-0 bg-black/30" />
			<div className="relative container mx-auto px-6 py-12">
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
							<span className="text-white">{totalThreads}</span>
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

				<div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{threads.map((thread) => {
						return (
							<CommunityCardItem
								key={thread.id}
								threads={[thread]}
							/>
						);
					})}
					{isLoading &&
						Array.from({ length: 6 }).map((_, idx) => (
							<div
								key={idx}
								className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur"
							>
								<div className="animate-pulse space-y-4">
									<div className="flex items-center justify-between">
										<div className="h-4 w-24 rounded bg-white/10" />
										<div className="h-6 w-16 rounded-full bg-white/10" />
									</div>
									<div className="h-6 w-3/4 rounded bg-white/10" />
									<div className="h-4 w-full rounded bg-white/10" />
									<div className="h-4 w-5/6 rounded bg-white/10" />
									<div className="mt-6 flex items-center justify-between">
										<div className="h-4 w-20 rounded bg-white/10" />
										<div className="h-9 w-24 rounded-full bg-white/10" />
									</div>
								</div>
							</div>
						))}
				</div>
				{hasMore && <ScreenLoader callback={loadMoreCommunities} />}
			</div>
		</section>
	);
};

export default AllCommunities;
