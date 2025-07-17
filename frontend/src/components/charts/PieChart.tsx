import React from "react";
import {
    Pie,
    Cell,
    ResponsiveContainer,
    PieChart,
    Tooltip,
} from "recharts";

interface DataItem {
    name: string;
    consumption: number;
}

interface PieChartProps {
    data?: DataItem[];
    title: string;
    legendPosition?: "top" | "right" | "bottom" | "left";
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

const PieChartComponent: React.FC<PieChartProps> = ({
    data = [
        { name: "Véhicule A", consumption: 30 },
        { name: "Véhicule B", consumption: 25 },
        { name: "Véhicule C", consumption: 45 },
    ],
    title,
    legendPosition = "right",
}) => {
    return (
        <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
            <div className="flex-grow flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Tooltip />
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="consumption"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PieChartComponent;