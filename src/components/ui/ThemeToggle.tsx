import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ThemeToggle: React.FC = () => {
    const [theme, setTheme] = useState<"dark" | "light">("dark");

    useEffect(() => {
        const saved = (localStorage.getItem("theme") as "dark" | "light") || "dark";
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
    }, []);

    const toggleTheme = (event: React.MouseEvent) => {
        const next = theme === "dark" ? "light" : "dark";

        // Check for reduced motion preference
        const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // Radial reveal logic using View Transitions API
        if (!document.startViewTransition || isReducedMotion) {
            setTheme(next);
            document.documentElement.setAttribute("data-theme", next);
            localStorage.setItem("theme", next);
            return;
        }

        const x = event.clientX;
        const y = event.clientY;
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        const transition = document.startViewTransition(() => {
            setTheme(next);
            document.documentElement.setAttribute("data-theme", next);
            localStorage.setItem("theme", next);
        });

        transition.ready.then(() => {
            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${endRadius}px at ${x}px ${y}px)`,
                    ],
                },
                {
                    duration: 2000,
                    easing: "cubic-bezier(0.65, 0, 0.35, 1)",
                    pseudoElement: "::view-transition-new(root)",
                }
            );
        });
    };

    return (
        <motion.button
            onClick={toggleTheme}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="group relative w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
            style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
            }}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
            <AnimatePresence mode="wait">
                {theme === "dark" ? (
                    <motion.div
                        key="moon"
                        initial={{ y: -20, opacity: 0, rotate: -90 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: 20, opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Moon className="w-4.5 h-4.5" style={{ color: "var(--accent-hover)" }} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="sun"
                        initial={{ y: -20, opacity: 0, rotate: -90 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: 20, opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Sun className="w-4.5 h-4.5" style={{ color: "var(--warning)" }} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
};
