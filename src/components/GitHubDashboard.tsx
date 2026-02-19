import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, GitCompareArrows, Github, Sparkles, Zap } from "lucide-react";
import { Header } from "./Header";
import { SearchBar } from "./SearchBar";
import { ProfileCard } from "./ProfileCard";
import { StatsCards } from "./StatsCards";
import { LanguageChart } from "./LanguageChart";
import { TopRepos } from "./RepoCard";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { CompareUsers } from "./CompareUsers";
import { ExportPDF } from "./ExportPDF";
import { ErrorDisplay } from "./ErrorDisplay";
import {
    ProfileSkeleton,
    StatsSkeleton,
    ChartSkeleton,
    ReposSkeleton,
    HeatmapSkeleton,
} from "./SkeletonLoader";
import { useGitHubData } from "../hooks/useGitHubData";

type TabType = "dashboard" | "compare";

export const GitHubDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>("dashboard");
    const [searchedUsername, setSearchedUsername] = useState("");
    const { data, loading, error, fetchData, clearData } = useGitHubData();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const userParam = params.get("user");
        if (userParam) {
            setSearchedUsername(userParam);
            fetchData(userParam);
        }
    }, []);

    const handleSearch = useCallback(
        (username: string) => {
            setSearchedUsername(username);
            fetchData(username);
            const url = new URL(window.location.href);
            url.searchParams.set("user", username);
            window.history.pushState({}, "", url.toString());
        },
        [fetchData]
    );

    const handleRetry = () => {
        if (searchedUsername) fetchData(searchedUsername);
    };

    const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
        { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
        { key: "compare", label: "Compare", icon: <GitCompareArrows className="w-4 h-4" /> },
    ];

    return (
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pb-16">
            <Header />

            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center mt-12 mb-16 lg:mt-20 lg:mb-24"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold mb-8"
                    style={{
                        background: "var(--accent-soft)",
                        color: "var(--accent)",
                        border: "1px solid var(--accent-glow)",
                    }}
                >
                    <div className="w-3.5 h-3.5">
                        🔥
                    </div>
                    Created by confidence boba.dev
                </motion.div>

                <h2 className="text-4xl sm:text-5xl md:text-6xl 2xl:text-7xl font-black mb-6 leading-[1.1] tracking-tight">
                    <span className="gradient-text">Discover</span>{" "}
                    <span style={{ color: "var(--text-primary)" }}>GitHub Insights</span>
                </h2>
                <p
                    className="text-sm sm:text-base lg:text-lg 2xl:text-xl max-w-2xl mx-auto mb-10 leading-relaxed opacity-90"
                    style={{ color: "var(--text-secondary)" }}
                >
                    Explore detailed analytics, language distributions, top repositories, and activity patterns for any GitHub profile with our modern, high-performance dashboard.
                </p>

                <SearchBar onSearch={handleSearch} loading={loading} initialValue={searchedUsername} />
            </motion.div>

            {/* Tabs */}
            <div className="flex items-center justify-center gap-1 mb-8 p-1.5 rounded-xl max-w-xs mx-auto"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`tab-pill flex items-center gap-2 flex-1 justify-center ${activeTab === tab.key ? "active" : ""}`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Export inline */}
            {data && activeTab === "dashboard" && (
                <div className="flex justify-end mb-4">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <ExportPDF targetId="dashboard-content" username={searchedUsername} />
                    </motion.div>
                </div>
            )}

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeTab === "dashboard" ? (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        id="dashboard-content"
                    >
                        {loading && (
                            <div className="space-y-8 lg:space-y-12">
                                <ProfileSkeleton />
                                <StatsSkeleton />
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-5">
                                    <ChartSkeleton />
                                    <div className="hidden lg:block"></div>
                                </div>
                                <HeatmapSkeleton />
                                <ReposSkeleton />
                            </div>
                        )}

                        {error && <ErrorDisplay error={error} onRetry={handleRetry} />}

                        {data && data.user && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-8 lg:space-y-12"
                            >
                                <ProfileCard user={data.user} />
                                <StatsCards
                                    totalRepos={data.user.public_repos}
                                    totalStars={data.totalStars}
                                    totalForks={data.totalForks}
                                    followers={data.user.followers}
                                    totalWatchers={data.totalWatchers}
                                    publicGists={data.user.public_gists}
                                />
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                                    <LanguageChart data={data.languageStats} />
                                    {/* Small utility space or blank if needed, but for now we'll put the heatmap below it full width */}
                                </div>
                                <ActivityHeatmap data={data.contributionData} />
                                <TopRepos repos={data.topRepos} />
                            </motion.div>
                        )}

                        {!loading && !error && !data && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-center py-24"
                            >
                                <div
                                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float"
                                    style={{
                                        background: "var(--accent-soft)",
                                        border: "1px solid var(--accent-glow)",
                                    }}
                                >
                                    <Github className="w-10 h-10" style={{ color: "var(--accent)" }} />
                                </div>
                                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                                    Ready to Explore
                                </h3>
                                <p className="text-sm max-w-sm mx-auto mb-6" style={{ color: "var(--text-secondary)" }}>
                                    Search for a GitHub username to view their profile analytics and insights.
                                </p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {["torvalds", "gaearon", "sindresorhus", "tj"].map((name) => (
                                        <button
                                            key={name}
                                            onClick={() => handleSearch(name)}
                                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                                            style={{
                                                background: "var(--bg-card)",
                                                color: "var(--text-secondary)",
                                                border: "1px solid var(--border-primary)",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = "var(--accent)";
                                                e.currentTarget.style.color = "var(--accent)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = "var(--border-primary)";
                                                e.currentTarget.style.color = "var(--text-secondary)";
                                            }}
                                        >
                                            @{name}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="compare"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <CompareUsers />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAQ Section — critical for AI search & rich results */}
            <section className="mt-20 max-w-3xl mx-auto" aria-labelledby="faq-heading">
                <h2
                    id="faq-heading"
                    className="text-2xl sm:text-3xl font-bold text-center mb-10"
                    style={{ color: "var(--text-primary)" }}
                >
                    Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                    {[
                        {
                            q: "What is GitHub Analytics Dashboard?",
                            a: "GitHub Analytics Dashboard is a free, open-source web tool that lets you analyze any GitHub profile. It provides beautiful visualizations of stats, language distributions, contribution heatmaps, and top repositories — all powered by the GitHub REST API.",
                        },
                        {
                            q: "How do I use GitHub Analytics Dashboard?",
                            a: "Simply enter any GitHub username in the search bar and press Enter. The dashboard will instantly fetch and display the user's profile stats, language breakdown, top repositories, and contribution activity in a beautiful visual format.",
                        },
                        {
                            q: "Can I compare two GitHub users side by side?",
                            a: "Yes! Switch to the 'Compare' tab to enter two GitHub usernames and see a side-by-side comparison of their stats, languages, repositories, and contribution patterns.",
                        },
                        {
                            q: "Is GitHub Analytics Dashboard free to use?",
                            a: "Yes, GitHub Analytics Dashboard is completely free and open-source. It uses the public GitHub REST API, so no authentication or payment is required to analyze public GitHub profiles.",
                        },
                        {
                            q: "What data does GitHub Analytics Dashboard show?",
                            a: "The dashboard displays: total repositories, stars, and forks; programming language distribution with interactive charts; a contribution activity heatmap for the past year; top repositories ranked by stars; follower and following counts; and the ability to export results as a PDF.",
                        },
                    ].map((faq, i) => (
                        <details
                            key={i}
                            className="card group"
                            style={{
                                padding: "16px 20px",
                                cursor: "pointer",
                            }}
                        >
                            <summary
                                className="font-semibold text-sm sm:text-base list-none flex items-center justify-between"
                                style={{ color: "var(--text-primary)" }}
                            >
                                {faq.q}
                                <span
                                    className="ml-2 text-lg transition-transform duration-200 group-open:rotate-45"
                                    style={{ color: "var(--accent)" }}
                                >
                                    +
                                </span>
                            </summary>
                            <p
                                className="mt-3 text-sm leading-relaxed"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                {faq.a}
                            </p>
                        </details>
                    ))}
                </div>
            </section>

            {/* About Section — brand authority for AI citation */}
            <section className="mt-16 max-w-2xl mx-auto text-center" aria-labelledby="about-heading">
                <h2
                    id="about-heading"
                    className="text-xl font-bold mb-4"
                    style={{ color: "var(--text-primary)" }}
                >
                    About This Tool
                </h2>
                <p
                    className="text-sm leading-relaxed mb-2"
                    style={{ color: "var(--text-secondary)" }}
                >
                    GitHub Analytics Dashboard is a modern, open-source developer tool created by{" "}
                    <a
                        href="https://github.com/bondanbanuaji"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold"
                        style={{ color: "var(--accent)" }}
                    >
                        boba.dev
                    </a>
                    . Built with Astro, React, and Recharts, it leverages the GitHub REST API to provide
                    real-time analytics for any public GitHub profile — completely free, no login required.
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Last updated: February 2026
                </p>
            </section>

            {/* Footer */}
            <footer
                className="text-center mt-16 pt-8 pb-8 text-xs"
                style={{
                    borderTop: "1px solid var(--border-subtle)",
                    color: "var(--text-muted)",
                }}
                role="contentinfo"
            >
                <p>
                    Built with{" "}
                    <span style={{ color: "var(--accent)" }}>Astro</span> +{" "}
                    <span style={{ color: "var(--purple)" }}>React</span> +{" "}
                    <span style={{ color: "var(--pink)" }}>Recharts</span>
                </p>
                <p className="mt-1 opacity-60">
                    Data from GitHub REST API • Not affiliated with GitHub
                </p>
                <p className="mt-2">
                    <a
                        href="https://github.com/bondanbanuaji/Github-Analytics-Generator"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium"
                        style={{ color: "var(--accent)", opacity: 0.8 }}
                    >
                        ⭐ Star on GitHub
                    </a>
                    <span className="mx-2">•</span>
                    <span>© {new Date().getFullYear()} GitHub Analytics Dashboard</span>
                </p>
            </footer>
        </div>
    );
};
