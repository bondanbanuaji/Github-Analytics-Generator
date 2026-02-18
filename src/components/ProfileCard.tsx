import React from "react";
import { motion } from "framer-motion";
import {
    MapPin,
    Building2,
    Link as LinkIcon,
    Calendar,
    Users,
    ExternalLink,
} from "lucide-react";
import type { GitHubUser } from "../lib/github";
import { formatDate, formatNumber } from "../lib/utils";

interface ProfileCardProps {
    user: GitHubUser;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-6 md:p-8 glow-hover"
            style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                boxShadow: "0 4px 24px var(--shadow-color)",
            }}
        >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar */}
                <div className="relative group">
                    <motion.div
                        className="absolute inset-0 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"
                        style={{ background: "linear-gradient(135deg, var(--accent), var(--purple))" }}
                    />
                    <motion.img
                        whileHover={{ scale: 1.05 }}
                        src={user.avatar_url}
                        alt={`${user.login}'s avatar`}
                        className="w-28 h-28 rounded-2xl relative z-10 object-cover"
                        style={{ border: "3px solid var(--border-primary)" }}
                    />
                    <div
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 z-20 flex items-center justify-center"
                        style={{
                            background: "var(--success)",
                            borderColor: "var(--bg-card)",
                        }}
                    >
                        <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                            {user.name || user.login}
                        </h2>
                        <a
                            href={user.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all hover:opacity-80"
                            style={{
                                background: "var(--accent-soft)",
                                color: "var(--accent)",
                            }}
                        >
                            @{user.login}
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    {user.bio && (
                        <p
                            className="text-sm mb-4 max-w-lg leading-relaxed"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            {user.bio}
                        </p>
                    )}

                    {/* Meta info */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2 text-sm mb-4">
                        {user.company && (
                            <span className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                                <Building2 className="w-3.5 h-3.5" />
                                {user.company}
                            </span>
                        )}
                        {user.location && (
                            <span className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                                <MapPin className="w-3.5 h-3.5" />
                                {user.location}
                            </span>
                        )}
                        {user.blog && (
                            <a
                                href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 hover:underline"
                                style={{ color: "var(--accent)" }}
                            >
                                <LinkIcon className="w-3.5 h-3.5" />
                                {user.blog.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                            </a>
                        )}
                        <span className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                            <Calendar className="w-3.5 h-3.5" />
                            Joined {formatDate(user.created_at)}
                        </span>
                    </div>

                    {/* Followers / Following */}
                    <div className="flex justify-center sm:justify-start gap-5">
                        <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                            <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                                {formatNumber(user.followers)}
                            </span>
                            <span style={{ color: "var(--text-muted)" }} className="text-xs">
                                followers
                            </span>
                        </div>
                        <div className="w-px h-4" style={{ background: "var(--border-primary)" }} />
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                                {formatNumber(user.following)}
                            </span>
                            <span style={{ color: "var(--text-muted)" }} className="text-xs">
                                following
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
