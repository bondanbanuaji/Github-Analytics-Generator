// GitHub API types
export interface GitHubUser {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
    name: string | null;
    company: string | null;
    blog: string | null;
    location: string | null;
    email: string | null;
    bio: string | null;
    twitter_username: string | null;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
}

export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description: string | null;
    fork: boolean;
    language: string | null;
    stargazers_count: number;
    watchers_count: number;
    forks_count: number;
    open_issues_count: number;
    size: number;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    topics: string[];
    homepage: string | null;
}

export interface GitHubEvent {
    id: string;
    type: string;
    created_at: string;
}

export interface LanguageStat {
    name: string;
    value: number;
    color: string;
    percentage: number;
}

export interface ProcessedStats {
    totalStars: number;
    totalForks: number;
    totalWatchers: number;
    topRepos: GitHubRepo[];
    languageStats: LanguageStat[];
    contributionData: Record<string, number>;
}

export interface GitHubError {
    type: "not_found" | "rate_limit" | "network" | "unknown";
    message: string;
    resetTime?: number;
}

const API_BASE = "https://api.github.com";

async function fetchJSON<T>(url: string): Promise<T> {
    const response = await fetch(url, {
        headers: {
            Accept: "application/vnd.github.v3+json",
        },
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw {
                type: "not_found",
                message: "User not found. Please check the username and try again.",
            } as GitHubError;
        }
        if (response.status === 403) {
            const resetHeader = response.headers.get("X-RateLimit-Reset");
            const resetTime = resetHeader ? parseInt(resetHeader) * 1000 : undefined;
            throw {
                type: "rate_limit",
                message: "API rate limit exceeded. Please wait a moment and try again.",
                resetTime,
            } as GitHubError;
        }
        throw {
            type: "unknown",
            message: `GitHub API error: ${response.status} ${response.statusText}`,
        } as GitHubError;
    }

    return response.json();
}

export async function fetchUserProfile(
    username: string
): Promise<GitHubUser> {
    return fetchJSON<GitHubUser>(`${API_BASE}/users/${encodeURIComponent(username)}`);
}

export async function fetchUserRepos(
    username: string
): Promise<GitHubRepo[]> {
    const allRepos: GitHubRepo[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
        const repos = await fetchJSON<GitHubRepo[]>(
            `${API_BASE}/users/${encodeURIComponent(username)}/repos?per_page=${perPage}&page=${page}&sort=updated`
        );
        allRepos.push(...repos);
        if (repos.length < perPage) break;
        page++;
        if (page > 10) break; // Safety limit
    }

    return allRepos;
}

export async function fetchUserEvents(
    username: string
): Promise<GitHubEvent[]> {
    try {
        const pages = [1, 2, 3];
        const allEvents = await Promise.all(
            pages.map(page =>
                fetchJSON<GitHubEvent[]>(`${API_BASE}/users/${encodeURIComponent(username)}/events?per_page=100&page=${page}`)
            )
        );
        return allEvents.flat();
    } catch {
        return [];
    }
}

import { getLanguageColor } from "./utils";

export function processLanguageStats(repos: GitHubRepo[]): LanguageStat[] {
    const langCount: Record<string, number> = {};
    let total = 0;

    for (const repo of repos) {
        if (repo.language && !repo.fork) {
            langCount[repo.language] = (langCount[repo.language] || 0) + 1;
            total++;
        }
    }

    return Object.entries(langCount)
        .map(([name, value]) => ({
            name,
            value,
            color: getLanguageColor(name),
            percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        }))
        .sort((a, b) => b.value - a.value);
}

export function getTopRepos(repos: GitHubRepo[], count: number = 6): GitHubRepo[] {
    return [...repos]
        .filter((r) => !r.fork)
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, count);
}

export function calculateTotalStats(repos: GitHubRepo[]) {
    return repos.reduce(
        (acc, repo) => ({
            totalStars: acc.totalStars + repo.stargazers_count,
            totalForks: acc.totalForks + repo.forks_count,
            totalWatchers: acc.totalWatchers + repo.watchers_count,
        }),
        { totalStars: 0, totalForks: 0, totalWatchers: 0 }
    );
}

export function processContributionData(
    events: GitHubEvent[]
): Record<string, number> {
    const contributions: Record<string, number> = {};

    // Get today and find the start date (364 days ago)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // We want to show a full year (52 weeks)
    // To make the grid perfect, we should start from the Sunday of the week that was 1 year ago
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);

    // Adjust to previous Sunday to align weeks
    const dayOfWeek = startDate.getDay(); // 0 is Sunday
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const currentDate = new Date(startDate);
    while (currentDate <= today || Object.keys(contributions).length < 371) { // roughly 53 weeks
        const key = currentDate.toISOString().split("T")[0];
        contributions[key] = 0;
        currentDate.setDate(currentDate.getDate() + 1);

        // Safety break if we exceed 1 year + padding significantly
        if (Object.keys(contributions).length > 380) break;
    }

    // Count events per day
    for (const event of events) {
        if (event.created_at) {
            const date = event.created_at.split("T")[0];
            if (contributions[date] !== undefined) {
                contributions[date]++;
            }
        }
    }

    return contributions;
}
