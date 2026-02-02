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

        // Process data to extract vehicle codes and aggregate durations
        const aggregatedData: { [key: string]: number } = {};
        
        data.forEach(item => {
            if (!item || !item.name || !item[dataKey1]) return;
            
            const vehicleCode = this.extractVehicleCode(item.name);
            if (vehicleCode === 'Unknown') return;
            
            const duration = this.timeToSeconds(item[dataKey1]);
            if (duration > 0) {
                aggregatedData[vehicleCode] = (aggregatedData[vehicleCode] || 0) + duration;
            }
        });

        const chartData = Object.entries(aggregatedData)
            .map(([vehicle, duration]) => ({
                status: vehicle,
                frequency: duration, // Keep as seconds
                timeLabel: this.formatTime(duration) // Add formatted time label
            }))
            .sort((a, b) => b.frequency - a.frequency);

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
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                            data={chartData} 
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
                            />
                            <Tooltip 
                                formatter={(value) => [this.formatTime(value as number), 'Durée']}
                                labelFormatter={(label) => `Véhicule: ${label}`}
                            />
                            <Bar dataKey="frequency" radius={[0, 4, 4, 0]}>
                                <LabelList 
                                    dataKey="timeLabel" 
                                    position="right"
                                    fill="#ffffff"
                                    fontSize={12} 
                                    fontWeight="bold"
                                />
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill="#f3992bff" stroke="#e67e22" strokeWidth={1} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }
}