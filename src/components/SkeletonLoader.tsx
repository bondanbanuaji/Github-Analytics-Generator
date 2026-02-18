import React from "react";
import { motion } from "framer-motion";

const shimmer = {
    initial: { opacity: 0.5 },
    animate: { opacity: 1 },
    transition: { duration: 1.5, repeat: Infinity, repeatType: "reverse" as const },
};

const cardStyle = {
    background: "var(--bg-card)",
    border: "1px solid var(--border-primary)",
    borderRadius: "16px",
};

export const ProfileSkeleton: React.FC = () => (
    <div className="p-6 md:p-8" style={cardStyle}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <motion.div {...shimmer} className="skeleton w-28 h-28 rounded-2xl" />
            <div className="flex-1 space-y-3 text-center sm:text-left w-full">
                <motion.div {...shimmer} className="skeleton h-7 w-48 mx-auto sm:mx-0 rounded-lg" />
                <motion.div {...shimmer} className="skeleton h-4 w-64 mx-auto sm:mx-0 rounded-lg" />
                <motion.div {...shimmer} className="skeleton h-4 w-56 mx-auto sm:mx-0 rounded-lg" />
                <div className="flex gap-3 justify-center sm:justify-start">
                    <motion.div {...shimmer} className="skeleton h-4 w-20 rounded-lg" />
                    <motion.div {...shimmer} className="skeleton h-4 w-20 rounded-lg" />
                </div>
            </div>
        </div>
    </div>
);

export const StatsSkeleton: React.FC = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-5 text-center" style={cardStyle}>
                <motion.div {...shimmer} className="skeleton w-10 h-10 rounded-xl mx-auto mb-3" />
                <motion.div {...shimmer} className="skeleton h-6 w-16 mx-auto mb-1 rounded-lg" />
                <motion.div {...shimmer} className="skeleton h-3 w-20 mx-auto rounded-lg" />
            </div>
        ))}
    </div>
);

export const ChartSkeleton: React.FC = () => (
    <div className="p-6" style={cardStyle}>
        <motion.div {...shimmer} className="skeleton h-4 w-40 mb-5 rounded-lg" />
        <div className="flex flex-col lg:flex-row items-center gap-6">
            <motion.div {...shimmer} className="skeleton w-[180px] h-[180px] rounded-full mx-auto" />
            <div className="flex-1 grid grid-cols-2 gap-2 w-full">
                {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div key={i} {...shimmer} className="skeleton h-10 rounded-lg" />
                ))}
            </div>
        </div>
    </div>
);

export const ReposSkeleton: React.FC = () => (
    <div>
        <motion.div {...shimmer} className="skeleton h-4 w-40 mb-4 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-5" style={cardStyle}>
                    <motion.div {...shimmer} className="skeleton h-5 w-32 mb-3 rounded-lg" />
                    <motion.div {...shimmer} className="skeleton h-4 w-full mb-2 rounded-lg" />
                    <motion.div {...shimmer} className="skeleton h-4 w-3/4 mb-4 rounded-lg" />
                    <div className="flex gap-3">
                        <motion.div {...shimmer} className="skeleton h-3 w-16 rounded-lg" />
                        <motion.div {...shimmer} className="skeleton h-3 w-12 rounded-lg" />
                        <motion.div {...shimmer} className="skeleton h-3 w-12 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const HeatmapSkeleton: React.FC = () => (
    <div className="space-y-3">
        <motion.div {...shimmer} className="skeleton h-5 w-64 rounded-lg" />
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 p-6" style={cardStyle}>
                <motion.div {...shimmer} className="skeleton h-[110px] w-full rounded-lg" />
                <div className="flex justify-between mt-4">
                    <motion.div {...shimmer} className="skeleton h-3 w-48 rounded-lg" />
                    <motion.div {...shimmer} className="skeleton h-3 w-32 rounded-lg" />
                </div>
            </div>
            <div className="hidden lg:flex flex-col gap-1 w-28">
                {Array.from({ length: 4 }).map((_, i) => (
                    <motion.div key={i} {...shimmer} className="skeleton h-9 w-full rounded-md" />
                ))}
            </div>
        </div>
    </div>
);
