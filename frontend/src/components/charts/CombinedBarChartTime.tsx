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

// Convert duration string to hours for plotting
const convertToHours = (timeStr: string): number => {
    const parts = timeStr.split(':');
    return parseFloat(parts[0]) + parseFloat(parts[1]) / 60 + parseFloat(parts[2]) / 3600;
};

const formatYAxisTime = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}:00`;
};

const CombinedBarChartTimeComponent: React.FC<CombinedChartProps> = ({
    data = [],
    title,
    barLabel = "Durée (heures)",
    lineLabel = "Distance (km)",
}) => {
    const chartData = data.map(item => ({
        ...item,
        durationHours: convertToHours(item.duration)
    }));

    return (
        <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
                <div className="flex flex-col text-sm text-right">
                    <div className="flex items-center justify-end mb-1">
                        <div className="w-3 h-3 mr-2" style={{ backgroundColor: "#F5A623" }}></div>
                        <span>{barLabel}</span>
                    </div>
                    <div className="flex items-center justify-end">
                        <div className="w-3 h-3 mr-2" style={{ backgroundColor: "#4A90E2" }}></div>
                        <span>{lineLabel}</span>
                    </div>
                </div>
            </div>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 12 }}
                            label={{ value: 'VE38A', position: 'insideBottom', offset: -5, fontSize: 12 }}
                        />
                        <YAxis 
                            yAxisId="left"
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                            yAxisId="right" 
                            orientation="right"
                            tickFormatter={formatYAxisTime}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                            formatter={(value, name) => {
                                if (name === 'durationHours') {
                                    return [formatYAxisTime(Number(value)), 'Durée'];
                                }
                                return [value, name === 'distance' ? 'Distance (km)' : name];
                            }}
                        />
                        <Bar 
                            yAxisId="right"
                            dataKey="durationHours" 
                            fill="#F5A623" 
                            barSize={40}
                            label={{ position: 'top', formatter: (val: number) => formatYAxisTime(val), fontSize: 11 }}
                        />
                        <Line 
                            yAxisId="left"
                            type="linear" 
                            dataKey="distance" 
                            stroke="#4A90E2" 
                            strokeWidth={2}
                            dot={{ fill: '#4A90E2', r: 4 }}
                            label={{ position: 'top', fontSize: 11 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CombinedBarChartTimeComponent;