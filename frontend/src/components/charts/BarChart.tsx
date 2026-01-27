import React from "react";
import {
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
    LabelList,
} from "recharts";


interface BarChartProps {
    data?: any;
    title: string;
    dataKey1: string;
    label1: string;
    dataKey2?: string;
    label2?: string;
    color1?: string;
    color2?: string;
    percentage?: boolean;
    isTimeBased?: boolean;
}

const CustomBarChart: React.FC<BarChartProps> = ({
    data,
    title,
    dataKey1,
    label1,
    dataKey2,
    label2,
    color1,
    color2,
    percentage = false,
}) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-gray-500">Aucune donnée disponible</p>
                </div>
            </div>
        );
    }

    // Extract vehicle code and base name
    const extractVehicleCode = (fullName: string): string => {
        const match = fullName.match(/V[A-Z0-9]+/);
        return match ? match[0] : fullName;
    };

    const extractBaseName = (fullName: string): string => {
        const parts = fullName.split(' - ');
        if (parts.length >= 3) {
            return parts[parts.length - 1];
        }
        return '';
    };

    // Aggregate data by vehicle code
    const aggregatedData: { [key: string]: any } = {};
    
    data.forEach((item: any) => {
        const vehicleCode = extractVehicleCode(item.name);
        const baseName = extractBaseName(item.name);
        
        if (!aggregatedData[vehicleCode]) {
            aggregatedData[vehicleCode] = {
                name: vehicleCode,
                vehicleCode,
                baseName,
                [dataKey1]: 0,
            };
            if (dataKey2) {
                aggregatedData[vehicleCode][dataKey2] = 0;
            }
        }
        
        aggregatedData[vehicleCode][dataKey1] += Number(item[dataKey1]) || 0;
        if (dataKey2 && item[dataKey2] !== undefined) {
            aggregatedData[vehicleCode][dataKey2] += Number(item[dataKey2]) || 0;
        }
    });

    // Sort by base name, then by vehicle code
    const chartData = Object.values(aggregatedData).sort((a: any, b: any) => {
        const baseCompare = a.baseName.localeCompare(b.baseName);
        if (baseCompare !== 0) return baseCompare;
        return a.vehicleCode.localeCompare(b.vehicleCode);
    });

    // Group data by base name
    const baseGroupsMap: { [key: string]: { start: number; count: number } } = {};
    chartData.forEach((item: any, index: number) => {
        if (!baseGroupsMap[item.baseName]) {
            baseGroupsMap[item.baseName] = { start: index, count: 0 };
        }
        baseGroupsMap[item.baseName].count++;
    });

    const baseGroups = Object.entries(baseGroupsMap);

    // Custom X-axis tick to show vehicle code with dynamic sizing
    const CustomXAxisTick = (props: any) => {
        const { x, y, payload } = props;
        const fontSize = chartData.length === 1 ? 14 : Math.max(8, Math.min(11, 120 / chartData.length));
        const displayText = chartData.length === 1 ? 
            chartData.find(item => item.vehicleCode === payload.value)?.name || payload.value :
            payload.value;
        
        return (
            <g transform={`translate(${x},${y})`}>
                <text 
                    x={0} 
                    y={0} 
                    dy={16} 
                    textAnchor="middle" 
                    fill="#1F497D" 
                    fontSize={fontSize} 
                    fontWeight="bold"
                    style={{
                        maxWidth: chartData.length === 1 ? '200px' : '60px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                >
                    {displayText}
                </text>
            </g>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-normal" style={{ color: '#1F497D' }}>{label1}</span>
                <h3 className="text-lg font-semibold text-center flex-1" style={{ color: '#1F497D' }}>{title}</h3>
                <span className="invisible text-sm">{label1}</span>
            </div>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart data={chartData} margin={{ bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="vehicleCode" 
                            axisLine={{ stroke: "#9ca3af" }} 
                            tick={<CustomXAxisTick />}
                        />
                        <YAxis
                            yAxisId="left"
                            tickFormatter={percentage ? (val) => `${val}%` : (val) => val.toString()}
                            axisLine={{ stroke: "#9ca3af" }}
                            tick={{ fill: "#1F497D", fontSize: 11 }}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey={dataKey1} name={label1} fill={color1} >
                            <LabelList dataKey={dataKey1} position="center" fill="white" fontSize={12} fontWeight="bold" />
                        </Bar>
                        {dataKey2 && (
                            <Bar yAxisId="left" dataKey={dataKey2} name={label2} fill={color2} >
                                <LabelList dataKey={dataKey2} position="center" fill="#1F497D" fontSize={12} />
                            </Bar>
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            {/* Base name labels below chart with proper alignment */}
            <div className="relative" style={{ height: '25px', marginTop: '-15px' }}>
                <div className="absolute" style={{ left: '50px', right: '30px', height: '25px' }}>
                    {baseGroups.map(([baseName, groupInfo]) => {
                        // Calculate exact positioning based on chart area
                        const totalWidth = 100; // percentage
                        const barWidth = totalWidth / chartData.length;
                        const startPosition = groupInfo.start * barWidth;
                        const groupWidth = groupInfo.count * barWidth;
                        const fontSize = Math.max(8, Math.min(10, groupWidth * 0.8));
                        
                        return (
                            <div
                                key={baseName}
                                className="absolute flex items-center justify-center"
                                style={{
                                    left: `${startPosition}%`,
                                    width: `${groupWidth}%`,
                                    height: '25px',
                                    fontSize: `${fontSize}px`,
                                    color: '#1F497D',
                                    fontWeight: 'bold',
                                    borderLeft: groupInfo.start > 0 ? '2px solid #1F497D' : 'none',
                                    overflow: 'hidden',
                                    textAlign: 'center',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'clip'
                                }}
                            >
                                {baseName}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CustomBarChart;