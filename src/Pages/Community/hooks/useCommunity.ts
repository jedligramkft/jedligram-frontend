import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { GetThreadById, GetPostsInThread, JoinThread, LeaveThread } from "../../../api/threads";
import { GetUsers, GetUserThreads } from "../../../api/users";
import type { ThreadData } from "../../../Interfaces/ThreadData";
import { VoteOnPost } from "../../../api/posts";
import type { UserData } from "../../../Interfaces/UserData";

type RecentThreadItem = {
  id: number;
  name?: string;
};

export const useCommunity = (threadId: number, id: string | undefined, isLoggedIn: boolean, navigateFn: (path: string, options?: any) => void ) => {
  const [isJoined, setIsJoined] = useState(false);
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [posts, setPosts] = useState<Array<Record<string, unknown>>>([]);
  const [votingPostId, setVotingPostId] = useState<number | null>(null);
  const [joinedUsers, setJoinedUsers] = useState<UserData[]>([]);
  const [showAllMembers, setShowAllMembers] = useState(false);

  const profileKey = "jedligram_profile";
  const recentThreadsStorageKey = "jedligram_recent_threads";

  const readProfile = (): any => {
    try {
      const raw = localStorage.getItem(profileKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const getCurrentUserId = (): number | undefined => {
    const profile = readProfile();
    const userId = profile.id;
    return userId;
  };

  const refreshIsJoined = async () => {
    const userId = getCurrentUserId();

    try {
      const response = await GetUserThreads(userId!);
      const list = response.data;
      const joinedThreadIds = list.map((t: any) => Number(t.id));

      setIsJoined(joinedThreadIds.includes(threadId));
    } catch {
      setIsJoined(false);
    }
  };

  const saveRecentThread = (threadId: number, threadName?: string) => {
    if (!Number.isFinite(threadId)) return;

    try {
      const raw = localStorage.getItem(recentThreadsStorageKey);
      const current: RecentThreadItem[] = raw ? JSON.parse(raw) : [];

      const next: RecentThreadItem[] = [
        { id: threadId, name: threadName?.trim() || undefined },
        ...current.filter((t) => t.id !== threadId),
      ].slice(0, 5);

      localStorage.setItem(recentThreadsStorageKey, JSON.stringify(next));
      window.dispatchEvent(new Event("recent-threads-changed"));
    } catch {
      console.error("Failed to save recent thread.");
    }
  };

  const fetchJoinedUsers = async (threadIdValue: number): Promise<UserData[]> => {
    if (Number.isNaN(threadIdValue)) return [];

    const response = await GetUsers(`thread:${threadIdValue}`);
    const usersData = response.data?.users ?? response.data;

    if (!Array.isArray(usersData)) return [];
    return usersData as UserData[];
  };

  const handleNewPost = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isLoggedIn) return;

    e.preventDefault();
    navigateFn("/auth/login", { replace: true });
  };

  const handleJoin = useCallback(async () => {
    if (!isLoggedIn) {
      navigateFn("/auth/login", { replace: true });
      return;
    }

    if (Number.isNaN(threadId)) return;

    try {
      await JoinThread(threadId);
      setIsJoined(true);
      const users = await fetchJoinedUsers(threadId);
      setJoinedUsers(users);
      setShowAllMembers(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          navigateFn("/auth/login", { replace: true });
          return;
        }
        const message = (err.response?.data as any).message;
        const lower = message.toLowerCase();
        const alreadyMember =
          lower.includes("already") && lower.includes("member");

        if (alreadyMember) {
          setIsJoined(true);
          const users = await fetchJoinedUsers(threadId);
          setJoinedUsers(users);
          setShowAllMembers(false);
          return;
        }

        alert(message ?? "Nem sikerült csatlakozni.");
        return;
      }
    }
  }, [threadId, isLoggedIn, navigateFn, refreshIsJoined]);

  const handleLeave = useCallback(async () => {
    if (!isLoggedIn) {
      navigateFn("/auth/login", { replace: true });
      return;
    }

    if (Number.isNaN(threadId)) return;

    try {
      await LeaveThread(threadId);
      setIsJoined(false);
      setShowAllMembers(false);

      const profile = readProfile();
      const currentUserId = profile.id;
      if (currentUserId) {
        setJoinedUsers((prev) =>
          prev.filter((u) => u.id !== currentUserId),
        );
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          navigateFn("/auth/login", { replace: true });
          return;
        }
        const message = (err.response?.data as any)?.message;
        alert(message ?? "Nem sikerült elhagyni a közösséget.");
        return;
      }
    }
  }, [threadId, isLoggedIn, navigateFn, refreshIsJoined]);

  useEffect(() => {
    void refreshIsJoined();
    window.addEventListener("joined-threads-changed", refreshIsJoined);
    return () => window.removeEventListener("joined-threads-changed", refreshIsJoined);
  }, [refreshIsJoined]);

  useEffect(() => {
    if (!id) return;

    let isCancelled = false;
    const load = async () => {
      setJoinedUsers([]);
      setShowAllMembers(false);
      try {
        const [threadRes, postsRes] = await Promise.all([
          GetThreadById(threadId),
          GetPostsInThread(threadId),
        ]);

        const threadData = (threadRes.data?.thread ??
          threadRes.data) as ThreadData;
        const postsData = postsRes.data?.posts ?? postsRes.data;

        if (!isCancelled) {
          setThread(threadData);
          const postsArray = Array.isArray(postsData)
            ? (postsData as Array<Record<string, unknown>>)
            : [];
          setPosts(postsArray);
          saveRecentThread(threadId, threadData?.name);
        }

        try {
          const users = await fetchJoinedUsers(threadId);
          if (!isCancelled) setJoinedUsers(users);
        } catch (err) {
          console.warn("Nem sikerült betölteni a tagokat.", err);
          if (!isCancelled) setJoinedUsers([]);
        }
      } catch (err) {
        if (isCancelled) return;

        if (
          axios.isAxiosError(err) &&
          err.response?.status === 401
        ) {
          navigateFn("/auth/login", { replace: true });
          return;
        }
      }
    };

    void load();
    return () => {
      isCancelled = true;
    };
  }, [id, isLoggedIn, threadId, navigateFn]);

  const handleVote = useCallback(
    async (postId: number, isUpvote: boolean) => {
      if (!isLoggedIn) {
        navigateFn("/auth/login", { replace: true });
        return;
      }

      if (votingPostId === postId) return;
      setVotingPostId(postId);

      try {
        await VoteOnPost(postId, isUpvote);
        const refreshed = await GetPostsInThread(threadId);
        const refreshedPosts = (refreshed.data?.posts ??
          refreshed.data) as unknown;
        setPosts(
          Array.isArray(refreshedPosts)
            ? (refreshedPosts as Array<Record<string, unknown>>)
            : [],
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Nem sikerült szavazni.";
        alert(message);
      } finally {
        setVotingPostId(null);
      }
    },
    [votingPostId, threadId, isLoggedIn, navigateFn],
  );

  const handleLoadMoreUsernames = () => {
    setShowAllMembers(true);
  };

  const handleInvite = async () => {
    if (Number.isNaN(threadId)) return;

    try {
      const inviteUrl = new URL(`/communities/${threadId}`, window.location.origin).toString();
      await (navigator as any).share({ url: inviteUrl });
      return;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          navigateFn("/auth/login", { replace: true });
          return;
        }
      }
    }
  };

  return {
    thread,
    posts,
    isJoined,
    votingPostId,
    joinedUsers,
    showAllMembers,
    handleNewPost,
    handleJoin,
    handleLeave,
    handleVote,
    handleLoadMoreUsernames,
    handleInvite,
  };
};
