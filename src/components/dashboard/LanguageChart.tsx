import React, { useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import type { LanguageStat } from "../../lib/github";

interface LanguageChartProps {
    data: LanguageStat[];
}

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    return (
        <g>
            <text x={cx} y={cy - 10} dy={0} textAnchor="middle" fill="var(--text-primary)"
                style={{ fontSize: "15px", fontWeight: 700, fontFamily: "Inter" }}>
                {payload.name}
            </text>
            <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--text-secondary)"
                style={{ fontSize: "12px", fontFamily: "Inter" }}>
                {`${(percent * 100).toFixed(1)}%`}
            </text>
            <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8}
                startAngle={startAngle} endAngle={endAngle} fill={fill} />
            <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle}
                innerRadius={outerRadius + 12} outerRadius={outerRadius + 15} fill={fill} opacity={0.3} />
        </g>
    );
};

export const LanguageChart: React.FC<LanguageChartProps> = ({ data }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    if (data.length === 0) {
        return (
            <div className="rounded-2xl p-6 text-center text-sm"
                style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border-primary)" }}>
                No language data available
            </div>
        );
    }

    const top8 = data.slice(0, 8);
    const others = data.slice(8);
    const chartData = others.length > 0
        ? [...top8, {
            name: "Others",
            value: others.reduce((sum, l) => sum + l.value, 0),
            color: "#6b7280",
            percentage: others.reduce((sum, l) => sum + l.percentage, 0),
        }]
        : top8;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl p-6"
            style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                boxShadow: "0 4px 24px var(--shadow-color)",
            }}
        >
            <h3 className="text-sm font-semibold mb-5 uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}>
                Language Distribution
            </h3>

            <div className="flex flex-col lg:flex-row items-center gap-6 xl:gap-10">
                <div className="w-full lg:w-1/2 xl:w-2/5 min-w-0" style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                // @ts-ignore
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={chartData}
                                cx="50%" cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={3}
                                dataKey="value"
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} stroke="transparent" />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="w-full lg:w-1/2 xl:w-3/5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                    {chartData.map((lang, index) => (
                        <button
                            key={lang.name}
                            onClick={() => setActiveIndex(index)}
                            className="flex items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-300 group"
                            style={{
                                background: activeIndex === index ? "var(--accent-soft)" : "transparent",
                                border: activeIndex === index ? "1px solid var(--accent)" : "1px solid var(--border-subtle)",
                                opacity: activeIndex === index ? 1 : 0.8
                            }}
                        >
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 shadow-sm"
                                style={{ backgroundColor: lang.color }} />
                            <div className="min-w-0 flex-1">
                                <div className="text-xs sm:text-sm font-bold truncate"
                                    style={{ color: "var(--text-primary)" }}>
                                    {lang.name}
                                </div>
                                <div className="text-[10px] sm:text-xs font-semibold"
                                    style={{ color: "var(--text-muted)" }}>
                                    {lang.percentage}%
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
