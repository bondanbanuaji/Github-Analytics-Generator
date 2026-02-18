import React from "react";
import { motion } from "framer-motion";
import { Star, GitFork, Eye, BookOpen, Users, FileCode, TrendingUp } from "lucide-react";
import { formatNumber } from "../lib/utils";

interface StatsCardsProps {
    totalRepos: number;
    totalStars: number;
    totalForks: number;
    followers: number;
    totalWatchers: number;
    publicGists: number;
}

const stats = [
    {
        key: "repos",
        label: "Repositories",
        icon: BookOpen,
        gradient: "linear-gradient(135deg, #6366f1, #818cf8)",
        bgLight: "rgba(99, 102, 241, 0.08)",
        iconColor: "#6366f1",
        field: "totalRepos",
    },
    {
        key: "stars",
        label: "Total Stars",
        icon: Star,
        gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
        bgLight: "rgba(245, 158, 11, 0.08)",
        iconColor: "#f59e0b",
        field: "totalStars",
    },
    {
        key: "forks",
        label: "Total Forks",
        icon: GitFork,
        gradient: "linear-gradient(135deg, #22c55e, #4ade80)",
        bgLight: "rgba(34, 197, 94, 0.08)",
        iconColor: "#22c55e",
        field: "totalForks",
    },
    {
        key: "followers",
        label: "Followers",
        icon: Users,
        gradient: "linear-gradient(135deg, #a855f7, #c084fc)",
        bgLight: "rgba(168, 85, 247, 0.08)",
        iconColor: "#a855f7",
        field: "followers",
    },
    {
        key: "watchers",
        label: "Watchers",
        icon: Eye,
        gradient: "linear-gradient(135deg, #ec4899, #f472b6)",
        bgLight: "rgba(236, 72, 153, 0.08)",
        iconColor: "#ec4899",
        field: "totalWatchers",
    },
    {
        key: "gists",
        label: "Public Gists",
        icon: FileCode,
        gradient: "linear-gradient(135deg, #06b6d4, #22d3ee)",
        bgLight: "rgba(6, 182, 212, 0.08)",
        iconColor: "#06b6d4",
        field: "publicGists",
    },
];

export const StatsCards: React.FC<StatsCardsProps> = (props) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                const value = props[stat.field as keyof StatsCardsProps];
                return (
                    <motion.div
                        key={stat.key}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.06 }}
                        className="stat-card text-center group cursor-default"
                        style={{ "--stat-gradient": stat.gradient } as React.CSSProperties}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform duration-300 group-hover:scale-110"
                            style={{ background: stat.bgLight }}
                        >
                            <Icon className="w-5 h-5" style={{ color: stat.iconColor }} />
                        </div>
                        <div className="text-2xl font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>
                            {formatNumber(value)}
                        </div>
                        <div className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
                            {stat.label}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
