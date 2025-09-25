import React from "react";
import { Pie, Cell, ResponsiveContainer, PieChart, Tooltip } from "recharts";

interface DailyConsommationData {
    name: string;
    daylyConsom: number;
}

interface PieChartProps {
    data?: DailyConsommationData[];
    title: string;
    unit?: string;
    className?: string;
    variant?: "pie" | "donut";
}

const COLORS = [
    "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
    "#ef4444", "#ec4899", "#14b8a6", "#64748b"
];

const PieChartComponent: React.FC<PieChartProps> = ({
    data = [],
    title,
    unit = "",
    className = "",
    variant = "donut"
}) => {
    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent
    }: any) => {
        if (percent < 0.05) return null;

        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fontWeight="bold"
                stroke="#333"
                strokeWidth={0.5}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const total = data.reduce((sum, item) => sum + item.daylyConsom, 0);

    return (
        <div className={`bg-white rounded-xl shadow-lg p-4 flex flex-col ${className}`}>
            <h3 className="text-lg font-semibold text-gray-800 mb-1 text-center">{title}</h3>

            <div className="flex-grow flex flex-col lg:flex-row items-center justify-center relative min-h-[300px]">
                <ResponsiveContainer width="100%" height={280} className="lg:flex-1">
                    <PieChart>
                        <Tooltip
                            formatter={(value, _name, props) => [
                                `${value} ${unit}`,
                                props.payload.name
                            ]}
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                        />
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            innerRadius={variant === "donut" ? 50 : 0}
                            paddingAngle={1}
                            dataKey="daylyConsom"
                            nameKey="name"
                            label={renderCustomizedLabel}
                            labelLine={false}
                        >
                            {data.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="#fff"
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>

                        {/* Centre personnalisé pour le donut */}
                        {variant === "donut" && total > 0 && (
                            <text
                                x="50%"
                                y="45%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-lg font-bold fill-gray-800"
                            >
                                {total.toFixed(1)}
                            </text>
                        )}
                        {variant === "donut" && total > 0 && (
                            <text
                                x="50%"
                                y="55%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-xs fill-gray-600"
                            >
                                {unit}
                            </text>
                        )}
                    </PieChart>
                </ResponsiveContainer>

                {/* Légende séparée - en dessous sur mobile, à droite sur desktop */}
                <div className="w-full lg:w-auto lg:flex-1 mt-4 lg:mt-0 lg:pl-4">
                    <div className="flex flex-wrap justify-center lg:justify-start gap-2 lg:block">
                        {data.map((entry, index) => (
                            <div key={index} className="flex items-center text-xs mb-1">
                                <div
                                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="text-gray-700 truncate max-w-[120px] lg:max-w-none">
                                    {entry.name}: {entry.daylyConsom}{unit}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PieChartComponent;