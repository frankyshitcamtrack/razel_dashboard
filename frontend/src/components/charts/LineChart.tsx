import React from "react";
import {
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart
} from "recharts";

interface LineChartProps {
    data?: any;
    title: string;
    lineLabel: string;
    color?: string;
}

const LineChartComponent: React.FC<LineChartProps> = ({
    data = [],
    title,
    lineLabel = "Distance (km)",
    color = "#02509D"
}) => {
    return (
        <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            axisLine={{ stroke: "#9ca3af" }}
                            tick={{ fill: "#6b7280" }}
                        />
                        <YAxis
                            label={{
                                value: lineLabel,
                                angle: -90,
                                position: 'insideLeft',
                                fill: color
                            }}
                            axisLine={{ stroke: "#9ca3af" }}
                            tick={{ fill: "#6b7280" }}
                        />
                        <Tooltip
                            labelFormatter={(label) => `Jour: ${label}`}
                            formatter={(value) => [value, lineLabel]}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="distance"
                            name={lineLabel}
                            stroke={color}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default LineChartComponent;