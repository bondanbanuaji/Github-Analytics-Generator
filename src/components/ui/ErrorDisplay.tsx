import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Clock, WifiOff, RefreshCw, UserX } from "lucide-react";
import type { GitHubError } from "../../lib/github";

interface ErrorDisplayProps {
    error: GitHubError;
    onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
    const [countdown, setCountdown] = useState<number | null>(null);

    useEffect(() => {
        if (error.type === "rate_limit" && error.resetTime) {
            const interval = setInterval(() => {
                const remaining = Math.max(0, Math.ceil((error.resetTime! - Date.now()) / 1000));
                setCountdown(remaining);
                if (remaining <= 0) clearInterval(interval);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [error]);

    const getIcon = () => {
        switch (error.type) {
            case "not_found": return <UserX className="w-10 h-10" />;
            case "rate_limit": return <Clock className="w-10 h-10" />;
            case "network": return <WifiOff className="w-10 h-10" />;
            default: return <AlertCircle className="w-10 h-10" />;
        }
    };

    const getTitle = () => {
        switch (error.type) {
            case "not_found": return "User Not Found";
            case "rate_limit": return "Rate Limit Exceeded";
            case "network": return "Connection Error";
            default: return "Something Went Wrong";
        }
    };

    const getColor = () => {
        switch (error.type) {
            case "not_found": return "var(--warning)";
            case "rate_limit": return "var(--danger)";
            case "network": return "var(--text-secondary)";
            default: return "var(--danger)";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-8 md:p-12 text-center max-w-md mx-auto"
            style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                boxShadow: "0 4px 24px var(--shadow-color)",
            }}
        >
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{
                    background: `color-mix(in srgb, ${getColor()} 12%, transparent)`,
                    color: getColor(),
                }}
            >
                {getIcon()}
            </div>

            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                {getTitle()}
            </h3>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {error.message}
            </p>

            {error.type === "rate_limit" && countdown !== null && countdown > 0 && (
                <div className="mb-6">
                    <div className="text-3xl font-bold font-mono mb-1" style={{ color: "var(--danger)" }}>
                        {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        until rate limit resets
                    </p>
                </div>
            )}

            <button
                onClick={onRetry}
                className="btn-primary inline-flex items-center gap-2 text-sm"
            >
                <RefreshCw className="w-4 h-4" />
                Try Again
            </button>
        </motion.div>
    );
};
