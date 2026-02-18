import { useState, useCallback, useEffect } from "react";
import {
    fetchUserProfile,
    fetchUserRepos,
    fetchUserEvents,
    processLanguageStats,
    getTopRepos,
    calculateTotalStats,
    processContributionData,
    type GitHubUser,
    type GitHubRepo,
    type LanguageStat,
    type GitHubError,
} from "../lib/github";

export interface GitHubData {
    user: GitHubUser | null;
    repos: GitHubRepo[];
    topRepos: GitHubRepo[];
    languageStats: LanguageStat[];
    totalStars: number;
    totalForks: number;
    totalWatchers: number;
    contributionData: Record<string, number>;
}

interface UseGitHubDataReturn {
    data: GitHubData | null;
    loading: boolean;
    error: GitHubError | null;
    fetchData: (username: string) => Promise<void>;
    clearData: () => void;
}

export function useGitHubData(): UseGitHubDataReturn {
    const [data, setData] = useState<GitHubData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<GitHubError | null>(null);

    const fetchData = useCallback(async (username: string) => {
        if (!username.trim()) return;

        // Check cache first
        const cacheKey = `github_data_${username.toLowerCase()}`;
        const cachedData = sessionStorage.getItem(cacheKey);

        if (cachedData) {
            try {
                const parsed = JSON.parse(cachedData);
                setData(parsed);
                setError(null);
                return;
            } catch (e) {
                console.error("Failed to parse cached data", e);
                sessionStorage.removeItem(cacheKey);
            }
        }

        setLoading(true);
        setError(null);
        setData(null);

        try {
            // Parallel fetch
            const [user, repos, events] = await Promise.all([
                fetchUserProfile(username),
                fetchUserRepos(username),
                fetchUserEvents(username),
            ]);

            const topRepos = getTopRepos(repos);
            const languageStats = processLanguageStats(repos);
            const stats = calculateTotalStats(repos);
            const contributionData = processContributionData(events);

            const result: GitHubData = {
                user,
                repos,
                topRepos,
                languageStats,
                ...stats,
                contributionData,
            };

            setData(result);
            // Save to cache
            sessionStorage.setItem(cacheKey, JSON.stringify(result));
        } catch (err: any) {
            if (err.type) {
                setError(err as GitHubError);
            } else {
                setError({
                    type: "network",
                    message: "Network error. Please check your connection and try again.",
                });
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const clearData = useCallback(() => {
        setData(null);
        setError(null);
    }, []);

    return { data, loading, error, fetchData, clearData };
}
