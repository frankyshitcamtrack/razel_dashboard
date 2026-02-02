import React from "react";
import {
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
} from "recharts";

import type { DaylyConsommationItem } from "../../types/ChartDataType";

interface DailyConsumptionChartProps {
    data: DaylyConsommationItem[];
    title: string;
}

const DailyConsumptionChart: React.FC<DailyConsumptionChartProps> = ({ data, title }) => {
    // Group data by vehicle and create chart data with proper positioning
    const groupedData = data.reduce((acc, item) => {
        const vehicleCode = item.vehicle_name?.split('-')[0] || 'Unknown';
        if (!acc[vehicleCode]) {
            acc[vehicleCode] = [];
        }
        acc[vehicleCode].push(item);
        return acc;
    }, {} as Record<string, DaylyConsommationItem[]>);

    const chartData: any[] = [];
    const vehiclePositions: { [key: string]: { start: number; end: number } } = {};
    let currentIndex = 0;

    Object.keys(groupedData).forEach((vehicleCode) => {
        const vehicleData = groupedData[vehicleCode];
        const startIndex = currentIndex;
        
        vehicleData.forEach(item => {
            chartData.push({
                name: item.name,
                daylyConsom: item.daylyConsom,
                vehicleCode: vehicleCode
            });
            currentIndex++;
        });
        
        vehiclePositions[vehicleCode] = {
            start: startIndex,
            end: currentIndex - 1
        };
    });

    const CustomXAxisTick = (props: any) => {
        const { x, y, payload } = props;
        return (
            <text x={x} y={y + 4} textAnchor="middle" fontSize={12} fill="#374151">
                {payload.value}
            </text>
        );
    };

    const renderVehicleLabels = () => {
        const labels: React.ReactElement[] = [];
        
        Object.entries(vehiclePositions).forEach(([vehicleCode, position]) => {
            const groupWidth = position.end - position.start + 1;
            const centerPosition = position.start + groupWidth / 2;
            const xPercent = (centerPosition / chartData.length) * 100;
            
            labels.push(
                <div
                    key={vehicleCode}
                    style={{
                        position: 'absolute',
                        left: `${xPercent}%`,
                        bottom: '10px',
                        transform: 'translateX(-50%)',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#6b7280',
                        textAlign: 'center',
                        borderTop: '1px solid #d1d5db',
                        paddingTop: '4px',
                        minWidth: `${(groupWidth / chartData.length) * 100}%`
                    }}
                >
                    {vehicleCode}
                </div>
            );
        });
        
        return <>{labels}</>;
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold" style={{ color: "#6b7280" }}>{title}</h3>
                <div className="flex items-center text-sm">
                    <div className="w-3 h-3 mr-2" style={{ backgroundColor: "#5B7DBF" }}></div>
                    <span>Consommation (L)</span>
                </div>
            </div>
            <div className="flex-grow relative">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="name" 
                            tick={<CustomXAxisTick />}
                            height={40}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value: any) => [`${value} L`, 'Consommation']} />
                        <Bar 
                            dataKey="daylyConsom" 
                            name="Consommation" 
                            fill="#5B7DBF" 
                            barSize={40}
                        />
                    </BarChart>
                </ResponsiveContainer>
                {renderVehicleLabels()}
            </div>
        </div>
    );
};

export default DailyConsumptionChart;