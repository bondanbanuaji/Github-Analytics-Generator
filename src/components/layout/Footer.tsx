import React from "react";

export const Footer: React.FC = () => {
    return (
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
            <p className="mt-1 opacity-80">
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
    );
};
