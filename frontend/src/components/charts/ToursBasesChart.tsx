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

interface ToursBasesChartProps {
    data?: Array<{
        name: string;
        tours: number;
        bases: number;
    }>;
    title: string;
    barLabel: string;
    lineLabel: string;
}

const ToursBasesChart: React.FC<ToursBasesChartProps> = ({
    data = [],
    title,
    barLabel = "Nombre de tours",
    lineLabel = "Nombre de bases",
}) => {
    return (
        <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-normal" style={{ color: '#1F497D' }}>Nombre de Base</span>
                <h3 className="text-lg font-semibold text-center flex-1" style={{ color: '#1F497D' }}>{title}</h3>
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
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 12 }}
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
                            dataKey="tours" 
                            fill="#F5A623" 
                            barSize={40}
                            label={{ position: 'top', fontSize: 11 }}
                        />
                        <Line 
                            yAxisId="right"
                            type="linear" 
                            dataKey="bases" 
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

export default ToursBasesChart;