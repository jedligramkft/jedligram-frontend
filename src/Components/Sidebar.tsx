import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DynamicFAIcon from "./Utils/DynamicFaIcon";
import { PopularIcon } from "./CustomIcons/PopularIcon";

interface SidebarProps {
	closeSidebar: () => void;
	isSidebarOpen: boolean;
	isLoggedIn: boolean;
}

type RecentThreadItem = {
	id: number;
	name?: string;
};

type JoinedThreadItem = {
	id: number;
	name?: string;
};

interface SidebarCardProps {
	title: string;
	subtitle?: string;
	to: string;
	onClick?: () => void;
	icon?: React.ReactNode;
}

const SidebarCard = ({
	title,
	subtitle,
	to,
	onClick,
	icon,
}: SidebarCardProps) => {
	return (
		<Link
			to={to}
			onClick={() => onClick?.()}
			className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 transition hover:bg-white/10`}
		>
			<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-600 text-sm">
				{icon}
			</div>
			<div className="min-w-0">
				<p className="truncate text-sm font-semibold">{title}</p>
				<p className="text-xs text-white/60">{subtitle}</p>
			</div>
		</Link>
	);
};

const Sidebar = ({ closeSidebar, isSidebarOpen, isLoggedIn }: SidebarProps) => {
	// const [activeCommunity, setActiveCommunity] = useState<number | null>(null);
	const [joinedThreadIds, setJoinedThreadIds] = useState<JoinedThreadItem[]>(
		[],
	);
	const [recentThreads, setRecentThreads] = useState<RecentThreadItem[]>([]);

	const loadFromStorage = () => {
		if (!isLoggedIn) {
			setRecentThreads([]);
			setJoinedThreadIds([]);
			return;
		}

		const profileRaw = localStorage.getItem("jedligram_profile");
		try {
			const parsedProfile = profileRaw ? JSON.parse(profileRaw) : {};

			const ids: number[] = Array.isArray(parsedProfile?.joinedThreadIds)
				? parsedProfile.joinedThreadIds.map((x: any) => Number(x))
				: [];

			const joinedThreadsRaw = parsedProfile?.joinedThreads;

			if (
				Array.isArray(joinedThreadsRaw) &&
				joinedThreadsRaw.some(
					(x: any) => x && typeof x === "object" && "id" in x,
				)
			) {
				const threads: JoinedThreadItem[] = joinedThreadsRaw
					.filter((t: any) => t)
					.map((t: any) => ({
						id: Number(t.id),
						name: typeof t.name === "string" ? t.name : undefined,
					}));
				setJoinedThreadIds(threads);
			} else if (
				Array.isArray(joinedThreadsRaw) &&
				joinedThreadsRaw.every((x: any) => typeof x === "string")
			) {
				const names: string[] = joinedThreadsRaw.map((s: string) => s);
				const threads: JoinedThreadItem[] = ids.map((id, idx) => ({
					id,
					name: names[idx],
				}));
				setJoinedThreadIds(threads);
			}
		} catch {
			setJoinedThreadIds([]);
		}

		const recentRaw = localStorage.getItem("jedligram_recent_threads");
		try {
			const parsedRecent = recentRaw ? JSON.parse(recentRaw) : [];
			const cleaned = Array.isArray(parsedRecent)
				? parsedRecent
						.filter((x) => x && typeof x === "object")
						.map((x) => ({
							id: Number(x.id),
							name:
								typeof x.name === "string" ? x.name : undefined,
						}))
				: [];
			setRecentThreads(cleaned.slice(0, 5));
		} catch {
			setRecentThreads([]);
		}
	};

	useEffect(() => {
		loadFromStorage();

		const onJoined = () => loadFromStorage();
		const onRecent = () => loadFromStorage();

		window.addEventListener("joined-threads-changed", onJoined);
		window.addEventListener("recent-threads-changed", onRecent);

		return () => {
			window.removeEventListener("joined-threads-changed", onJoined);
			window.removeEventListener("recent-threads-changed", onRecent);
		};
	}, [isLoggedIn]);

	return (
		<>
			<div
				className={`fixed top-0 left-0 h-screen w-48 md:w-60 z-40 flex flex-col pt-20 pb-4 items-center transform transition-transform duration-300 ease-in-out bg-linear-to-r from-[#1a1d23] to-[#2a2d31] border-r border-gray-700 overflow-y-auto overflow-x-hidden sidebar-scroll ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
			>
				<div className="my-4 w-full px-3 space-y-2">
					<p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
						Főmenü
					</p>
					<SidebarCard
						title="Felfedezés"
						subtitle="Népszerű közösségek"
						icon={<PopularIcon />}
						to="/all-communities"
						onClick={() => {
							closeSidebar();
						}}
					/>
					{isLoggedIn && (
						<>
							<SidebarCard
								title="Közösség létrehozása"
								subtitle="Új közösség indítása"
								icon={
									<DynamicFAIcon
										exportName="faPlus"
										size="lg"
									/>
								}
								to="/create-community"
								onClick={() => {
									closeSidebar();
								}}
							/>
							<SidebarCard
								title="Profil"
								subtitle="Profilom kezelése"
								icon={
									<DynamicFAIcon
										exportName="faUser"
										size="lg"
									/>
								}
								to="/profile"
								onClick={() => {
									closeSidebar();
								}}
							/>
						</>
					)}
				</div>

				<hr className="w-full border-white/10" />

				{isLoggedIn && (
					<>
						{recentThreads.length > 0 && (
							<>
								<div className="my-4 w-full px-3 space-y-2">
									<p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
										Legutóbb megtekintett
									</p>
									{recentThreads.map((t) => (
										<SidebarCard
											key={t.id}
											title={t.name ? t.name : `#${t.id}`}
											icon={`#${t.id}`}
											to={`/communities/${t.id}`}
											onClick={() => {
												closeSidebar();
											}}
										/>
									))}
								</div>
								<hr className="w-full border-white/10" />
							</>
						)}

						{joinedThreadIds.length > 0 ? (
							<>
								<div className="my-4 w-full px-3 space-y-2">
									<p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
										Csatlakozott közösségek
									</p>
									{joinedThreadIds.map((t) => (
										<SidebarCard
											key={t.id}
											title={t.name ? t.name : `#${t.id}`}
											icon={`#${t.id}`}
											to={`/communities/${t.id}`}
											onClick={() => {
												closeSidebar();
											}}
										/>
									))}
								</div>
							</>
						) : (
							<p className="text-center mt-16 px-4 text-white/40">
								Nem vagy egy közösség tagja sem.
							</p>
						)}
					</>
				)}

				{!isLoggedIn && (
					<div className="text-center space-y-4 mt-16 px-4">
						<p className="text-white/40">
							Kérlek, jelentkezz be a további funkciók eléréséhez.
						</p>
						<Link
							to="/auth/login"
							className="keep-white text-white rounded-2xl bg-blue-500 px-6 py-2 font-semibold hover:bg-blue-600 transition"
						>
							Jelentkezz be
						</Link>
					</div>
				)}
			</div>
		</>
	);
};

export default Sidebar;
