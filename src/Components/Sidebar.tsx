import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DynamicFAIcon from "./Utils/DynamicFaIcon";
import { PopularIcon } from "./CustomIcons/PopularIcon";
import { GetThreadById } from "../api/threads";
import { useTranslation } from "react-i18next";
import { GetUserThreads } from "../api/users";
import type { ThreadData } from "../Interfaces/ThreadData";
import { IsLoggedIn, Logout } from "../api/auth";
import { DangerButton } from "./Buttons";

interface SidebarProps {
	closeSidebar: () => void;
	isSidebarOpen: boolean;
}

type RecentThreadItem = {
	id: number;
	name?: string;
	image?: string;
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
			className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 transition hover:bg-white/10`}>
			<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-600 text-sm overflow-hidden">
				{typeof icon === "string" && icon.startsWith("http") ? (
					<img src={icon} alt={title} className="h-full w-full object-cover" />
				) : (
					icon
				)}
			</div>
			<div className="min-w-0">
				<p className="truncate text-sm font-semibold">{title}</p>
				<p className="text-xs text-white/60">{subtitle}</p>
			</div>
		</Link>
	);
};

const Sidebar = ({ closeSidebar, isSidebarOpen }: SidebarProps) => {
	const profileStorageKey =
		import.meta.env.VITE_LOCAL_STORAGE_PROFILE_KEY ?? "jedligram_profile";

	const navigate = useNavigate();
	// const [activeCommunity, setActiveCommunity] = useState<number | null>(null);
	const [recentThreads, setRecentThreads] = useState<RecentThreadItem[]>([]);
	const [joinedThreads, setJoinedThreads] = useState<ThreadData[]>([]);

	const { t } = useTranslation();
	const isLoggedIn = IsLoggedIn();

	const loadFromStorage = () => {
		if (!isLoggedIn) {
			setRecentThreads([]);
			return;
		}

		const recentRaw = localStorage.getItem("jedligram_recent_threads");
		try {
			const parsedRecent = recentRaw ? JSON.parse(recentRaw) : [];
			const cleaned = Array.isArray(parsedRecent)
				? parsedRecent
						.filter((x) => x && typeof x === "object")
						.map((x) => ({
							id: Number(x.id),
							name: typeof x.name === "string" ? x.name : undefined,
							image: typeof x.image === "string" ? x.image : undefined,
						}))
				: [];
			setRecentThreads(cleaned.slice(0, 5));
		} catch {
			setRecentThreads([]);
		}
	};

	const [userId, setUserId] = useState<number>(-1);

	const getJoinedThreads = async () => {
		const response = await GetUserThreads(userId);
		setJoinedThreads(Array.isArray(response.data) ? response.data : []);
	};

	useEffect(() => {
		if (isLoggedIn && userId !== -1) {
			window.addEventListener("joined-threads-changed", getJoinedThreads);

			getJoinedThreads();
		}

		return () => {
			window.removeEventListener("joined-threads-changed", getJoinedThreads);
		};
	}, [isLoggedIn, userId]);

	useEffect(() => {
		loadFromStorage();

		setUserId(
			JSON.parse(localStorage.getItem(profileStorageKey) || "null")?.id ?? -1,
		);

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
				className={`fixed top-0 left-0 h-screen w-48 md:w-60 z-60 flex flex-col pt-20 pb-4 items-center transform transition-transform duration-300 ease-in-out bg-linear-to-r from-[#1a1d23] to-[#2a2d31] border-r border-gray-700 overflow-y-auto overflow-x-hidden sidebar-scroll ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
				<div className="my-4 w-full px-3 space-y-2">
					<p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
						{t("sidebar.menus.main")}
					</p>
					<SidebarCard
						title={t("sidebar.menus.main_buttons.explore")}
						subtitle={t("sidebar.menus.main_buttons.popular_communities")}
						icon={<PopularIcon />}
						to="/all-communities"
						onClick={() => {
							closeSidebar();
						}}
					/>
					{isLoggedIn && (
						<>
							<SidebarCard
								title={t("sidebar.menus.main_buttons.create_community")}
								subtitle={t("sidebar.menus.main_buttons.start_new_community")}
								icon={<DynamicFAIcon exportName="faPlus" size="lg" />}
								to="/create-community"
								onClick={() => {
									closeSidebar();
								}}
							/>
							<SidebarCard
								title={t("sidebar.menus.main_buttons.profile")}
								subtitle={t("sidebar.menus.main_buttons.manage_profile")}
								icon={<DynamicFAIcon exportName="faUser" size="lg" />}
								to={
									isLoggedIn && userId !== -1
										? `/users/${userId}`
										: "/auth/login"
								}
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
										{t("sidebar.menus.recently_viewed")}
									</p>
									{recentThreads.slice(0, 5).map((t) => (
										<SidebarCard
											key={t.id}
											title={t.name ? t.name : `#${t.id}`}
											icon={t.image || `#${t.id}`}
											to={`/communities/${t.id}`}
											onClick={async () => {
												closeSidebar();
												try {
													const res = await GetThreadById(t.id);
													if (res.status === 200) {
														navigate(`/communities/${t.id}`);
													}
												} catch {
													navigate(`/deleted-community`);
												}
											}}
										/>
									))}
								</div>
								<hr className="w-full border-white/10" />
							</>
						)}

						{joinedThreads.length > 0 ? (
							<>
								<div className="my-4 w-full px-3 space-y-2">
									<p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
										{t("sidebar.menus.joined")}
									</p>
									{joinedThreads.slice(0, 5).map((t) => (
										<SidebarCard
											key={t.id}
											title={t.name ? t.name : `#${t.id}`}
											icon={t.image || `#${t.id}`}
											to={`/communities/${t.id}`}
											onClick={() => {
												closeSidebar();
											}}
										/>
									))}
								</div>
								<hr className="w-full border-white/10" />
							</>
						) : (
							<p className="text-center my-10 px-4 text-white/40">
								{t("sidebar.menus.no_joined_threads")}
							</p>
						)}

						<hr className="w-full border-white/10" />

						<div className="w-full px-3 py-2 mt-2">
							{isLoggedIn && (
								<DangerButton
									onClick={() => {
										Logout().then(() => {
											window.location.href = "/";
										});
									}}
									className="w-full">
									{t("sidebar.menus.logout")}
								</DangerButton>
							)}
						</div>
					</>
				)}

				{!isLoggedIn && (
					<div className="text-center space-y-4 mt-16 px-4">
						<p className="text-white/40">{t("sidebar.menus.not_logged_in")}</p>
						<Link
							to="/auth/login"
							className="keep-white text-white rounded-2xl bg-blue-500 px-6 py-2 font-semibold hover:bg-blue-600 transition">
							{t("sidebar.menus.login_btn")}
						</Link>
					</div>
				)}
			</div>
		</>
	);
};

export default Sidebar;
