import { useState, useEffect } from 'react';
import { GetThreads } from '../api/threads';
import type { ThreadData } from '../Interfaces/ThreadData';

export const useThreads = () => {
    const [threads, setThreads] = useState<ThreadData[]>([]);

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const response = await GetThreads();
                setThreads(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                const message = (error as any)?.response?.data?.message;
                if (message) {
                    alert(message);
                    return;
                }
                console.error("Error fetching threads:", error);
            }
        };
        fetchThreads();
    }, []);

    return threads;
};
