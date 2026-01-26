import { PureComponent } from "react";
import {
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Cell
} from "recharts";

interface VerticalStackedBarChartProps {
    data: any[];
    dataKey1: string;
    dataKey2?: string;
    label1: string;
    label2?: string;
    color1?: string;
    color2?: string;
    valueType?: 'number' | 'time' | 'percentage';
    title?: string;
    orientation?: 'vertical' | 'horizontal'; // Nouvelle prop pour l'orientation
}

export default class VerticalStackedBarChart extends PureComponent<VerticalStackedBarChartProps> {
    // Extract vehicle code from name (e.g., "V304I" from "Lundi - V304I - KALLA")
    extractVehicleCode = (fullName: string): string => {
        if (!fullName) return '';
        
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
        
        return '';
    };

    // Extract base name from the full name string
    extractBaseName = (fullName: string): string => {
        if (!fullName) return '';
        // Pattern: "Day - Vehicle - Base" -> extract Base
        const parts = fullName.split(' - ');
        if (parts.length >= 3) {
            return parts[parts.length - 1]; // Last part is the base name
        }
        return ''; // Return empty if format is different
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
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    };

    // Formatte les secondes en hh:mm:ss
    formatTime = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Normalise les valeurs pour le graphique
    normalizeValue = (value: any, _key: string): number => {
        const type = this.props.valueType || this.detectValueType(value);

        switch (type) {
            case 'time':
                return this.timeToSeconds(value);
            case 'percentage':
                return typeof value === 'string' ? parseFloat(value.replace('%', '')) : value;
            default:
                return typeof value === 'string' ? parseFloat(value) : value;
        }
    };

    // Formatte les valeurs pour l'affichage
    formatValue = (value: number, key: string): string => {
        const type = this.props.valueType || this.detectValueType(this.props.data[0]?.[key]);

        switch (type) {
            case 'time':
                return this.formatTime(value);
            case 'percentage':
                return `${Math.round(value)}%`;
            default:
                return value > 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString();
        }
    };

    render() {
        const {
            data,
            dataKey1,
            label1,
            color1 = "#f3992bff",
            title = "Graphique empilé vertical",
        } = this.props;

        if (!data || data.length === 0) {
            return (
                <div className="bg-white rounded-lg shadow p-2 flex flex-col h-[400px]">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
                    <div className="flex-grow flex items-center justify-center">
                        <p className="text-gray-500">Aucune donnée disponible</p>
                    </div>
                </div>
            );
        }

        // Aggregate data by vehicle code
        const aggregatedData: { [key: string]: any } = {};
        
        data.forEach(item => {
            const vehicleCode = this.extractVehicleCode(item.name);
            const baseName = this.extractBaseName(item.name);
            
            if (!vehicleCode || !baseName || vehicleCode === item.name) return;
            
            const uniqueKey = `${vehicleCode}-${baseName}`;
            
            if (!aggregatedData[uniqueKey]) {
                aggregatedData[uniqueKey] = {
                    name: vehicleCode,
                    baseName,
                    [dataKey1]: 0,
                };
            }
            
            aggregatedData[uniqueKey][dataKey1] += this.normalizeValue(item[dataKey1], dataKey1);
        });

        // Convert to array and sort
        const chartData = Object.values(aggregatedData)
            .filter(item => item[dataKey1] > 0)
            .sort((a, b) => {
                const baseCompare = a.baseName.localeCompare(b.baseName);
                if (baseCompare !== 0) return baseCompare;
                return a.name.localeCompare(b.name);
            });

        // Custom Y-axis tick to show base names as separators
        const CustomYAxisTick = (props: any) => {
            const { x, y, payload } = props;
            const item = chartData.find(d => d.name === payload.value);
            const index = chartData.findIndex(d => d.name === payload.value);
            const isFirstInGroup = index === 0 || chartData[index - 1].baseName !== item?.baseName;
            
            return (
                <g transform={`translate(${x},${y})`}>
                    {isFirstInGroup && (
                        <text 
                            x={-10} 
                            y={-15} 
                            textAnchor="end" 
                            fill="#1F497D" 
                            fontSize="10" 
                            fontWeight="bold"
                        >
                            {item?.baseName}
                        </text>
                    )}
                    <text 
                        x={-5} 
                        y={0} 
                        dy={3} 
                        textAnchor="end" 
                        fill="#1F497D" 
                        fontSize="11" 
                        fontWeight="bold"
                    >
                        {payload.value}
                    </text>
                </g>
            );
        };

        return (
            <div className="bg-white rounded-lg shadow p-2 flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-normal" style={{ color: '#1F497D' }}>{label1}</span>
                    <h3 className="text-lg font-semibold text-center flex-1" style={{ color: '#1F497D' }}>{title}</h3>
                    <span className="invisible text-sm">{label1}</span>
                </div>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="horizontal"
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                                type="number" 
                                tickFormatter={(value) => this.formatValue(value, dataKey1)}
                                tick={{ fontSize: 10, fill: '#1F497D' }}
                            />
                            <YAxis 
                                type="category" 
                                dataKey="name"
                                tick={<CustomYAxisTick />}
                                width={75}
                            />
                            <Tooltip 
                                formatter={(value) => [this.formatValue(Number(value), dataKey1), label1]}
                            />
                            <Bar dataKey={dataKey1} fill={color1}>
                                {chartData.map((entry, index) => {
                                    const isFirstInGroup = index === 0 || chartData[index - 1].baseName !== entry.baseName;
                                    return (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={color1}
                                            stroke={isFirstInGroup && index > 0 ? '#1F497D' : 'none'}
                                            strokeWidth={isFirstInGroup && index > 0 ? 2 : 0}
                                        />
                                    );
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }
}