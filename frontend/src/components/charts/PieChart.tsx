import React from "react";
import {
    Pie,
    Cell,
    ResponsiveContainer,
    PieChart,
    Tooltip,
    Legend
} from "recharts";

interface DailyConsommationData {
    name: string;
    daylyConsom: number;
}

interface PieChartProps {
    data?: DailyConsommationData[];
    title: string;
    unit?: string;
}

const COLORS = [
    "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
    "#ef4444", "#ec4899", "#14b8a6", "#64748b"
];

const PieChartComponent: React.FC<PieChartProps> = ({
    data = [
        { name: "dim.", daylyConsom: 16.5 },
        { name: "lun.", daylyConsom: 18.9 }
    ],
    title,
    unit = "", // Unité par défaut (litres)
}) => {
    // Fonction pour formater les étiquettes avec les valeurs absolues
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
                fontSize={12}
            >
                {`${name}: ${daylyConsom}${unit}`}
            </text>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
            <div className="flex-grow flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Tooltip
                            formatter={(value) => [`${value} ${unit}`, 'Consommation']}
                        />
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            innerRadius={60}
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
                                />
                            ))}
                        </Pie>
                        <Legend
                            formatter={(value) => (
                                <span className="text-sm text-gray-600">
                                    {value}
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