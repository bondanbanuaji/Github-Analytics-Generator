import React, { useState, useMemo, useRef, useEffect } from "react";
import { Info } from "lucide-react";

interface ActivityHeatmapProps {
    data: Record<string, number>;
}

const THEME_COLORS = {
    light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
};

function getLevel(count: number): number {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 6) return 3;
    return 4;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    // Track container width for responsive cell sizing
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });
        ro.observe(el);
        setContainerWidth(el.getBoundingClientRect().width);
        return () => ro.disconnect();
    }, []);

    // Build the 53-week grid
    const { weeks, totalContributions, monthLabels } = useMemo(() => {
        const today = new Date();
        const endDate = new Date(today);
        endDate.setHours(0, 0, 0, 0);

        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 364);
        const dayOfStart = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfStart);

        // weeks[w][d] = { count, level, date }
        const weeksArr: { count: number; level: number; date: string }[][] = [];
        const monthLabelsArr: { weekIndex: number; label: string }[] = [];
        let total = 0;
        let lastMonth = -1;

        for (let w = 0; w < 53; w++) {
            const week: { count: number; level: number; date: string }[] = [];
            for (let d = 0; d < 7; d++) {
                const cur = new Date(startDate);
                cur.setDate(startDate.getDate() + w * 7 + d);
                const dateStr = cur.toISOString().split("T")[0];
                const count = data[dateStr] || 0;
                total += count;
                week.push({ count, level: getLevel(count), date: dateStr });

                if (d === 0) {
                    const m = cur.getMonth();
                    if (m !== lastMonth) {
                        monthLabelsArr.push({
                            weekIndex: w,
                            label: cur.toLocaleString("en-US", { month: "short" }),
                        });
                        lastMonth = m;
                    }
                }
            }
            weeksArr.push(week);
        }

        return { weeks: weeksArr, totalContributions: total, monthLabels: monthLabelsArr };
    }, [data]);

    // Responsive cell size: fit 53 columns + ~24px for day labels into container
    const DAY_LABEL_WIDTH = 28; // px reserved for Mon/Wed/Fri labels
    const GAP = 2; // px gap between cells
    const NUM_WEEKS = 53;

    const cellSize = containerWidth > 0
        ? Math.max(
            3,
            Math.floor((containerWidth - DAY_LABEL_WIDTH - GAP * (NUM_WEEKS - 1)) / NUM_WEEKS)
        )
        : 11; // default before measurement

    const isDark =
        typeof document !== "undefined" &&
        document.documentElement.getAttribute("data-theme") !== "light";
    const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

    // Build month label positions (in px)
    const monthLabelEls = monthLabels.map((ml) => ({
        ...ml,
        left: DAY_LABEL_WIDTH + ml.weekIndex * (cellSize + GAP),
    }));

    const MONTH_LABEL_HEIGHT = 18; // px
    const gridHeight = 7 * cellSize + 6 * GAP;
    const totalHeight = MONTH_LABEL_HEIGHT + gridHeight;

    const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

    return (
        <div className="card p-4 sm:p-6 w-full overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                <h3
                    className="font-bold text-sm sm:text-base lg:text-lg"
                    style={{ color: "var(--text-primary)" }}
                >
                    {totalContributions.toLocaleString()} contributions in the last year
                </h3>
            </div>

            {/* Heatmap grid */}
            <div ref={containerRef} className="w-full overflow-hidden">
                {containerWidth > 0 && (
                    <div
                        style={{
                            position: "relative",
                            width: "100%",
                            height: totalHeight,
                            userSelect: "none",
                        }}
                    >
                        {/* Month labels */}
                        {monthLabelEls.map((ml) => (
                            <span
                                key={ml.weekIndex}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: ml.left,
                                    fontSize: Math.max(8, Math.min(cellSize, 11)),
                                    lineHeight: `${MONTH_LABEL_HEIGHT}px`,
                                    color: isDark ? "#8b949e" : "#57606a",
                                    fontFamily: "Inter, sans-serif",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {ml.label}
                            </span>
                        ))}

                        {/* Day labels + grid */}
                        <div
                            style={{
                                position: "absolute",
                                top: MONTH_LABEL_HEIGHT,
                                left: 0,
                                display: "flex",
                                gap: GAP,
                            }}
                        >
                            {/* Day-of-week labels column */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: GAP,
                                    width: DAY_LABEL_WIDTH,
                                    flexShrink: 0,
                                }}
                            >
                                {DAY_LABELS.map((label, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            height: cellSize,
                                            fontSize: Math.max(7, Math.min(cellSize - 1, 9)),
                                            color: isDark ? "#8b949e" : "#57606a",
                                            fontFamily: "Inter, sans-serif",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "flex-end",
                                            paddingRight: 4,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {label}
                                    </div>
                                ))}
                            </div>

                            {/* Week columns */}
                            {weeks.map((week, wIdx) => (
                                <div
                                    key={wIdx}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: GAP,
                                    }}
                                >
                                    {week.map((cell, dIdx) => (
                                        <div
                                            key={dIdx}
                                            title={
                                                cell.count === 0
                                                    ? `No contributions on ${cell.date}`
                                                    : `${cell.count} contribution${cell.count === 1 ? "" : "s"} on ${cell.date}`
                                            }
                                            style={{
                                                width: cellSize,
                                                height: cellSize,
                                                borderRadius: Math.max(1, Math.floor(cellSize * 0.2)),
                                                backgroundColor: colors[cell.level],
                                                flexShrink: 0,
                                                cursor: "default",
                                                transition: "opacity 0.15s",
                                            }}
                                            onMouseEnter={(e) => {
                                                (e.currentTarget as HTMLDivElement).style.opacity = "0.75";
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.currentTarget as HTMLDivElement).style.opacity = "1";
                                            }}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer legend */}
            <div
                className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 text-[10px] sm:text-xs"
                style={{ color: "var(--text-muted)" }}
            >
                <div className="flex items-center gap-1.5 order-2 sm:order-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="font-medium">Recent activity (GitHub API limit 90 days)</span>
                </div>

                <div
                    className="flex items-center gap-2 order-1 sm:order-2 px-3 py-1.5 rounded-lg border"
                    style={{
                        background: "var(--bg-secondary)",
                        borderColor: "var(--border-subtle)",
                    }}
                >
                    <span className="font-semibold uppercase tracking-tight opacity-70">Less</span>
                    <div className="flex gap-1">
                        {colors.map((color, i) => (
                            <div
                                key={i}
                                title={`Level ${i}`}
                                style={{
                                    backgroundColor: color,
                                    width: 12,
                                    height: 12,
                                    borderRadius: 2,
                                    border: "1px solid rgba(0,0,0,0.1)",
                                    flexShrink: 0,
                                }}
                            />
                        ))}
                    </div>
                    <span className="font-semibold uppercase tracking-tight opacity-70">More</span>
                </div>
            </div>
        </div>
    );
};
