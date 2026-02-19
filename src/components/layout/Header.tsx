import React from "react";
import { Github, BarChart3, Sparkles } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { motion } from "framer-motion";

export const Header: React.FC = () => {
    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between py-5"
        >
            <div className="flex items-center gap-3">
                <motion.div
                    whileHover={{ rotate: 8, scale: 1.05 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
                    style={{
                        background: "#ffffff", // Fixed white background
                        border: "1px solid #e2e4e9",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                >
                    <img src="/logo/GitHub.png" alt="GitHub Logo" className="w-6 h-6 object-contain" />
                </motion.div>
                <div>
                    <span className="text-lg font-bold flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                        GitHub Analytics
                    </span>
                    <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
                        Powered by GitHub REST API
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="https://github.com/bondanbanuaji/Github-Analytics-Generator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-primary)",
                        transform: "scale(1.05)",
                    }}
                    title="GitHub"
                    tabIndex={0}
                >
                    <Github className="w-4.5 h-4.5" style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
                </motion.a>
                <ThemeToggle />
            </div>
        </motion.header>
    );
};
