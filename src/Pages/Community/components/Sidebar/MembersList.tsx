import { GhostButton, SecondaryButton } from "../../../../Components/Buttons";
import type { UserData } from "../../../../Interfaces/UserData";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DynamicFAIcon from "../../../../Components/Utils/DynamicFaIcon";
import {
	BanUserFromThread,
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

const profileKey = import.meta.env.VITE_LOCAL_STORAGE_PROFILE_KEY;

const MembersList = ({
	joinedMembers,
	isLoadingMembers,
	threadId,
}: {
	joinedMembers: UserData[];
	isLoadingMembers: boolean;
	threadId: number;
}) => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [shouldDisplayAllMembers, setShouldDisplayAllMembers] =
		useState(false);

	const [amIAdmin, setAmIAdmin] = useState(false);

	//TODO: A thread lekérésnél adja vissza a usernek a roleját
	//TODO: A rangadás után updatelni a listát, hogy látszódjon a változás új apikérés nélkül
	//TODO: Felnyíló menü a profil gomt helyettm ahol átnavigálhatok a profilra, bannolhatok, vagy rangot állíthatok

	useEffect(() => {
		async function load() {
			const rawProfile = localStorage.getItem(profileKey);
			if (!rawProfile) return;
			const myProfile = joinedMembers.find(
				(member) => member.id === JSON.parse(rawProfile).id,
			);

			if (!myProfile) return;
			const isAdmin = myProfile.role_id === 1; // Check if the user is an admin
			setAmIAdmin(isAdmin);
		}
		load();
	}, [joinedMembers]);

	async function handleRoleChange(userId: number, newRoleId: number) {
		if (newRoleId < 1 || newRoleId > 4) return; // Invalid role, do nothing
		if (newRoleId === 4) {
			const confirmBan = window.confirm(
				t("community.community_sidebar.confirm_ban"),
			);
			if (!confirmBan) return;

			await BanUserFromThread(threadId, userId);
			return;
		}
		await UpdateRoleOfMemberInThread(threadId, userId, newRoleId);
	}

	return (
		<>
			{isLoadingMembers ? (
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
			) : (
				<>
					{joinedMembers.length === 0 ? (
						<div className="text-sm text-white/70">
							{t("community.community_sidebar.no_members")}
						</div>
					) : (
						(shouldDisplayAllMembers
							? joinedMembers
							: joinedMembers.slice(0, 5)
						).map((user) => (
							// Card for each member
							<div
								key={user.id}
								className="flex items-center gap-3"
							>
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
								{amIAdmin && user.role_id! != 1 && (
									<span className="flex gap-2 items-center justify-center *:hover:scale-150 *:cursor-pointer *:px-2">
										{user.role_id! > 2 && (
											<GhostButton
												onClick={() =>
													handleRoleChange(
														user.id,
														user.role_id! - 1,
													)
												}
											>
												<DynamicFAIcon
													exportName="faCaretUp"
													className="text-green-500"
												/>
											</GhostButton>
										)}
										{user.role_id! <= 3 && (
											<GhostButton
												onClick={() =>
													handleRoleChange(
														user.id,
														user.role_id! + 1,
													)
												}
											>
												<DynamicFAIcon
													exportName="faCaretDown"
													className="text-red-500"
												/>
											</GhostButton>
										)}
									</span>
								)}
								<SecondaryButton
									onClick={() =>
										navigate(`/users/${user.id}`)
									}
									className="ml-auto text-xs px-3 py-1.5"
								>
									{t("community.community_sidebar.profile")}
								</SecondaryButton>
							</div>
						))
					)}
					{joinedMembers.length > 5 && !shouldDisplayAllMembers && (
						// Button to show all members if there are more than 5
						<SecondaryButton
							onClick={() => setShouldDisplayAllMembers(true)}
							className="px-4 py-2"
						>
							+{joinedMembers.length - 5}{" "}
							{t("community.community_sidebar.member")}
						</SecondaryButton>
					)}
				</>
			)}
		</>
	);
};

export default MembersList;
