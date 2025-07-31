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
}

const COLORS = [
    "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
    "#ef4444", "#ec4899", "#14b8a6", "#64748b"
];

// PieChartComponent.tsx

const PieChartComponent: React.FC<PieChartProps> = ({
    data = [],
    title,
    unit = "",
    className = ""
}) => {
    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        name,
        daylyConsom
    }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="#333"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={14} // un peu plus grand
            >
                {`${name}: ${daylyConsom}${unit}`}
            </text>
        );
    };

    return (
        <div className={`bg-white rounded-xl shadow-lg p-6 h-full flex flex-col ${className}`}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">{title}</h3>
            <div className="flex-grow flex items-center justify-center">
                <ResponsiveContainer width="100%" height={500}>
                    <PieChart>
                        <Tooltip formatter={(value) => [`${value} ${unit}`, 'Consommation']} />
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            outerRadius={180}
                            innerRadius={100}
                            paddingAngle={2}
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
                        <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value) => (
                                <span className="text-sm text-gray-600">{value}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
export default PieChartComponent;