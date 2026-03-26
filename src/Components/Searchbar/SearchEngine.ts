import { useMemo } from "react";
import { useThreads } from "../../hooks/useThreads";
import type { ThreadData } from "../../Interfaces/ThreadData";

export const useFilteredThreads = (query: string) => {
	const threads = useThreads() as ThreadData[];

	return useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		if (!normalizedQuery) return [];

		return threads.filter((thread) => {
			const name = String(thread?.name ?? "").toLowerCase();
			return (
				name.includes(normalizedQuery)
			);
		});
	}, [query, threads]);
};
