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

interface CombinedChartProps {
    data?: Array<{
        name: string;
        duration: string;
        distance: number;
    }>;
    title: string;
    barLabel: string;
    lineLabel: string;
}

// Fonction pour convertir "hh:mm:ss" en heures décimales
const durationToHours = (duration: string): number => {
    const [hours, minutes, seconds] = duration.split(':').map(Number);
    return hours + (minutes / 60) + (seconds / 3600);
};

// Fonction pour formater les heures décimales en "hh:mm"
const formatHours = (decimalHours: number): string => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
};

const CombinedBarChartTimeComponent: React.FC<CombinedChartProps> = ({
    data = [],
    title,
    barLabel = "Durée (heures)",
    lineLabel = "Distance (km)",
}) => {
    // Transforme les données pour inclure les heures décimales
    const chartData = data.map(item => ({
        ...item,
        durationHours: durationToHours(item.duration),
    }));

    return (
        <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            axisLine={{ stroke: "#9ca3af" }}
                            tick={{ fill: "#6b7280" }}
                        />
                        <YAxis
                            yAxisId="left"
                            label={{
                                value: lineLabel,
                                angle: -90,
                                position: 'insideLeft',
                                fill: "#02509D"
                            }}
                            axisLine={{ stroke: "#9ca3af" }}
                            tick={{ fill: "#6b7280" }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            label={{
                                value: barLabel,
                                angle: 90,
                                position: 'insideRight',
                                fill: "#F7D000"
                            }}
                            axisLine={{ stroke: "#9ca3af" }}
                            tick={{ fill: "#6b7280" }}
                            tickFormatter={formatHours}
                        />
                        <Tooltip
                            formatter={(value, name) => {
                                if (name === barLabel) {
                                    return [formatHours(Number(value)), name];
                                }
                                return [value, name];
                            }}
                            labelFormatter={(label) => `Jour: ${label}`}
                        />
                        <Legend />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="distance"
                            name={lineLabel}
                            stroke="#02509D"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Bar
                            yAxisId="right"
                            dataKey="durationHours"
                            name={barLabel}
                            fill="#F7D000"
                            radius={[4, 4, 0, 0]}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CombinedBarChartTimeComponent;