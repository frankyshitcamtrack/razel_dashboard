import { PureComponent } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
} from "recharts";

interface StackedBarChartProps {
    data: any[];
    dataKey1: string;
    dataKey2?: string; // Maintenant optionnel
    label1: string;
    label2?: string; // Optionnel aussi car dépend de dataKey2
    color1?: string;
    color2?: string;
    valueType?: 'number' | 'time' | 'percentage';
    title?: string;
}

export default class StackedBarChart extends PureComponent<StackedBarChartProps> {
    // Custom label component for time values - first bar
    renderTimeLabel1 = (props: any) => {
        const { x, y, width, height, value, index } = props;
        if (!value || value <= 0 || index === undefined) return null;
        
        // Get the original data item
        const dataItem = this.props.data[index];
        const actualValue = dataItem?.[this.props.dataKey1];
        if (!actualValue) return null;
        
        return (
            <text
                x={x + width / 2}
                y={y + height / 2}
                fill="white"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="bold"
            >
                {actualValue}
            </text>
        );
    };

    // Custom label component for time values - second bar
    renderTimeLabel2 = (props: any) => {
        const { x, y, width, height, value, index } = props;
        if (!value || value <= 0 || index === undefined || !this.props.dataKey2) return null;
        
        // Get the original data item
        const dataItem = this.props.data[index];
        const actualValue = dataItem?.[this.props.dataKey2];
        if (!actualValue) return null;
        
        return (
            <text
                x={x + width / 2}
                y={y + height / 2}
                fill="white"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="bold"
            >
                {actualValue}
            </text>
        );
    };

    // Custom label component for percentage values - first bar
    renderPercentageLabel1 = (props: any) => {
        const { x, y, width, height, value, index } = props;
        if (!value || value <= 0 || index === undefined) return null;
        
        // Get the original data item
        const dataItem = this.props.data[index];
        const actualValue = dataItem?.[this.props.dataKey1];
        if (!actualValue || actualValue <= 0) return null;
        
        return (
            <text
                x={x + width / 2}
                y={y + height / 2}
                fill="white"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="bold"
            >
                {Math.round(actualValue)}%
            </text>
        );
    };

