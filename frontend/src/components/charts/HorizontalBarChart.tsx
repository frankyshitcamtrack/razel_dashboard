import { PureComponent } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    LabelList,
    Tooltip,
} from "recharts";

interface HorizontalBarChartProps {
    data: any[];
    dataKey1: string;
    dataKey2?: string;
    label1: string;
    label2?: string;
    color1?: string;
    color2?: string;
    valueType?: 'number' | 'time' | 'percentage';
    title?: string;
}

export default class HorizontalBarChart extends PureComponent<HorizontalBarChartProps> {
    // Extract vehicle code from name
    extractVehicleCode = (fullName: string): string => {
        if (!fullName) return 'Unknown';
        // Try multiple patterns to catch vehicle codes
        const patterns = [
            /V[A-Z0-9]+/,  // Standard pattern like V492E, V453N
            /[A-Z][0-9]+[A-Z]/,  // Alternative pattern
        ];
        
        for (const pattern of patterns) {
            const match = fullName.match(pattern);
            if (match) return match[0];
        }
        
        // If no vehicle code found, try to extract from the second part after first dash
        const parts = fullName.split(' - ');
        if (parts.length >= 2) {
            const secondPart = parts[1];
            const vehicleMatch = secondPart.match(/^([A-Z0-9]+)/);
            if (vehicleMatch) return vehicleMatch[1];
        }
        
        return 'Unknown';
    };

    // Extract base name from the full name string
    extractBaseName = (fullName: string): string => {
        if (!fullName) return 'Unknown';
        const parts = fullName.split(' - ');
        if (parts.length >= 3) {
            return parts[parts.length - 1];
        }
        return 'Unknown';
    };

    // Détecte automatiquement le type de valeur
    detectValueType = (value: any): 'number' | 'time' | 'percentage' => {
        if (typeof value === 'string') {
            if (value.includes('%')) return 'percentage';
            if (value.match(/^\d{1,2}:\d{2}:\d{2}$/)) return 'time';
        }
        return 'number';
    };

    // Convertit hh:mm:ss en secondes
    timeToSeconds = (timeStr: string): number => {
        if (!timeStr) return 0;
        
        // Handle if it's already a number
        if (typeof timeStr === 'number') return timeStr;
        
        // Handle string format
        const parts = timeStr.toString().split(':');
        if (parts.length === 3) {
            const [hours, minutes, seconds] = parts.map(Number);
            return hours * 3600 + minutes * 60 + seconds;
        } else if (parts.length === 2) {
            const [minutes, seconds] = parts.map(Number);
            return minutes * 60 + seconds;
        }
        
        // Try to parse as number
        const num = parseFloat(timeStr);
        return isNaN(num) ? 0 : num;
    };

