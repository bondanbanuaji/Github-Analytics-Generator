import React from "react";
import { motion } from "framer-motion";
import { Star, GitFork, ExternalLink } from "lucide-react";
import type { GitHubRepo } from "../../lib/github";
import { formatNumber, formatDate, getLanguageColor } from "../../lib/utils";

interface RepoCardProps {
    repo: GitHubRepo;
    index: number;
}

export const RepoCard: React.FC<RepoCardProps> = ({ repo, index }) => {
    return (
        <motion.a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            whileHover={{ y: -3 }}
            className="rounded-xl p-5 block group cursor-pointer transition-all duration-300"
            style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                textDecoration: "none",
                boxShadow: "0 2px 8px var(--shadow-color)",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.boxShadow = "0 8px 32px var(--shadow-color), 0 0 0 1px var(--accent-soft)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-primary)";
                e.currentTarget.style.boxShadow = "0 2px 8px var(--shadow-color)";
            }}
        >
            <div className="flex items-start justify-between gap-2 mb-2.5">
                <h4 className="font-bold text-sm truncate group-hover:underline"
                    style={{ color: "var(--accent)" }}>
                    {repo.name}
                </h4>
                <ExternalLink
                    className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--text-muted)" }}
                />
            </div>

            <p className="text-xs mb-4 line-clamp-2 leading-relaxed"
                style={{ color: "var(--text-secondary)", minHeight: "2rem" }}>
                {repo.description || "No description provided"}
            </p>

            {repo.topics && repo.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {repo.topics.slice(0, 3).map((topic) => (
                        <span key={topic}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                            {topic}
                        </span>
                    ))}
                    {repo.topics.length > 3 && (
                        <span className="text-[10px] font-medium px-1"
                            style={{ color: "var(--text-muted)" }}>
                            +{repo.topics.length - 3}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center gap-4 text-[11px]" style={{ color: "var(--text-muted)" }}>
                {repo.language && (
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: getLanguageColor(repo.language) }} />
                        {repo.language}
                    </span>
                )}
                <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {formatNumber(repo.stargazers_count)}
                </span>
                <span className="flex items-center gap-1">
                    <GitFork className="w-3 h-3" />
                    {formatNumber(repo.forks_count)}
                </span>
                <span className="ml-auto text-[10px]">{formatDate(repo.updated_at)}</span>
            </div>
        </motion.a>
    );
};

interface TopReposProps {
    repos: GitHubRepo[];
}

export const TopRepos: React.FC<TopReposProps> = ({ repos }) => {
    if (repos.length === 0) {
        return (
            <div className="rounded-2xl p-6 text-center text-sm"
                style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border-primary)" }}>
                No repositories found
            </div>
        );
    }

    return (
        <div>
            <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-semibold mb-4 uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
            >
                Top Repositories
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {repos.map((repo, index) => (
                    <RepoCard key={repo.id} repo={repo} index={index} />
                ))}
            </div>
        </div>
    );
};
