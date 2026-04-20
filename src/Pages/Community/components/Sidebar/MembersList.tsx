import { GhostButton, SecondaryButton } from "../../../../Components/Buttons";
import type { UserData } from "../../../../Interfaces/UserData";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DynamicFAIcon from "../../../../Components/Utils/DynamicFaIcon";
import {
	BanUserFromThread,
	GetThreadMembers,
	UpdateRoleOfMemberInThread,
} from "../../../../api/threads";

const RoleMapping: Record<number, string> = {
	1: "Admin",
	2: "Moderator",
	3: "Member",
	4: "Banned",
};

const RoleColorMapping: Record<number, string> = {
	1: "bg-red-700",
	2: "bg-blue-700",
	3: "bg-green-700",
	4: "bg-gray-500",
};

const profileStorageKey =
	import.meta.env.VITE_PROFILE_STORAGE_KEY || "jedligram_profile";

const MembersList = ({
	threadId,
	myRank,
}: {
	threadId: number;
	myRank: number | null;
}) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [isActionListOpen, setIsActionListOpen] = useState<number | null>(
		null,
	);
	
	const myId = JSON.parse(localStorage.getItem(profileStorageKey) ?? "{}").id;

	const [isLoadingMembers, setIsLoadingMembers] = useState(true);
	const [joinedMembers, setJoinedMembers] = useState<UserData[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);

	const fetchJoinedUsers = async () => {
		setIsLoadingMembers(true);
		try {
			const response = await GetThreadMembers(threadId, currentPage);
			const responseData = response.data as {
				data: UserData[];
			};
			setCurrentPage(currentPage + 1);
			setHasMore(response.data["links"]["next"] !== null);

			return responseData.data;
		} catch (error) {
			console.error("Failed to load members:", error);
		} finally {
			setIsLoadingMembers(false);
		}
	};

	useEffect(() => {
		async function load() {
			setJoinedMembers([]);
			setCurrentPage(1);
			setHasMore(false);
			const users = await fetchJoinedUsers();
			if (users) setJoinedMembers(users);
		}

		load();
	}, [threadId]);

	async function loadMoreMembers(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault();
		const btn = e.currentTarget;
		btn.disabled = true;
		const users = await fetchJoinedUsers();
		if (users) setJoinedMembers((prev) => [...prev, ...users]);
		btn.disabled = false;
	}

	async function handleRoleChange(
		e: React.MouseEvent<HTMLButtonElement>,
		userId: number,
		newRoleId: number,
	) {
		const button = e.currentTarget;
		button.disabled = true;

		try {
			if (newRoleId < 1 || newRoleId > 4) throw new Error("Invalid role"); // Invalid role, do nothing

			const response = await UpdateRoleOfMemberInThread(
				threadId,
				userId,
				newRoleId,
			);
			if (response.status === 200) {
				// Update the local state to reflect the role change
				setJoinedMembers((prevMembers) =>
					prevMembers.map((member) =>
						member.id === userId
							? { ...member, role_id: newRoleId }
							: member,
					),
				);
			}
		} catch (error) {
			console.error("Failed to update role:", error);
		} finally {
			button.disabled = false;
			setIsActionListOpen(null);
		}
	}

	async function handleBanUser(
		e: React.MouseEvent<HTMLButtonElement>,
		userId: number,
	) {
		const button = e.currentTarget;
		button.disabled = true;

		try {
			const confirmBan = window.confirm(
				"Biztosan ki szeretnéd bannolni ezt a felhasználót? Ez a művelet visszavonhatatlan.",
			);
			if (!confirmBan) throw new Error("Ban cancelled by user");

			const response = await BanUserFromThread(threadId, userId);
			if (response.status === 200) {
				// Update the local state to reflect the ban
				setJoinedMembers((prevMembers) =>
					prevMembers.map((member) =>
						member.id === userId
							? { ...member, role_id: 4 } // Set role to Banned
							: member,
					),
				);
			}
		} catch (error) {
			console.error("Failed to ban user:", error);
		} finally {
			button.disabled = false;
			setIsActionListOpen(null);
		}
	}

	async function handleUnbanUser(
		e: React.MouseEvent<HTMLButtonElement>,
		userId: number,
	) {
		const button = e.currentTarget;
		button.disabled = true;

		try {
			const confirmUnban = window.confirm(
				"Biztosan vissza szeretnéd vonni a bannolást ettől a felhasználótól?",
			);
			if (!confirmUnban) throw new Error("Unban cancelled by user");

			const response = await UpdateRoleOfMemberInThread(
				threadId,
				userId,
				3,
			); // Set role to Member
			if (response.status === 200) {
				// Update the local state to reflect the unban
				setJoinedMembers((prevMembers) =>
					prevMembers.map((member) =>
						member.id === userId
							? { ...member, role_id: 3 } // Set role to Member
							: member,
					),
				);
			}
		} catch (error) {
			console.error("Failed to unban user:", error);
		} finally {
			button.disabled = false;
			setIsActionListOpen(null);
		}
	}

	return (
		<>
			{!isLoadingMembers && joinedMembers.length === 0 ? (
				<div className="text-sm text-white/70">
					{t("community.community_sidebar.no_members")}
				</div>
			) : (
				joinedMembers.map((user) => (
					// Card for each member
					<div
						key={user.id}
						className="relative flex items-center gap-3 overflow-visible"
					>
						{/* {isActionListOpen === user.id && <ActionBar />} */}
						{isActionListOpen === user.id && (
							<div className="absolute right-5 bottom-full z-50 mt-2 flex min-w-56 flex-col items-start justify-center gap-1 rounded-lg rounded-br-none bg-neutral-700 p-2 shadow-md border border-neutral-600 *:w-full *:text-sm">
								<GhostButton
									onClick={() =>
										navigate(`/users/${user.id}`)
									}
									className="px-3 py-1.5"
								>
									Profil megtekintése
								</GhostButton>

								{/* PROMOTE és DEMOTE gombok */}
								{myRank &&
									myRank === 1 && //Admin vagyok
									user.role_id! !== 1 && // A user nem admin
									user.role_id! !== 4 && ( //A user rangja kisebb mint admin
										<>
											<hr className="text-gray-400/20" />
											<GhostButton
												onClick={(e) =>
													handleRoleChange(
														e,
														user.id,
														user.role_id! - 1,
													)
												}
												className="px-3 py-1.5"
											>
												Előléptetés
											</GhostButton>
										</>
									)}

								{myRank &&
									user.role_id! <= 2 &&
									user.role_id! > myRank &&
									user.id !== myId && (
										<>
											<hr className="text-gray-400/20" />
											<GhostButton
												onClick={(e) =>
													handleRoleChange(
														e,
														user.id,
														user.role_id! + 1,
													)
												}
												className="px-3 py-1.5"
											>
												Lefokozás
											</GhostButton>
										</>
									)}

								{/* BAN és UNBAN gombok */}

								{myRank && //Van rangom
									myRank <= 2 && //Admin vagy moderátor vagyok
									user.role_id! !== 4 && //A user nincs bannolva
									user.role_id! > myRank && //A user rangja alacsonyabb mint az enyém
									user.id !== myId && ( //Nem én vagyok
										<>
											<hr className="text-gray-400/20" />
											<GhostButton
												className="text-red-400 hover:text-red-500 hover:font-bold transition-all px-3 py-1.5"
												onClick={(e) =>
													handleBanUser(e, user.id)
												}
											>
												Kitiltás
											</GhostButton>
										</>
									)}
								{myRank && //Van rangom
									myRank === 1 && //Admin
									user.role_id! === 4 && //A user bannolva van
									user.id !== myId && ( //Nem én vagyok
										<>
											<hr className="text-gray-400/20" />
											<GhostButton
												className="text-green-400 hover:text-green-500 hover:font-bold transition-all px-3 py-1.5"
												onClick={(e) =>
													handleUnbanUser(e, user.id)
												}
											>
												Kitiltás feloldása
											</GhostButton>
										</>
									)}
							</div>
						)}
						<img
							src={user.image_url}
							alt={user.name}
							loading="lazy"
							decoding="async"
							className="h-8 w-8 rounded-full object-cover"
						/>
						<span className="text-sm text-white/80">
							@{user.name}
							<sup
								className={`text-xs ml-1 py-0.5 px-1 rounded-full ${RoleColorMapping[user.role_id!]}`}
							>
								{RoleMapping[user.role_id!]}
							</sup>
						</span>
						<GhostButton
							className="ml-auto px-3 py-2"
							onClick={() => {
								if (isActionListOpen === user.id) {
									setIsActionListOpen(null);
								} else {
									setIsActionListOpen(user.id);
								}
							}}
						>
							<DynamicFAIcon exportName="faEllipsisVertical" />
						</GhostButton>
					</div>
				))
			)}

			{isLoadingMembers && (
				<>
					{[1, 2, 3, 4, 5].map((i) => (
						<div
							key={i}
							className={`flex items-center gap-3 *:bg-white/10 animate-pulse`}
							style={{
								animationDelay: i * 200 + "ms",
							}}
						>
							<div className="h-8 w-8 rounded-full" />
							<div className="h-4 w-30 rounded-lg" />
							<div className="h-8 w-14 rounded-xl ml-auto" />
						</div>
					))}
				</>
			)}

			{hasMore && !isLoadingMembers && (
				<SecondaryButton
					onClick={loadMoreMembers}
					className="px-4 py-2 mt-2"
				>
					További tagok betöltése
				</SecondaryButton>
			)}
		</>
	);
};

export default MembersList;
