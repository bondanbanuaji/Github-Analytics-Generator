import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { Search, ArrowRight, ArrowLeftRight, X, Loader2, Users } from "lucide-react";
import {
    fetchUserProfile,
    fetchUserRepos,
    processLanguageStats,
    calculateTotalStats,
    type GitHubUser,
    type GitHubRepo,
    type LanguageStat,
} from "../lib/github";
import { formatNumber } from "../lib/utils";

interface CompareData {
    user: GitHubUser;
    repos: GitHubRepo[];
    totalStars: number;
    totalForks: number;
    totalWatchers: number;
    languageStats: LanguageStat[];
}

export const CompareUsers: React.FC = () => {
    const [username1, setUsername1] = useState("");
    const [username2, setUsername2] = useState("");
    const [user1Data, setUser1Data] = useState<CompareData | null>(null);
    const [user2Data, setUser2Data] = useState<CompareData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCompareData = async (username: string): Promise<CompareData> => {
        const [user, repos] = await Promise.all([
            fetchUserProfile(username),
            fetchUserRepos(username),
        ]);
        const stats = calculateTotalStats(repos);
        const languageStats = processLanguageStats(repos);
        return { user, repos, ...stats, languageStats };
    };

    const handleCompare = async () => {
        if (!username1.trim() || !username2.trim()) return;
        setLoading(true);
        setError(null);

        try {
            const [data1, data2] = await Promise.all([
                fetchCompareData(username1.trim()),
                fetchCompareData(username2.trim()),
            ]);
            setUser1Data(data1);
            setUser2Data(data2);
        } catch (err: any) {
            setError(err.message || "Failed to fetch user data. Please check usernames and try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleCompare();
    };

    const clearComparison = () => {
        setUser1Data(null);
        setUser2Data(null);
        setUsername1("");
        setUsername2("");
        setError(null);
    };

    const statsComparison = user1Data && user2Data
        ? [
            { name: "Repos", [user1Data.user.login]: user1Data.user.public_repos, [user2Data.user.login]: user2Data.user.public_repos },
            { name: "Stars", [user1Data.user.login]: user1Data.totalStars, [user2Data.user.login]: user2Data.totalStars },
            { name: "Forks", [user1Data.user.login]: user1Data.totalForks, [user2Data.user.login]: user2Data.totalForks },
            { name: "Followers", [user1Data.user.login]: user1Data.user.followers, [user2Data.user.login]: user2Data.user.followers },
            { name: "Following", [user1Data.user.login]: user1Data.user.following, [user2Data.user.login]: user2Data.user.following },
        ]
        : [];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 max-w-5xl mx-auto"
        >
            {/* Input Section */}
            <div className="rounded-2xl p-6 md:p-8 text-center"
                style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-primary)",
                    boxShadow: "0 4px 24px var(--shadow-color)",
                }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: "var(--accent-soft)" }}>
                    <Users className="w-6 h-6" style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
                    Compare GitHub Users
                </h3>

                <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
                            style={{ color: "var(--text-muted)" }} />
                        <input
                            type="text"
                            value={username1}
                            onChange={(e) => setUsername1(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="First username..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200"
                            style={{
                                background: "var(--bg-secondary)",
                                border: "1px solid var(--border-primary)",
                                color: "var(--text-primary)",
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = "var(--accent)";
                                e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-soft)";
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = "var(--border-primary)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        />
                    </div>

                    <div className="rounded-full p-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
                        <ArrowLeftRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                    </div>

                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
                            style={{ color: "var(--text-muted)" }} />
                        <input
                            type="text"
                            value={username2}
                            onChange={(e) => setUsername2(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Second username..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200"
                            style={{
                                background: "var(--bg-secondary)",
                                border: "1px solid var(--border-primary)",
                                color: "var(--text-primary)",
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = "var(--purple)";
                                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(168, 85, 247, 0.12)";
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = "var(--border-primary)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        />
                    </div>
                </div>

                <button
                    onClick={handleCompare}
                    disabled={loading || !username1.trim() || !username2.trim()}
                    className="w-full md:w-auto px-8 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                    style={{
                        background: "linear-gradient(135deg, var(--accent), var(--purple))",
                        boxShadow: "0 4px 16px var(--accent-glow)",
                    }}
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            Compare Profiles
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 rounded-lg text-sm flex items-center justify-center gap-2"
                        style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)" }}
                    >
                        <X className="w-4 h-4" />
                        {error}
                    </motion.div>
                )}
            </div>

            {/* Results */}
            <AnimatePresence mode="wait">
                {user1Data && user2Data && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Comparison Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="rounded-2xl p-6 text-center transition-all hover:-translate-y-1"
                                style={{
                                    background: "var(--bg-card)",
                                    border: "1px solid var(--accent)",
                                    boxShadow: "0 8px 32px var(--accent-glow)",
                                }}>
                                <img
                                    src={user1Data.user.avatar_url}
                                    alt={user1Data.user.login}
                                    className="w-24 h-24 rounded-2xl mx-auto mb-4 object-cover"
                                    style={{ border: "4px solid var(--accent-soft)" }}
                                />
                                <h4 className="font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>
                                    {user1Data.user.name || user1Data.user.login}
                                </h4>
                                <p className="text-sm mb-4 font-medium" style={{ color: "var(--accent)" }}>
                                    @{user1Data.user.login}
                                </p>
                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                    <div className="p-2 rounded-lg bg-[var(--bg-secondary)]">
                                        <div className="font-bold text-[var(--text-primary)]">{formatNumber(user1Data.totalStars)}</div>
                                        <div className="text-[var(--text-muted)]">Stars</div>
                                    </div>
                                    <div className="p-2 rounded-lg bg-[var(--bg-secondary)]">
                                        <div className="font-bold text-[var(--text-primary)]">{formatNumber(user1Data.user.followers)}</div>
                                        <div className="text-[var(--text-muted)]">Followers</div>
                                    </div>
                                    <div className="p-2 rounded-lg bg-[var(--bg-secondary)]">
                                        <div className="font-bold text-[var(--text-primary)]">{formatNumber(user1Data.user.public_repos)}</div>
                                        <div className="text-[var(--text-muted)]">Repos</div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl p-6 text-center transition-all hover:-translate-y-1"
                                style={{
                                    background: "var(--bg-card)",
                                    border: "1px solid var(--purple)",
                                    boxShadow: "0 8px 32px rgba(168, 85, 247, 0.25)",
                                }}>
                                <img
                                    src={user2Data.user.avatar_url}
                                    alt={user2Data.user.login}
                                    className="w-24 h-24 rounded-2xl mx-auto mb-4 object-cover"
                                    style={{ border: "4px solid rgba(168, 85, 247, 0.12)" }}
                                />
                                <h4 className="font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>
                                    {user2Data.user.name || user2Data.user.login}
                                </h4>
                                <p className="text-sm mb-4 font-medium" style={{ color: "var(--purple)" }}>
                                    @{user2Data.user.login}
                                </p>
                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                    <div className="p-2 rounded-lg bg-[var(--bg-secondary)]">
                                        <div className="font-bold text-[var(--text-primary)]">{formatNumber(user2Data.totalStars)}</div>
                                        <div className="text-[var(--text-muted)]">Stars</div>
                                    </div>
                                    <div className="p-2 rounded-lg bg-[var(--bg-secondary)]">
                                        <div className="font-bold text-[var(--text-primary)]">{formatNumber(user2Data.user.followers)}</div>
                                        <div className="text-[var(--text-muted)]">Followers</div>
                                    </div>
                                    <div className="p-2 rounded-lg bg-[var(--bg-secondary)]">
                                        <div className="font-bold text-[var(--text-primary)]">{formatNumber(user2Data.user.public_repos)}</div>
                                        <div className="text-[var(--text-muted)]">Repos</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bar Chart */}
                        <div className="rounded-2xl p-6"
                            style={{
                                background: "var(--bg-card)",
                                border: "1px solid var(--border-primary)",
                                boxShadow: "0 4px 24px var(--shadow-color)",
                            }}>
                            <h4 className="text-sm font-bold uppercase tracking-wider mb-6" style={{ color: "var(--text-muted)" }}>
                                Head-to-Head Stats
                            </h4>
                            <div style={{ height: 350 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={statsComparison} barGap={8} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <XAxis dataKey="name" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            cursor={{ fill: "var(--bg-secondary)", opacity: 0.5 }}
                                            contentStyle={{
                                                background: "var(--bg-elevated)",
                                                border: "1px solid var(--border-primary)",
                                                color: "var(--text-primary)",
                                                borderRadius: "12px",
                                                boxShadow: "0 8px 24px var(--shadow-color)",
                                            }}
                                        />
                                        <Bar dataKey={user1Data.user.login} name={user1Data.user.login} fill="var(--accent)" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey={user2Data.user.login} name={user2Data.user.login} fill="var(--purple)" radius={[4, 4, 0, 0]} />
                                        <Legend wrapperStyle={{ paddingTop: "20px" }} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={clearComparison}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-[var(--bg-secondary)]"
                                style={{ color: "var(--text-muted)", border: "1px solid var(--border-primary)" }}
                            >
                                <X className="w-4 h-4" />
                                Clear Comparison
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