    // Custom label component for percentage values - second bar
    renderPercentageLabel2 = (props: any) => {
        const { x, y, width, height, value, index } = props;
        if (!value || value <= 0 || index === undefined || !this.props.dataKey2) return null;
        
        // Get the original data item
        const dataItem = this.props.data[index];
        const actualValue = dataItem?.[this.props.dataKey2];
        if (!actualValue || actualValue <= 0) return null;
        
        return (
            <text
                x={x + width / 2}
                y={y + height / 2}
                fill="white"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="bold"
            >
                {Math.round(actualValue)}%
            </text>
        );
    };

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
    formatValue = (value: number, key: string): string => {
        if (value === undefined || value === null || isNaN(value)) return '0';
        
        const firstDataItem = this.props.data?.[0];
        const type = this.props.valueType || (firstDataItem?.[key] ? this.detectValueType(firstDataItem[key]) : 'number');

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
            color1 = "#002060",
            color2 = "#FAA330",
            title = "Graphique",
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

        // Check if this is time-based data (simple names like "lun. 5") vs vehicle-based data
        const isTimeBased = data.every(item => 
            item.name && !item.name.includes(' - ') && item.name.match(/^[a-z]{3}\. \d+$/)
        );

        if (isTimeBased) {
            // Handle time-based data directly without vehicle parsing
            const chartData = data
                .filter(item => item && item.name && item[dataKey1] !== undefined && item[dataKey1] !== null)
                .map(item => ({
                    name: item.name,
                    [dataKey1]: this.normalizeValue(item[dataKey1], dataKey1),
                    ...(dataKey2 && item[dataKey2] !== undefined && item[dataKey2] !== null && { [dataKey2]: this.normalizeValue(item[dataKey2], dataKey2) })
                }));

            const formatTooltip = (value: number, name: string) => {
                let dataKey = dataKey1;
                if (dataKey2 && name === label2) {
                    dataKey = dataKey2;
                }
                return [this.formatValue(value, dataKey), name];
            };

            return (
                <div className="bg-white rounded-lg shadow p-2 flex flex-col h-[320px]">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-normal" style={{ color: '#1F497D' }}>{label1}</span>
                        <h3 className="text-sm font-normal text-right" style={{ color: '#1F497D' }}>{title}</h3>
                    </div>
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={{ stroke: "#9ca3af" }}
                                    tick={{ fill: "#1F497D", fontSize: 11, fontWeight: "bold" }}
                                />
                                <YAxis
                                    tickFormatter={(value) => this.formatValue(value, dataKey1)}
                                    axisLine={{ stroke: "#9ca3af" }}
                                    tick={{ fill: "#1F497D" }}
                                />
                                <Tooltip formatter={formatTooltip} />
                                <Bar
                                    dataKey={dataKey1}
                                    stackId="a"
                                    fill={color1}
                                    name={label1}
                                >
                                    {this.props.valueType === 'time' && (
                                        <LabelList content={this.renderTimeLabel1} />
                                    )}
                                    {this.props.valueType === 'percentage' && (
                                        <LabelList content={this.renderPercentageLabel1} />
                                    )}
                                </Bar>
                                {dataKey2 && (
                                    <Bar
                                        dataKey={dataKey2}
                                        stackId="a"
                                        fill={color2}
                                        name={label2 || dataKey2}
                                    >
                                        {this.props.valueType === 'time' && (
                                            <LabelList content={this.renderTimeLabel2} />
                                        )}
                                        {this.props.valueType === 'percentage' && (
                                            <LabelList content={this.renderPercentageLabel2} />
                                        )}
                                    </Bar>
                                )}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            );
        }

        // Prépare les données normalisées et agrégées par véhicule
        const aggregatedData: { [key: string]: any } = {};
        const hasDateFields = data.some(item => item.date_depart);
        
        data.forEach(item => {
            // Skip items without valid data
            if (!item || !item.name || item[dataKey1] === undefined || item[dataKey1] === null) return;
            
            const vehicleCode = this.extractVehicleCode(item.name);
            const baseName = this.extractBaseName(item.name);
            
            // Skip items that couldn't be properly parsed
            if (vehicleCode === 'Unknown' || baseName === 'Unknown') return;
            
            // Use only vehicle code as key to aggregate all data for each vehicle
            const key = vehicleCode;
            
            if (!aggregatedData[key]) {
                aggregatedData[key] = {
                    name: vehicleCode,
                    vehicleCode,
                    baseName, // Use the first base name encountered
                    [dataKey1]: 0,
                };
                if (dataKey2) {
                    aggregatedData[key][dataKey2] = 0;
                }
                if (hasDateFields && item.date_depart) {
                    aggregatedData[key].minDate = item.date_depart;
                    aggregatedData[key].maxDate = item.date_depart;
                }
            }
            
            // Track min and max dates only if date fields exist
            if (hasDateFields && item.date_depart) {
                if (new Date(item.date_depart) < new Date(aggregatedData[key].minDate)) {
                    aggregatedData[key].minDate = item.date_depart;
                }
                if (new Date(item.date_depart) > new Date(aggregatedData[key].maxDate)) {
                    aggregatedData[key].maxDate = item.date_depart;
                }
            }
            
            const normalizedValue1 = this.normalizeValue(item[dataKey1], dataKey1);
            if (!isNaN(normalizedValue1)) {
                aggregatedData[key][dataKey1] += normalizedValue1;
            }
            if (dataKey2 && item[dataKey2] !== undefined && item[dataKey2] !== null) {
                const normalizedValue2 = this.normalizeValue(item[dataKey2], dataKey2);
                if (!isNaN(normalizedValue2)) {
                    aggregatedData[key][dataKey2] += normalizedValue2;
                }
            }
        });

        // Format time range for each vehicle only if dates exist
        if (hasDateFields) {
            Object.values(aggregatedData).forEach((item: any) => {
                if (item.minDate && item.maxDate) {
                    const minTime = new Date(item.minDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    const maxTime = new Date(item.maxDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    item.timeRange = `${minTime} à ${maxTime}`;
                }
            });
        }

        // Filter out items with no valid data and sort
        const chartData = Object.values(aggregatedData)
            .filter((item: any) => item[dataKey1] > 0 || (dataKey2 && item[dataKey2] > 0))
            .sort((a: any, b: any) => {
                const baseCompare = a.baseName.localeCompare(b.baseName);
                if (baseCompare !== 0) return baseCompare;
                return a.vehicleCode.localeCompare(b.vehicleCode);
            });

        // Group data by base name with correct positioning
        const baseGroupsMap: { [key: string]: { start: number; count: number } } = {};
        chartData.forEach((item: any, index: number) => {
            const baseName = item.baseName;
            if (!baseGroupsMap[baseName]) {
                baseGroupsMap[baseName] = { start: index, count: 0 };
            }
            baseGroupsMap[baseName].count++;
        });

        const baseGroups = Object.entries(baseGroupsMap);

        // Formatteur pour le tooltip
        const formatTooltip = (value: number, name: string) => {
            let dataKey = dataKey1;
            if (dataKey2 && name === label2) {
                dataKey = dataKey2;
            }
            return [this.formatValue(value, dataKey), name];
        };

        return (
            <div className="bg-white rounded-lg shadow p-2 flex flex-col h-[320px]">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-normal" style={{ color: '#1F497D' }}>{label1}</span>
                    <h3 className="text-sm font-normal text-right" style={{ color: '#1F497D' }}>{title}</h3>
                </div>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: hasDateFields ? 80 : 60 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="vehicleCode"
                                axisLine={{ stroke: "#9ca3af" }}
                                tick={{ fill: "#1F497D", fontSize: 11, fontWeight: "bold" }}
                            />
                            <YAxis
                                tickFormatter={(value) => this.formatValue(value, dataKey1)}
                                axisLine={{ stroke: "#9ca3af" }}
                                tick={{ fill: "#1F497D" }}
                            />
                            <Tooltip
                                formatter={formatTooltip}
                                labelFormatter={(label) => `Période: ${label}`}
                            />

                            {/* Premier bar - toujours présent */}
                            <Bar
                                dataKey={dataKey1}
                                stackId="a"
                                fill={color1}
                                name={label1}
                            >
                                {this.props.valueType === 'time' && (
                                    <LabelList content={this.renderTimeLabel1} />
                                )}
                                {this.props.valueType === 'percentage' && (
                                    <LabelList content={this.renderPercentageLabel1} />
                                )}
                            </Bar>

                            {/* Deuxième bar - seulement si dataKey2 est présent */}
                            {dataKey2 && (
                                <Bar
                                    dataKey={dataKey2}
                                    stackId="a"
                                    fill={color2}
                                    name={label2 || dataKey2}
                                >
                                    {this.props.valueType === 'time' && (
                                        <LabelList content={this.renderTimeLabel2} />
                                    )}
                                    {this.props.valueType === 'percentage' && (
                                        <LabelList content={this.renderPercentageLabel2} />
                                    )}
                                </Bar>
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                    {/* Time range labels - only show if dates exist */}
                    {hasDateFields && (
                        <div className="relative" style={{ height: '60px', marginTop: '-95px' }}>
                            <div className="absolute inset-0" style={{ left: '80px', right: '40px' }}>
                                {chartData.map((item: any, index: number) => {
                                    const totalWidth = 100;
                                    const itemWidth = (1 / chartData.length) * totalWidth;
                                    const leftPosition = (index / chartData.length) * totalWidth;
                                    const fontSize = chartData.length > 4 ? '8px' : '9px';
                                    
                                    // Split time range into parts
                                    const timeRange = item.timeRange || '';
                                    const parts = timeRange.split(' à ');
                                    const startTime = parts[0] || '';
                                    const endTime = parts[1] || '';
                                    
                                    return (
                                        <div
                                            key={`time-${item.vehicleCode}`}
                                            className="absolute flex flex-col items-center justify-center"
                                            style={{
                                                left: `${leftPosition}%`,
                                                width: `${itemWidth}%`,
                                                height: '60px',
                                                fontSize: fontSize,
                                                color: '#000000',
                                                fontWeight: '600',
                                                textAlign: 'center',
                                                lineHeight: '1.2',
                                                padding: '0 1px'
                                            }}
                                        >
                                            <div>{startTime}</div>
                                            <div style={{ fontSize: '7px' }}>à</div>
                                            <div>{endTime}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {/* Base name labels with exact chart alignment */}
                    <div className="relative" style={{ height: '40px', marginTop: hasDateFields ? '35px' : '-35px' }}>
                        <div className="absolute inset-0" style={{ left: '80px', right: '40px' }}>
                            {baseGroups.map(([baseName, groupInfo]) => {
                                const totalWidth = 100;
                                const groupWidth = (groupInfo.count / chartData.length) * totalWidth;
                                const leftPosition = (groupInfo.start / chartData.length) * totalWidth;
                                
                                return (
                                    <div
                                        key={baseName}
                                        className="absolute flex items-center justify-center"
                                        style={{
                                            left: `${leftPosition}%`,
                                            width: `${groupWidth}%`,
                                            height: '40px',
                                            fontSize: '9px',
                                            color: '#1F497D',
                                            fontWeight: 'bold',
                                            borderLeft: groupInfo.start > 0 ? '2px solid #1F497D' : 'none',
                                            textAlign: 'center',
                                            padding: '0 2px',
                                            lineHeight: '1.2'
                                        }}
                                    >
                                        <span style={{ wordBreak: 'break-word' }}>{baseName}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}