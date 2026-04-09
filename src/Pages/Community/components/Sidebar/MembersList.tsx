import type { t } from "i18next";
import { SecondaryButton } from "../../../../Components/Buttons";
import type { UserData } from "../../../../Interfaces/UserData";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import DynamicFAIcon from "../../../../Components/Utils/DynamicFaIcon";

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

const MembersList = ({
	joinedMembers,
	isLoadingMembers,
}: {
	joinedMembers: UserData[];
	isLoadingMembers: boolean;
}) => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [shouldDisplayAllMembers, setShouldDisplayAllMembers] =
		useState(false);

	//TODO: Felnyíló menü a profil gomt helyettm ahol átnavigálhatok a profilra, bannolhatok, vagy rangot állíthatok

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
