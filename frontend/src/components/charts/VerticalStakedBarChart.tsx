import { PureComponent } from "react";

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
    // Extract vehicle code from name (e.g., "V304I" from "V304I-VL CDF - KALLA")
    extractVehicleCode = (fullName: string): string => {
        const match = fullName.match(/V[A-Z0-9]+/);
        return match ? match[0] : fullName;
    };

    // Extract base name from the full name string
    extractBaseName = (fullName: string): string => {
        // Pattern: "Day - Vehicle - Base" -> extract Base
        const parts = fullName.split(' - ');
        if (parts.length >= 3) {
            return parts[parts.length - 1]; // Last part is the base name
        }
        return '';
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
            dataKey2,
            label1,
            color1 = "#3b82f6",
            title = "Graphique empilé vertical",
        } = this.props;

        // Vérification des données
        if (!data || data.length === 0) {
            return (
                <div className="bg-white rounded-lg shadow p-2 flex flex-col h-[320px]">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
                    <div className="flex-grow flex items-center justify-center">
                        <p className="text-gray-500">Aucune donnée disponible</p>
                    </div>
                </div>
            );
        }

        // Prépare les données normalisées et groupées par base
        // Aggregate data by vehicle code (sum across all days)
        const aggregatedData: { [key: string]: any } = {};
        
        data.forEach(item => {
            const vehicleCode = this.extractVehicleCode(item.name);
            const baseName = this.extractBaseName(item.name);
            
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
            
            // Sum the values
            aggregatedData[vehicleCode][dataKey1] += this.normalizeValue(item[dataKey1], dataKey1);
            if (dataKey2 && item[dataKey2] !== undefined) {
                aggregatedData[vehicleCode][dataKey2] += this.normalizeValue(item[dataKey2], dataKey2);
            }
        });

        // Convert to array and sort by base name, then by vehicle code
        const chartData = Object.values(aggregatedData).sort((a, b) => {
            const baseCompare = a.baseName.localeCompare(b.baseName);
            if (baseCompare !== 0) return baseCompare;
            return a.vehicleCode.localeCompare(b.vehicleCode);
        });



        // Group data by base name for vertical labels with proper positioning
        const baseGroupsMap: { [key: string]: { start: number; count: number; items: any[] } } = {};
        chartData.forEach((item, index) => {
            if (!baseGroupsMap[item.baseName]) {
                baseGroupsMap[item.baseName] = { start: index, count: 0, items: [] };
            }
            baseGroupsMap[item.baseName].count++;
            baseGroupsMap[item.baseName].items.push(item);
        });



        const maxValue = Math.max(...chartData.map(item => item[dataKey1]));
        const barHeight = Math.max(18, Math.min(28, 220 / chartData.length)); // Increased minimum height
        const chartHeight = chartData.length * barHeight;

        return (
            <div className="bg-white rounded-lg shadow p-2 flex flex-col h-[320px]">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-normal" style={{ color: '#1F497D' }}>{label1}</span>
                    <h3 className="text-lg font-semibold text-center flex-1" style={{ color: '#1F497D' }}>{title}</h3>
                    <span className="invisible text-sm">{label1}</span>
                </div>
                <div className="flex-grow flex overflow-hidden">
                    <div className="flex">
                    {/* Base name labels with exact alignment */}
                    <div className="flex flex-col" style={{ width: '80px', minWidth: '80px', position: 'relative' }}>
                        {Object.entries(baseGroupsMap).map(([baseName, group]) => {
                            const groupHeight = group.count * barHeight;
                            const startPosition = group.start * barHeight;
                            const fontSize = Math.max(8, Math.min(11, groupHeight / 10));
                            
                            return (
                                <div 
                                    key={baseName}
                                    className="flex items-center justify-center" 
                                    style={{ 
                                        position: 'absolute',
                                        top: `${startPosition}px`,
                                        height: `${groupHeight}px`,
                                        width: '80px',
                                        fontSize: `${fontSize}px`,
                                        color: '#1F497D', 
                                        fontWeight: 'bold',
                                        writingMode: 'vertical-rl',
                                        textOrientation: 'mixed',
                                        transform: 'rotate(180deg)',
                                        overflow: 'hidden',
                                        textAlign: 'center',
                                        paddingRight: '2px'
                                    }}
                                >
                                    {baseName}
                                </div>
                            );
                        })}
                        <div style={{ height: `${chartHeight}px` }}></div>
                    </div>
                    
                    {/* Vehicle codes column - with clear separation */}
                    <div className="flex flex-col" style={{ width: '60px', minWidth: '60px' }}>
                        {chartData.map((item, index) => {
                            const isFirstInGroup = index === 0 || chartData[index - 1].baseName !== item.baseName;
                            const fontSize = Math.max(9, Math.min(12, barHeight * 0.4));
                            
                            return (
                                <div 
                                    key={item.vehicleCode}
                                    className="flex items-center justify-end" 
                                    style={{ 
                                        height: `${barHeight}px`,
                                        fontSize: `${fontSize}px`,
                                        color: '#1F497D', 
                                        fontWeight: 'bold',
                                        borderTop: isFirstInGroup && index > 0 ? '3px solid #1F497D' : '1px solid #e5e7eb',
                                        paddingRight: '4px',
                                        paddingTop: '3px',
                                        paddingBottom: '3px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end'
                                    }}
                                >
                                    <span style={{ 
                                        wordBreak: 'break-all',
                                        textAlign: 'right',
                                        lineHeight: '1.2'
                                    }}>
                                        {item.vehicleCode}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Chart area with proper value positioning */}
                    <div className="flex-1 overflow-hidden">
                        <svg width="100%" height="100%" viewBox={`0 0 450 ${chartHeight + 40}`} preserveAspectRatio="xMidYMid meet">
                            {/* Y-axis line */}
                            <line
                                x1={0}
                                y1={20}
                                x2={0}
                                y2={chartHeight + 20}
                                stroke="#9ca3af"
                                strokeWidth={1}
                            />
                            
                            {/* X-axis line */}
                            <line
                                x1={0}
                                y1={chartHeight + 20}
                                x2={350}
                                y2={chartHeight + 20}
                                stroke="#9ca3af"
                                strokeWidth={1}
                            />
                            
                            {/* Grid lines */}
                            {[0, 1, 2, 3, 4].map(i => {
                                const x = (i * 330 / 4);
                                return (
                                    <line
                                        key={`grid-${i}`}
                                        x1={x}
                                        y1={20}
                                        x2={x}
                                        y2={chartHeight + 20}
                                        stroke="#e5e7eb"
                                        strokeDasharray="3 3"
                                    />
                                );
                            })}
                            
                            {/* Bars and values */}
                            {chartData.map((item, index) => {
                                const y = 20 + index * barHeight;
                                const barWidth = (item[dataKey1] / maxValue) * 330;
                                
                                return (
                                    <g key={item.vehicleCode}>
                                        {/* Bar */}
                                        <rect
                                            x={0}
                                            y={y + 2}
                                            width={barWidth}
                                            height={barHeight - 4}
                                            fill={color1}
                                        />
                                        
                                        {/* Value label */}
                                        <text
                                            x={Math.min(barWidth + 5, 400)}
                                            y={y + barHeight / 2}
                                            dominantBaseline="middle"
                                            fontSize="9"
                                            fill="#1F497D"
                                            fontWeight="bold"
                                        >
                                            {this.formatValue(item[dataKey1], dataKey1)}
                                        </text>
                                    </g>
                                );
                            })}
                            
                            {/* X-axis labels */}
                            {[0, 1, 2, 3, 4].map(i => {
                                const x = (i * 330 / 4);
                                const value = (i * maxValue / 4);
                                return (
                                    <text
                                        key={`x-label-${i}`}
                                        x={x}
                                        y={chartHeight + 35}
                                        textAnchor="middle"
                                        fontSize="10"
                                        fill="#1F497D"
                                    >
                                        {this.formatValue(value, dataKey1)}
                                    </text>
                                );
                            })}
                        </svg>
                    </div>
                    </div>
                </div>
            </div>
        );
    }
}