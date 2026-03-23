import { useState, useEffect, useCallback } from "react";
import { GetUserProfile } from "../api/users";

const useProfileData = () => {
	const profileStorageKey = "jedligram_profile";
	const authTokenName =
		import.meta.env.VITE_AUTH_TOKEN_NAME ?? "jedligram_token";
	const [username, setUsername] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [bio, setBio] = useState<string>("");
	const [joinedThreadIds, setJoinedThreadIds] = useState<number[]>([]);
	const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");
	const [lastSavedAt, setLastSavedAt] = useState<string>("");

	const readStoredProfile = useCallback(() => {
		try {
			const raw = localStorage.getItem(profileStorageKey);
			return raw ? JSON.parse(raw) : {};
		} catch {
			return {};
		}
	}, []);

	const resolveUserId = useCallback((): number | null => {
		const profile = readStoredProfile();
		const rawId = profile?.userId;
		const parsedFromProfile =
			typeof rawId === "number"
				? rawId
				: typeof rawId === "string"
					? Number(rawId)
					: NaN;

		if (Number.isFinite(parsedFromProfile)) {
			return parsedFromProfile;
		}

		const token = localStorage.getItem(authTokenName);
		if (!token) return null;

		try {
			const payloadPart = token.split(".")[1];
			if (!payloadPart) return null;

			const normalized = payloadPart
				.replace(/-/g, "+")
				.replace(/_/g, "/");
			const decoded = atob(normalized);
			const payload = JSON.parse(decoded);
			const rawTokenId =
				payload?.userId ??
				payload?.user_id ??
				payload?.id ??
				payload?.sub;
			const parsedFromToken =
				typeof rawTokenId === "number"
					? rawTokenId
					: typeof rawTokenId === "string"
						? Number(rawTokenId)
						: NaN;

			return Number.isFinite(parsedFromToken) ? parsedFromToken : null;
		} catch {
			return null;
		}
	}, [authTokenName, readStoredProfile]);

	const loadFromStorage = useCallback(() => {
		try {
			const raw = localStorage.getItem(profileStorageKey);
			if (raw) {
				const parsed = JSON.parse(raw);
				setUsername(parsed.username || "");
				setEmail(parsed.email || "");
				setBio(parsed.bio || "");
				setJoinedThreadIds(
					Array.isArray(parsed.joinedThreadIds)
						? parsed.joinedThreadIds
						: [],
				);
				setProfilePictureUrl(parsed.profilePictureUrl || "");
				setLastSavedAt(parsed.lastSavedAt || "");
			}
		} catch (err) {
			console.error(
				"Failed to parse profile data from localStorage:",
				err,
			);
		}
	}, []);

	useEffect(() => {
		loadFromStorage();

		const syncFromBackend = async () => {
			const userId = resolveUserId();
			if (!userId) return;

			try {
				const response = await GetUserProfile(userId);
				const raw = response?.data;
				const user =
					(raw as any)?.user ?? (raw as any)?.data?.user ?? raw ?? {};

				const pickString = (obj: any, keys: string[]): string => {
					for (const key of keys) {
						const value = obj?.[key];
						if (typeof value === "string") return value;
					}
					return "";
				};

				const nextUsername = pickString(user, ["name", "username"]);
				const nextEmail = pickString(user, ["email"]);
				const nextBio = pickString(user, [
					"bio",
					"about",
					"description",
				]);
				const nextProfilePictureUrl = pickString(user, [
					"profilePictureUrl",
					"profile_picture_url",
					"avatar",
					"avatar_url",
					"image",
					"image_url",
					"photo",
					"photo_url",
					"url",
				]);

				const previous = readStoredProfile();
				const merged = {
					...previous,
					userId: previous?.userId ?? userId,
					username: nextUsername || previous?.username || "",
					email: nextEmail || previous?.email || "",
					bio: nextBio || previous?.bio || "",
					profilePictureUrl:
						nextProfilePictureUrl ||
						previous?.profilePictureUrl ||
						"",
				};

				localStorage.setItem(profileStorageKey, JSON.stringify(merged));

				setUsername(merged.username);
				setEmail(merged.email);
				setBio(merged.bio);
				setProfilePictureUrl(merged.profilePictureUrl);
			} catch (err) {
				console.warn("Failed to sync profile data from backend:", err);
			}
		};

		void syncFromBackend();

		window.addEventListener("storage", loadFromStorage);
		window.addEventListener("joined-threads-changed", loadFromStorage);
		return () => {
			window.removeEventListener("storage", loadFromStorage);
			window.removeEventListener(
				"joined-threads-changed",
				loadFromStorage,
			);
		};
	}, [loadFromStorage, readStoredProfile, resolveUserId]);

	const saveData = useCallback(
		(data: { username: string; email: string; bio: string }) => {
			const errors: string[] = [];
			if (!data.username.trim())
				errors.push("A felhasználónév nem lehet üres!");
			if (!data.email.trim()) errors.push("Az email cím nem lehet üres!");
			else if (!data.email.includes("@"))
				errors.push("Az email formátuma nem megfelelő.");

			if (errors.length > 0) {
				alert(errors.join("\n"));
				return false;
			}

			try {
				const raw = localStorage.getItem(profileStorageKey);
				const existing = raw ? JSON.parse(raw) : {};
				const nowIso = new Date().toISOString();
				const updatedProfile = {
					...existing,
					...data,
					lastSavedAt: nowIso,
				};
				localStorage.setItem(
					profileStorageKey,
					JSON.stringify(updatedProfile),
				);
				setLastSavedAt(nowIso);
				setUsername(data.username);
				setEmail(data.email);
				setBio(data.bio);
				return true;
			} catch (err) {
				console.error("Failed to save profile data:", err);
				alert("Hiba történt a mentés során.");
				return false;
			}
		},
		[],
	);

	const updateProfilePicture = useCallback((url: string) => {
		try {
			const raw = localStorage.getItem(profileStorageKey);
			const existing = raw ? JSON.parse(raw) : {};
			const updatedProfile = { ...existing, profilePictureUrl: url };
			localStorage.setItem(
				profileStorageKey,
				JSON.stringify(updatedProfile),
			);
			setProfilePictureUrl(url);
		} catch (err) {
			console.error(
				"Failed to update profile picture URL in localStorage:",
				err,
			);
		}
	}, []);

	return {
		username,
		email,
		bio,
		joinedThreadIds,
		profilePictureUrl,
		lastSavedAt,
		saveData,
		updateProfilePicture,
		setUsername,
		setEmail,
		setBio,
	};
};

export default useProfileData;
