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
    // If it's a speeding chart (no bar data), render as CSS bar chart
    if (!barDataKey && lineDataKey === "value") {
        const maxValue = Math.max(...(data?.map((item: any) => item.value) || [0]));
        const scaleMax = Math.ceil(maxValue / 100) * 100; // Round up to nearest 100
        
        return (
            <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
                <h3 className="text-lg font-semibold mb-4" style={{ color: title === "Historique Transit" ? "#FFC000" : "#6b7280" }}>{title}</h3>
                <div className="flex-grow">
                    <div className="relative">
                        {/* Chart area */}
                        <div className="flex">
                            {/* Y-axis labels */}
                            <div className="w-12 h-64 flex flex-col justify-between text-xs text-gray-600 pr-2">
                                {Array.from({length: 11}, (_, i) => Math.round((scaleMax - (i * scaleMax / 10)))).map(val => (
                                    <span key={val} className="text-right">{val}</span>
                                ))}
                            </div>
                            {/* Bars container */}
                            <div className="flex-1">
                                <div className="relative h-64">
                                    {/* Bars */}
                                    <div className="relative h-full flex items-end justify-between">
                                        {data?.map((item: any, index: number) => (
                                            <div key={index} className="flex flex-col items-center" style={{ width: `${100 / data.length}%` }}>
                                                <span className="mb-2 text-sm font-semibold text-gray-700">
                                                    {item.value}
                                                </span>
                                                <div
                                                    className="mx-auto"
                                                    style={{ 
                                                        backgroundColor: '#4E80BC',
                                                        height: `${(item.value / scaleMax) * 256}px`,
                                                        width: '60%'
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* X-axis labels */}
                                <div className="flex justify-between mt-4">
                                    {data?.map((item: any, index: number) => (
                                        <div key={index} className="text-center text-sm text-gray-700" style={{ width: `${100 / data.length}%` }}>
                                            {item.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* Vehicle label */}
                        {vehicleReference && vehicleReference !== "Multiple" && (
                            <div className="text-center mt-3 text-sm text-gray-600">
                                {vehicleReference}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold" style={{ color: title === "Historique Transit" ? "#FFC000" : "#6b7280" }}>{title}</h3>
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