import React from "react";
import {
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
} from "recharts";

interface DataItem {
    name: string;
    [key: string]: number | string;
}

interface CombinedChartProps {
    data?: DataItem[];
    title: string;
    barDataKey: string;
    barLabel: string;
    lineDataKey: string;
    lineLabel: string;
    isTimeBased?: boolean;
}

const CombinedChartComponent: React.FC<CombinedChartProps> = ({
    data,
    title,
    barDataKey,
    barLabel,
    lineDataKey,
    lineLabel,
    isTimeBased = false,
}) => {
    const formatYAxis = (value: number) =>
        isTimeBased ? `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, "0")}` : value;

    return (
        <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" axisLine={{ stroke: "#9ca3af" }} tick={{ fill: "#6b7280" }} />
                        <YAxis
                            yAxisId="left"
                            tickFormatter={formatYAxis}
                            axisLine={{ stroke: "#9ca3af" }}
                            tick={{ fill: "#6b7280" }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            axisLine={{ stroke: "#9ca3af" }}
                            tick={{ fill: "#6b7280" }}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey={barDataKey} name={barLabel} fill="#3b82f6" />
                        <Line yAxisId="right" type="monotone" dataKey={lineDataKey} name={lineLabel} stroke="#ef4444" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CombinedChartComponent;