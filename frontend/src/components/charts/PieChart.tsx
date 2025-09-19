import React from "react";
import { Pie, Cell, ResponsiveContainer, PieChart, Tooltip, Legend } from "recharts";

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

// ... (même interface et const COLORS)

const PieChartComponent: React.FC<PieChartProps> = ({
    data = [],
    title,
    unit = "",
    className = "",
    variant = "donut" // Donut par défaut
}) => {
    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent
    }: any) => {
        // Afficher seulement le pourcentage pour les petits segments
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
        <div className={`bg-white rounded-xl shadow-lg p-2 flex flex-col ${className}`}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">{title}</h3>
            <div className="flex-grow flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height={280}>
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
                            }}
                        />
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            innerRadius={variant === "donut" ? 60 : 0}
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
                                className="text-2xl font-bold fill-gray-800"
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
                                className="text-sm fill-gray-600"
                            >
                                {unit}
                            </text>
                        )}

                        <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            wrapperStyle={{
                                paddingLeft: '20px',
                                fontSize: '12px'
                            }}
                            formatter={(value, entry: any) => (
                                <span className="text-xs text-gray-700">
                                    {value}: {entry.payload.daylyConsom}{unit}
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
export default PieChartComponent;