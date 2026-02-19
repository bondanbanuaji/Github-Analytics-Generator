import React, { useState, useEffect, useRef } from "react";
import { Search, X, Clock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
    onSearch: (username: string) => void;
    loading: boolean;
    initialValue?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    loading,
    initialValue = "",
}) => {
    const [query, setQuery] = useState(initialValue);
    const [focused, setFocused] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem("gh-recent-searches");
        if (saved) setRecentSearches(JSON.parse(saved));
    }, []);

    useEffect(() => {
        if (initialValue) setQuery(initialValue);
    }, [initialValue]);

    const handleSearch = (username?: string) => {
        const searchTerm = (username || query).trim();
        if (!searchTerm || loading) return;
        const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem("gh-recent-searches", JSON.stringify(updated));
        onSearch(searchTerm);
        setFocused(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch();
    };

    const clearSearch = () => {
        setQuery("");
        inputRef.current?.focus();
    };

    const removeRecent = (e: React.MouseEvent, username: string) => {
        e.stopPropagation();
        const updated = recentSearches.filter((s) => s !== username);
        setRecentSearches(updated);
        localStorage.setItem("gh-recent-searches", JSON.stringify(updated));
    };

    return (
        <div className="relative w-full max-w-lg lg:max-w-xl mx-auto">
            <motion.div
                animate={focused ? { scale: 1.01 } : { scale: 1 }}
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                    background: "var(--bg-card)",
                    border: `1px solid ${focused ? "var(--accent)" : "var(--border-primary)"}`,
                    boxShadow: focused
                        ? "0 0 0 3px var(--accent-soft), 0 8px 32px var(--shadow-color)"
                        : "0 4px 16px var(--shadow-color)",
                }}
            >
                <div className="flex items-center px-4 sm:px-5 py-2.5 sm:py-3 gap-2 sm:gap-3">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setTimeout(() => setFocused(false), 200)}
                        placeholder="Search GitHub username..."
                        className="flex-1 p-2 bg-transparent border-none outline-none text-sm sm:text-base lg:text-md font-medium min-w-0"
                        style={{
                            color: "var(--text-primary)",
                            fontFamily: "Inter, sans-serif",
                        }}
                    />
                    {query && (
                        <button
                            onClick={clearSearch}
                            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-secondary)]"
                            style={{ color: "var(--text-muted)" }}
                        >
                            <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                        </button>
                    )}
                    <button
                        onClick={() => handleSearch()}
                        disabled={loading || !query.trim()}
                        className="btn-primary py-1.5 px-4 sm:px-5 lg:px-6 rounded-xl flex items-center justify-center gap-2 group disabled:opacity-40 transition-all duration-300"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 animate-spin" />
                        ) : (
                            <>
                                <span className="hidden sm:inline font-bold text-[10px] sm:text-xs lg:text-sm uppercase tracking-wider">Search</span>
                                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110" />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>

            {/* Recent Searches Dropdown */}
            <AnimatePresence>
                {focused && recentSearches.length > 0 && !query && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
                        style={{
                            background: "var(--bg-card)",
                            border: "1px solid var(--border-primary)",
                            boxShadow: "0 12px 40px var(--shadow-color)",
                        }}
                    >
                        <div
                            className="px-4 py-2.5 border-b text-[11px] font-semibold uppercase tracking-wider"
                            style={{ borderColor: "var(--border-primary)", color: "var(--text-muted)" }}
                        >
                            Recent
                        </div>
                        {recentSearches.map((username) => (
                            <button
                                key={username}
                                onClick={() => {
                                    setQuery(username);
                                    handleSearch(username);
                                }}
                                className="w-full px-4 py-3 flex items-center gap-3 transition-colors group"
                                style={{ color: "var(--text-primary)" }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background = "var(--accent-soft)")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = "transparent")
                                }
                            >
                                <Clock className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                                <span className="flex-1 text-left text-sm font-medium">{username}</span>
                                <X
                                    className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ color: "var(--text-muted)" }}
                                    onClick={(e) => removeRecent(e, username)}
                                />
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
