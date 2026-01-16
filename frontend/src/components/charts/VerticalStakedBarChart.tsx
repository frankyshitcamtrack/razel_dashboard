import { PureComponent } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList,
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
            label2,
            color1 = "#3b82f6",
            color2 = "#10b981",
            // valueType = "time",
            title = "Graphique empilé vertical",
            orientation = 'vertical', // Par défaut vertical
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

        // Formatteur pour le tooltip
        const formatTooltip = (value: number, name: string) => {
            let dataKey = dataKey1;
            if (dataKey2 && name === (label2 || dataKey2)) {
                dataKey = dataKey2;
            }
            return [this.formatValue(value, dataKey), name];
        };

        // Configuration basée sur l'orientation
        const isVertical = orientation === 'vertical';

        // Custom grid to add horizontal separators between base groups
        const CustomGrid = (props: any) => {
            const { x, y, width, height } = props;
            const lines: React.ReactElement[] = [];
            
            let currentBase = '';
            chartData.forEach((item, index) => {
                if (currentBase && currentBase !== item.baseName) {
                    const yPos = y + (index / chartData.length) * height;
                    lines.push(
                        <line
                            key={`sep-${index}`}
                            x1={x}
                            y1={yPos}
                            x2={x + width}
                            y2={yPos}
                            stroke="#1F497D"
                            strokeWidth={2}
                        />
                    );
                }
                currentBase = item.baseName;
            });
            
            return <>{lines}</>;
        };

        // Group data by base name for vertical labels with proper positioning
        const baseGroupsMap: { [key: string]: { start: number; count: number; items: any[] } } = {};
        chartData.forEach((item, index) => {
            if (!baseGroupsMap[item.baseName]) {
                baseGroupsMap[item.baseName] = { start: index, count: 0, items: [] };
            }
            baseGroupsMap[item.baseName].count++;
            baseGroupsMap[item.baseName].items.push(item);
        });

        const baseGroups = Object.entries(baseGroupsMap);

        return (
            <div className="bg-white rounded-lg shadow p-2 flex flex-col h-[320px]">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-normal" style={{ color: '#1F497D' }}>{label1}</span>
                    <h3 className="text-lg font-semibold text-center flex-1" style={{ color: '#1F497D' }}>{title}</h3>
                    <span className="invisible text-sm">{label1}</span>
                </div>
                <div className="flex-grow relative">
                    {/* Vertical base name labels on the left */}
                    <div className="absolute left-0 top-5 bottom-5 flex flex-col justify-start" style={{ width: '120px', paddingRight: '10px' }}>
                        {baseGroups.map(([baseName, groupInfo]) => {
                            const heightPercent = (groupInfo.count / chartData.length) * 100;
                            const topPercent = (groupInfo.start / chartData.length) * 100;
                            return (
                                <div 
                                    key={baseName} 
                                    className="flex items-center justify-center" 
                                    style={{ 
                                        position: 'absolute',
                                        top: `${topPercent}%`,
                                        height: `${heightPercent}%`,
                                        width: '100%',
                                        writingMode: 'vertical-rl', 
                                        transform: 'rotate(180deg)', 
                                        fontSize: '10px', 
                                        color: '#1F497D', 
                                        fontWeight: 'bold',
                                        borderTop: groupInfo.start > 0 ? '2px solid #1F497D' : 'none'
                                    }}
                                >
                                    {baseName}
                                </div>
                            );
                        })}
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                            data={chartData}
                            layout={isVertical ? "vertical" : "horizontal"}
                            margin={{ top: 20, right: 30, left: 130, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <CustomGrid />

                            {/* Axe X - dépend de l'orientation */}
                            <XAxis
                                type={isVertical ? "number" : "category"}
                                dataKey={isVertical ? undefined : "name"}
                                axisLine={{ stroke: "#9ca3af" }}
                                tick={{ fill: "#1F497D", fontSize: 11 }}
                                tickFormatter={isVertical ? (value) => this.formatValue(value, dataKey1) : undefined}
                            />

                            {/* Axe Y - dépend de l'orientation */}
                            <YAxis
                                type={isVertical ? "category" : "number"}
                                dataKey={isVertical ? "vehicleCode" : undefined}
                                width={isVertical ? 60 : 60}
                                axisLine={{ stroke: "#9ca3af" }}
                                tick={{ fill: "#1F497D", fontSize: 11, fontWeight: "bold" }}
                                tickFormatter={!isVertical ? (value) => this.formatValue(value, dataKey1) : undefined}
                            />

                            <Tooltip
                                formatter={formatTooltip}
                                labelFormatter={(label) =>
                                    isVertical ? `Catégorie: ${label}` : `Période: ${label}`
                                }
                            />
                            <Legend />

                            {/* Barres empilées */}
                            <Bar
                                dataKey={dataKey1}
                                stackId="a"
                                fill={color1}
                                name={label1}
                            >
                                <LabelList 
                                    dataKey={dataKey1} 
                                    position="center" 
                                    fill="#1F497D" 
                                    fontSize={12} 
                                    fontWeight="bold"
                                    formatter={(value: any) => this.formatValue(Number(value), dataKey1)}
                                />
                            </Bar>

                            {dataKey2 && (
                                <Bar
                                    dataKey={dataKey2}
                                    stackId="a"
                                    fill={color2}
                                    name={label2 || dataKey2}
                                >
                                    <LabelList 
                                        dataKey={dataKey2} 
                                        position="center" 
                                        fill="#1F497D" 
                                        fontSize={12} 
                                        fontWeight="bold"
                                        formatter={(value: any) => this.formatValue(Number(value), dataKey2)}
                                    />
                                </Bar>
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }
}