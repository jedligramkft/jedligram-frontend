import { useState, useEffect, useCallback } from "react";

const useProfileData = () => {
    const profileStorageKey = "jedligram_profile";
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [bio, setBio] = useState<string>("");
    const [joinedThreadIds, setJoinedThreadIds] = useState<number[]>([]);
    const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");
    const [lastSavedAt, setLastSavedAt] = useState<string>("");

    const loadFromStorage = useCallback(() => {
        try {
            const raw = localStorage.getItem(profileStorageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                setUsername(parsed.username || "");
                setEmail(parsed.email || "");
                setBio(parsed.bio || "");
                setJoinedThreadIds(Array.isArray(parsed.joinedThreadIds) ? parsed.joinedThreadIds : []);
                setProfilePictureUrl(parsed.profilePictureUrl || "");
                setLastSavedAt(parsed.lastSavedAt || "");
            }
        } catch (err) {
            console.error("Failed to parse profile data from localStorage:", err);
        }
    }, []);

    useEffect(() => {
        loadFromStorage();
        window.addEventListener("storage", loadFromStorage);
        window.addEventListener("joined-threads-changed", loadFromStorage);
        return () => {
            window.removeEventListener("storage", loadFromStorage);
            window.removeEventListener("joined-threads-changed", loadFromStorage);
        };
    }, [loadFromStorage]);

    const saveData = useCallback((data: { username: string; email: string; bio: string; }) => {
        const errors: string[] = [];
        if (!data.username.trim()) errors.push("A felhasználónév nem lehet üres!");
        if (!data.email.trim()) errors.push("Az email cím nem lehet üres!");
        else if (!data.email.includes("@")) errors.push("Az email formátuma nem megfelelő.");

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
            localStorage.setItem(profileStorageKey, JSON.stringify(updatedProfile));
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
    }, []);
    
    const updateProfilePicture = useCallback((url: string) => {
        try {
            const raw = localStorage.getItem(profileStorageKey);
            const existing = raw ? JSON.parse(raw) : {};
            const updatedProfile = { ...existing, profilePictureUrl: url };
            localStorage.setItem(profileStorageKey, JSON.stringify(updatedProfile));
            setProfilePictureUrl(url);
        } catch (err) {
            console.error("Failed to update profile picture URL in localStorage:", err);
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
        setBio
    };
};

export default useProfileData;
