import { GhostButton, SecondaryButton } from "../../../../Components/Buttons";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DynamicFAIcon from "../../../../Components/Utils/DynamicFaIcon";
import type { CommunityMembers } from "../../hooks/useCommunity";

const RoleTranslationKeyMapping: Record<number, string> = {
	1: "community.members_list.roles.admin",
	2: "community.members_list.roles.moderator",
	3: "community.members_list.roles.member",
	4: "community.members_list.roles.banned",
};

const RoleColorMapping: Record<number, string> = {
	1: "bg-red-700",
	2: "bg-blue-700",
	3: "bg-green-700",
	4: "bg-gray-500",
};

const MembersList = ({
	threadId,
	myId,
	myRank,
	members,
}: {
	threadId: number;
	myId: number | undefined;
	myRank: number | null;
	members: CommunityMembers;
}) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [isActionListOpen, setIsActionListOpen] = useState<number | null>(
		null,
	);
	const skeletonCount =
		members.totalCount > 0
			? Math.max(0, members.totalCount - members.fetchedMembers.length)
			: 5;

	useEffect(() => {
		// setInterval(() => {
		// 	console.log(myRank);
		// }, 200);
		setIsActionListOpen(null); // Close any open action list when threadId changes
	}, [threadId]);

	const handleRoleChange = async (
		e: React.MouseEvent<HTMLButtonElement>,
		userId: number,
		newRoleId: number,
	) => {
		const button = e.currentTarget;
		button.disabled = true;

		try {
			await members.handleRoleChange(userId, newRoleId); // Role update is handled inside the hook, which updates the local state accordingly
		} finally {
			button.disabled = false;
			setIsActionListOpen(null);
		}
	};

	async function handleBanUser(
		e: React.MouseEvent<HTMLButtonElement>,
		userId: number,
	) {
		const button = e.currentTarget;
		button.disabled = true;

		try {
			await members.handleBanAndUnban(userId, true); // Ban action is handled inside the hook, which updates the local state accordingly
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
			await members.handleBanAndUnban(userId, false); // Unban action is handled inside the hook, which updates the local state accordingly
		} finally {
			button.disabled = false;
			setIsActionListOpen(null);
		}
	}

	return (
		<>
			{!members.isLoading && members.totalCount === 0 ? (
				<div className="text-sm text-white/70">
					{t("community.community_sidebar.no_members")}
				</div>
			) : (
				members.fetchedMembers.map((user) => (
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
									{t("community.members_list.view_profile")}
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
												{t(
													"community.members_list.promote",
												)}
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
												{t(
													"community.members_list.demote",
												)}
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
												{t(
													"community.members_list.ban",
												)}
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
												{t(
													"community.members_list.unban",
												)}
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
								className={`text-xs ml-1 py-0.5 px-2 rounded-full ${RoleColorMapping[user.role_id!]}`}
							>
								{t(
									RoleTranslationKeyMapping[
										user.role_id ?? 3
									],
								)}
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

			{members.isLoading && (
				<>
					{Array.from({ length: skeletonCount }).map((_, index) => (
						<div
							key={`member-skeleton-${index}`}
							className={`flex items-center gap-3 *:bg-white/10 animate-pulse`}
							style={{
								animationDelay: `${index * 200}ms`,
							}}
						>
							<div className="h-8 w-8 rounded-full" />
							<div className="h-4 w-30 rounded-lg" />
							<div className="h-8 w-14 rounded-xl ml-auto" />
						</div>
					))}
				</>
			)}

			{members.hasMore && !members.isLoading && (
				<SecondaryButton
					onClick={members.fetchMoreMembers}
					className="px-4 py-2 mt-2"
				>
					{t("community.members_list.load_more_members")}
				</SecondaryButton>
			)}
		</>
	);
};

export default MembersList;
