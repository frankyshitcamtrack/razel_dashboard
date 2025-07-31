import React from "react";
import {
    Line,
    //Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
} from "recharts";



interface CombinedChartProps {
    data?: any;
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
    //isTimeBased = false,
}) => {
    const formatYAxis = (value: number): string =>
        +   value > 1000 ? `${value / 1000}k` : value.toString();

    return (
        <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            axisLine={{ stroke: "#9ca3af" }}
                            tick={{ fill: "#6b7280" }}
                        />
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
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey={barDataKey}
                            name={barLabel}
                            stroke="#F7D000"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />

                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey={lineDataKey}
                            name={lineLabel}
                            stroke="#02509D"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CombinedChartComponent;