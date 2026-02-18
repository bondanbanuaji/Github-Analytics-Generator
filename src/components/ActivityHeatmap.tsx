import React, { useEffect, useRef, useState, useMemo } from "react";
import { Info } from "lucide-react";

interface ActivityHeatmapProps {
    data: Record<string, number>;
}

declare global {
    interface Window {
        Chart: any;
    }
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<any>(null);
    const [isChartReady, setIsChartReady] = useState(false);

    // Define colors for Light and Dark modes
    const THEME_COLORS = {
        light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
        dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"]
    };

    // Calculate chart data
    const { chartPoints, totalContributions, months } = useMemo(() => {
        const today = new Date();
        const endDate = new Date(today);
        endDate.setHours(0, 0, 0, 0);

        // Compute start date: 52 weeks ago, aligned to Sunday
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 364);
        const dayOfStart = startDate.getDay(); // 0 is Sunday
        startDate.setDate(startDate.getDate() - dayOfStart);

        const points: { x: number; y: number; v: number; count: number; date: string }[] = [];
        const monthMarkers: { index: number; label: string }[] = [];
        let total = 0;
        let lastMonth = -1;

        // Iterate 53 weeks (columns) x 7 days (rows)
        for (let w = 0; w < 53; w++) {
            for (let d = 0; d < 7; d++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + (w * 7) + d);
                const dateStr = currentDate.toISOString().split("T")[0];

                const count = data[dateStr] || 0;
                total += count;

                // Level calculation (0-4)
                let v = 0;
                if (count > 0) {
                    if (count === 1) v = 1;
                    else if (count <= 3) v = 2;
                    else if (count <= 6) v = 3;
                    else v = 4;
                }

                points.push({
                    x: w,
                    y: d, // 0 = Sun, 6 = Sat. We will reverse Y axis in Chart.js so 0 is top.
                    v: v,
                    count: count,
                    date: dateStr
                });

                // Month labels (only on the first row of each week)
                if (d === 0) {
                    const m = currentDate.getMonth();
                    if (m !== lastMonth) {
                        monthMarkers.push({
                            index: w,
                            label: currentDate.toLocaleString("en-US", { month: "short" })
                        });
                        lastMonth = m;
                    }
                }
            }
        }

        return { chartPoints: points, totalContributions: total, months: monthMarkers };
    }, [data]);

    // Check for Chart.js availability
    useEffect(() => {
        const check = () => {
            if (window.Chart) {
                setIsChartReady(true);
            } else {
                setTimeout(check, 200);
            }
        };
        check();
    }, []);

    // Initialize / Update Chart
    useEffect(() => {
        if (!isChartReady || !canvasRef.current) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

        chartRef.current = new window.Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Contributions',
                    data: chartPoints,
                    backgroundColor: (cnx: any) => {
                        const val = cnx.raw?.v ?? 0;
                        return colors[val];
                    },
                    pointRadius: (ctx: any) => {
                        // Interactive radius could be handled here, but fixed is safer for grid look
                        return 5.5;
                    },
                    pointHoverRadius: 7,
                    pointStyle: 'rectRounded', // Rounded squares
                    borderWidth: 0,
                    hoverBorderWidth: 1,
                    hoverBorderColor: isDark ? '#fff' : '#000'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                layout: {
                    padding: { top: 20, right: 10, bottom: 10, left: 10 }
                },
                scales: {
                    x: {
                        type: 'linear',
                        min: -0.5,
                        max: 53.5,
                        position: 'top',
                        grid: { display: false, drawBorder: false },
                        border: { display: false },
                        ticks: {
                            stepSize: 1,
                            autoSkip: false,
                            callback: (val: number) => {
                                const m = months.find(mo => mo.index === val);
                                return m ? m.label : "";
                            },
                            color: isDark ? "#8b949e" : "#57606a",
                            font: { size: 10, family: "Inter" },
                            maxRotation: 0,
                            padding: 0
                        }
                    },
                    y: {
                        type: 'linear',
                        min: -0.5,
                        max: 6.5,
                        reverse: true, // 0 at top
                        grid: { display: false, drawBorder: false },
                        border: { display: false },
                        ticks: {
                            stepSize: 1,
                            callback: (val: number) => {
                                // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
                                // Show Mon (1), Wed (3), Fri (5)
                                if (val === 1) return "Mon";
                                if (val === 3) return "Wed";
                                if (val === 5) return "Fri";
                                return "";
                            },
                            color: isDark ? "#8b949e" : "#57606a",
                            font: { size: 9, family: "Inter" },
                            padding: 5
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        backgroundColor: isDark ? "rgba(22,27,34, 0.95)" : "rgba(255,255,255, 0.95)",
                        titleColor: isDark ? "#ffffff" : "#24292f",
                        bodyColor: isDark ? "#ffffff" : "#24292f",
                        borderColor: isDark ? "#30363d" : "#d0d7de",
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 6,
                        displayColors: false,
                        callbacks: {
                            title: () => "",
                            label: (cnx: any) => {
                                const p = cnx.raw;
                                const d = new Date(p.date);
                                const dateStr = d.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
                                const countStr = p.count === 0 ? "No contributions" : `${p.count} contribution${p.count === 1 ? '' : 's'}`;
                                return `${countStr} on ${dateStr}`;
                            }
                        }
                    }
                }
            }
        });

        // Re-render when theme likely changes (rough check via mutation observer could be better but this effect depends on data)
        // Ideally we listen to theme changes. 
        // For now, if data doesn't change, we might need a manual trigger for theme.
        // But let's assume reload or simple toggle re-renders parent which re-renders this.
    }, [isChartReady, chartPoints, months]);

    // Helper for Legend Colors
    const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute("data-theme") === "dark";
    const legendColors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

    return (
        <div className="card p-4 sm:p-6 w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                <h3 className="font-bold text-sm sm:text-base lg:text-lg" style={{ color: "var(--text-primary)" }}>
                    {totalContributions.toLocaleString()} contributions in the last year
                </h3>
            </div>

            <div className="relative w-full h-[180px] sm:h-[200px] lg:h-[220px] overflow-hidden">
                {!isChartReady && (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-[var(--text-muted)]">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                            Loading chart...
                        </div>
                    </div>
                )}
                <div className="w-full h-full min-w-0">
                    <canvas ref={canvasRef} />
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4 text-[10px] sm:text-xs" style={{ color: "var(--text-muted)" }}>
                <div className="flex items-center gap-1.5 order-2 md:order-1">
                    <Info className="w-3.5 h-3.5" />
                    <span className="font-medium">Recent activity (GitHub API limit 90 days)</span>
                </div>

                <div className="flex items-center gap-3 order-1 md:order-2 bg-[var(--bg-secondary)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
                    <span className="font-semibold uppercase tracking-tight opacity-70">Less</span>
                    <div className="flex gap-1.5">
                        {legendColors.map((color, i) => (
                            <div
                                key={i}
                                style={{ backgroundColor: color }}
                                className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[2px] border border-black/10 transition-transform hover:scale-125 cursor-help"
                                title={`Level ${i}`}
                            />
                        ))}
                    </div>
                    <span className="font-semibold uppercase tracking-tight opacity-70">More</span>
                </div>
            </div>
        </div>
    );
};
