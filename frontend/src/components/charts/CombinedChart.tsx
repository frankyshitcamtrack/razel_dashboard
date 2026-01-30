import React from "react";
import {
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
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
    vehicleReference?: string;
}

const CombinedChartComponent: React.FC<CombinedChartProps> = ({
    data,
    title,
    barDataKey,
    barLabel,
    lineDataKey,
    lineLabel,
    vehicleReference = ""
}) => {
    // Default Recharts implementation
    return (
        <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold" style={{ color: "#6b7280" }}>{title}</h3>
                <div className="flex flex-col text-sm text-right">
                    <div className="flex items-center justify-end mb-1">
                        <div className="w-3 h-3 mr-2" style={{ backgroundColor: "#5B7DBF" }}></div>
                        <span>{barLabel}</span>
                    </div>
                    <div className="flex items-center justify-end">
                        <div className="w-3 h-3 mr-2" style={{ backgroundColor: "#FFA726" }}></div>
                        <span>{lineLabel}</span>
                    </div>
                </div>
            </div>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            label={vehicleReference && vehicleReference !== "Multiple" ? { value: vehicleReference, position: 'insideBottom', offset: -5, fontSize: 12 } : undefined}
                        />
                        <YAxis
                            yAxisId="left"
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip />
                        <Bar
                            yAxisId="left"
                            dataKey={barDataKey}
                            name={barLabel}
                            fill="#5B7DBF"
                            barSize={50}
                            label={{ position: 'center', fontSize: 11, fill: 'white', fontWeight: 'bold' }}
                        />
                        <Line
                            yAxisId="right"
                            type="linear"
                            dataKey={lineDataKey}
                            name={lineLabel}
                            stroke="#FFA726"
                            strokeWidth={3}
                            dot={{ fill: '#FFA726', r: 5, stroke: 'white', strokeWidth: 2 }}
                            label={{ position: 'top', fontSize: 11, fontWeight: 'bold' }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CombinedChartComponent;