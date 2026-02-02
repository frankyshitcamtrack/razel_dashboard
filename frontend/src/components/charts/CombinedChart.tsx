import React, { useMemo } from "react";
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
}

const CombinedChartComponent: React.FC<CombinedChartProps> = ({
    data,
    title,
    barDataKey,
    barLabel,
    lineDataKey,
    lineLabel
}) => {
    const processedData = useMemo(() => {
        if (!data) return [];
        
        // Group by vehicle first, then sort within each group by date
        const groups: { [key: string]: any[] } = {};
        data.forEach((item: any) => {
            const vehicleName = item.vehicle_name;
            let extractedVehicle = vehicleName || '';
            
            if (vehicleName) {
                const match = vehicleName.match(/^([A-Z]+\d+[A-Z]*)/);
                if (match) {
                    extractedVehicle = match[1];
                }
            }
            
            if (!groups[extractedVehicle]) {
                groups[extractedVehicle] = [];
            }
            groups[extractedVehicle].push({
                ...item,
                vehicleCode: extractedVehicle
            });
        });
        
        // Sort each group by date and flatten
        return Object.keys(groups)
            .sort()
            .map(vehicleCode => 
                groups[vehicleCode].sort((a, b) => a.name.localeCompare(b.name))
            )
            .flat();
    }, [data]);

    const vehicleGroups = useMemo(() => {
        if (!processedData.length) return [];
        
        // Calculate groups based on the sorted processedData order
        const groups: { vehicleCode: string; count: number }[] = [];
        let currentVehicle = '';
        let currentCount = 0;
        
        processedData.forEach((item: any) => {
            if (item.vehicleCode !== currentVehicle) {
                if (currentVehicle) {
                    groups.push({ vehicleCode: currentVehicle, count: currentCount });
                }
                currentVehicle = item.vehicleCode;
                currentCount = 1;
            } else {
                currentCount++;
            }
        });
        
        // Add the last group
        if (currentVehicle) {
            groups.push({ vehicleCode: currentVehicle, count: currentCount });
        }
        
        return groups;
    }, [processedData]);

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
            <div className="flex-grow relative">
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={processedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            axisLine={false}
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
                
                {/* Vehicle labels positioned under their respective groups */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center" style={{ transform: 'translateY(20px)' }}>
                    <div className="flex" style={{ width: '100%', paddingLeft: '60px', paddingRight: '60px' }}>
                        {vehicleGroups.map((group, index) => {
                            const widthPercentage = (group.count / processedData.length) * 100;
                            return (
                                <div
                                    key={group.vehicleCode}
                                    className="text-center text-xs font-medium flex items-center justify-center"
                                    style={{ 
                                        width: `${widthPercentage}%`,
                                        color: '#6b7280',
                                        fontSize: '10px',
                                        height: '40px',
                                        borderLeft: index > 0 ? '2px solid #374151' : 'none'
                                    }}
                                >
                                    {group.vehicleCode}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CombinedChartComponent;