    // Formatte les secondes en hh:mm:ss
    formatTime = (seconds: number): string => {
        if (!seconds || seconds <= 0) return '00:00:00';
        
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Normalise les valeurs pour le graphique
    normalizeValue = (value: any, _key: string): number => {
        if (value === undefined || value === null) return 0;
        
        const type = this.props.valueType || this.detectValueType(value);

        switch (type) {
            case 'time':
                return this.timeToSeconds(value);
            case 'percentage':
                return typeof value === 'string' ? parseFloat(value.replace('%', '')) : value;
            default:
                const numValue = typeof value === 'string' ? parseFloat(value) : value;
                return isNaN(numValue) ? 0 : numValue;
        }
    };

    // Formatte les valeurs pour l'affichage
    formatValue = (value: number): string => {
        if (value === undefined || value === null || isNaN(value)) return '0';
        
        const type = this.props.valueType || 'number';

        switch (type) {
            case 'time':
                return this.formatTime(value);
            case 'percentage':
                return `${Math.round(value)}%`;
            default:
                return value > 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString();
        }
    };

    // Custom label renderer that hides labels for dummy data
    renderCustomLabel = (props: any) => {
        const { x, y, width, height, value, index } = props;
        if (!value || value <= 0 || index === undefined) return null;
        
        // Check if this is dummy data
        const dataItem = this.props.data?.[index];
        if (dataItem?.isDummy) return null;
        
        const labelX = x + width + 5;
        const labelY = y + height / 2;
        return (
            <text 
                x={labelX} 
                y={labelY} 
                fill="black" 
                fontSize={12} 
                fontWeight="bold"
                textAnchor="start"
                dominantBaseline="middle"
            >
                {this.formatTime(value)}
            </text>
        );
    };

    render() {
        const {
            data,
            dataKey1,
            title = "Graphique",
        } = this.props;

        if (!data || data.length === 0) {
            return (
                <div className="bg-white rounded-lg shadow p-2 flex flex-col h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 14, fill: '#666' }}>
                                Aucune donnée disponible
                            </text>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        // Process data to extract vehicle codes, base names and aggregate durations
        const aggregatedData: { [key: string]: { duration: number; baseName: string } } = {};
        
        data.forEach(item => {
            if (!item || !item.name || !item[dataKey1]) return;
            
            const vehicleCode = this.extractVehicleCode(item.name);
            const baseName = this.extractBaseName(item.name);
            if (vehicleCode === 'Unknown' || baseName === 'Unknown') return;
            
            // Use composite key (vehicle + base) to keep vehicles separate by base
            const key = `${vehicleCode}-${baseName}`;
            
            const duration = this.timeToSeconds(item[dataKey1]);
            if (duration > 0) {
                if (!aggregatedData[key]) {
                    aggregatedData[key] = { duration: 0, baseName };
                }
                aggregatedData[key].duration += duration;
            }
        });

        const chartData = Object.entries(aggregatedData)
            .map(([key, data]) => {
                const vehicleCode = key.split('-')[0]; // Extract vehicle code from composite key
                return {
                    status: vehicleCode,
                    frequency: data.duration, // Keep as seconds
                    timeLabel: this.formatTime(data.duration), // Add formatted time label
                    baseName: data.baseName
                };
            })
            .sort((a, b) => {
                // Sort by base name first, then by duration descending
                const baseCompare = a.baseName.localeCompare(b.baseName);
                if (baseCompare !== 0) return baseCompare;
                return b.frequency - a.frequency;
            });

        // Add dummy data to ensure minimum 4 items per group
        const groupedByBase: { [key: string]: any[] } = {};
        chartData.forEach(item => {
            if (!groupedByBase[item.baseName]) {
                groupedByBase[item.baseName] = [];
            }
            groupedByBase[item.baseName].push(item);
        });

        // Create final chart data with dummy entries
        const finalChartData: any[] = [];
        Object.entries(groupedByBase).forEach(([baseName, items]) => {
            const realCount = items.length;
            const minCount = 4;
            const dummyCount = Math.max(0, minCount - realCount);
            
            if (dummyCount > 0) {
                // Add dummy entries based on real count
                if (realCount === 1) {
                    // 2 before, 1 after
                    finalChartData.push({ status: '', frequency: 0, baseName, isDummy: true });
                    finalChartData.push({ status: '', frequency: 0, baseName, isDummy: true });
                    finalChartData.push(...items);
                    finalChartData.push({ status: '', frequency: 0, baseName, isDummy: true });
                } else if (realCount === 2) {
                    // 1 before, 1 after
                    finalChartData.push({ status: '', frequency: 0, baseName, isDummy: true });
                    finalChartData.push(...items);
                    finalChartData.push({ status: '', frequency: 0, baseName, isDummy: true });
                } else if (realCount === 3) {
                    // 1 after
                    finalChartData.push(...items);
                    finalChartData.push({ status: '', frequency: 0, baseName, isDummy: true });
                }
            } else {
                finalChartData.push(...items);
            }
        });

        // Recalculate groups with dummy data
        const finalBaseGroupsMap: { [key: string]: { start: number; count: number } } = {};
        finalChartData.forEach((item, index) => {
            const baseName = item.baseName;
            if (!finalBaseGroupsMap[baseName]) {
                finalBaseGroupsMap[baseName] = { start: index, count: 0 };
            }
            finalBaseGroupsMap[baseName].count++;
        });

        const finalBaseGroups = Object.entries(finalBaseGroupsMap);

        if (chartData.length === 0) {
            return (
                <div className="bg-white rounded-lg shadow p-2 flex flex-col h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 14, fill: '#666' }}>
                                Aucune donnée disponible
                            </text>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        const maxValue = Math.max(...chartData.map(item => item.frequency));

        return (
            <div className="bg-white rounded-lg shadow p-2 flex flex-col h-[320px]">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
                <div className="flex-grow relative">
                    {/* Base name labels positioned to the left of each group */}
                    <div className="absolute" style={{ 
                        top: '20px', 
                        left: '15px', 
                        height: 'calc(100% - 40px)',
                        width: '90px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {finalBaseGroups.map(([baseName, groupInfo]) => {
                            const groupHeight = (groupInfo.count / finalChartData.length) * 100;
                            const topPosition = (groupInfo.start / finalChartData.length) * 100;
                            
                            return (
                                <div
                                    key={baseName}
                                    className="absolute flex items-center justify-center"
                                    style={{
                                        top: `${topPosition + 4}%`,
                                        height: `${groupHeight - 8}%`,
                                        width: '85px',
                                        fontSize: '9px',
                                        color: '#1F497D',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        paddingRight: '0px',
                                        borderTop: groupInfo.start > 0 ? '1px solid #1F497D' : 'none',
                                        borderTopWidth: groupInfo.start > 0 ? '1px' : '0',
                                        marginTop: groupInfo.start > 0 ? '-25px' : '0'
                                    }}
                                >
                                    <span style={{ 
                                        transform: 'rotate(-90deg)',
                                        transformOrigin: 'center',
                                        lineHeight: '1.1',
                                        display: 'block',
                                        height: '100%',
                                        width: '100%',
                                        whiteSpace: 'normal',
                                        wordWrap: 'break-word',
                                        textAlign: 'center',
                                        overflow: 'hidden',
                                        wordBreak: 'break-word',
                                        hyphens: 'auto'
                                    }}>
                                        {baseName.split(' ').map((word, i) => (
                                            <tspan key={i} x="0" dy={i === 0 ? "0" : "1.2em"}>{word}</tspan>
                                        ))}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                            data={finalChartData} 
                            layout="vertical"
                            margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis 
                                type="number" 
                                domain={[0, maxValue * 1.1]}
                                tickFormatter={(value) => this.formatTime(value)}
                            />
                            <YAxis 
                                type="category" 
                                dataKey="status"
                                interval={0}
                                tick={{ fontSize: 10 }}
                                width={60}
                            />
                            <Tooltip 
                                formatter={(value, _, props) => {
                                    if (props.payload?.isDummy) return [null, null];
                                    return [this.formatTime(value as number), 'Durée'];
                                }}
                                labelFormatter={(label, payload) => {
                                    if (payload?.[0]?.payload?.isDummy) return null;
                                    return `Véhicule: ${label}`;
                                }}
                            />
                            <Bar dataKey="frequency" radius={[0, 4, 4, 0]}>
                                <LabelList 
                                    content={this.renderCustomLabel}
                                />
                                {finalChartData.map((item, index: number) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={item.isDummy ? "transparent" : "#f3992bff"} 
                                        stroke={item.isDummy ? "transparent" : "#e67e22"} 
                                        strokeWidth={item.isDummy ? 0 : 1} 
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }
}