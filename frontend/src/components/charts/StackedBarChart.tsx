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
    // Custom label component for number values - first bar
    renderNumberLabel1 = (props: any) => {
        const { x, y, width, height, value, index } = props;
        if (!value || value <= 0 || index === undefined) return null;
        
        return (
            <text
                x={x + width / 2}
                y={y + height / 2}
                fill="black"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fontWeight="bold"
            >
                {value}
            </text>
        );
    };

    // Custom label component for time values - first bar
    renderTimeLabel1 = (props: any) => {
        const { x, y, width, height, value, index } = props;
        if (!value || value <= 0 || index === undefined) return null;
        
        // Use the normalized value (which represents the aggregated data) and format it
        const displayValue = this.formatTime(value);
        
        return (
            <text
                x={x + width / 2}
                y={y + height / 2}
                fill="black"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="bold"
            >
                {displayValue}
            </text>
        );
    };

    // Custom label component for time values - second bar
    renderTimeLabel2 = (props: any) => {
        const { x, y, width, height, value, index } = props;
        if (!value || value <= 0 || index === undefined || !this.props.dataKey2) return null;
        
        // Use the normalized value and format it - this is the aggregated value for the second segment
        const displayValue = this.formatTime(value);
        
        return (
            <text
                x={x + width / 2}
                y={y + height / 2}
                fill="black"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="bold"
            >
                {displayValue}
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

    // Extract vehicle code from vehicle_name field
    extractVehicleReference = (vehicleName: string): string => {
        if (!vehicleName) return 'Unknown';
        
        // Extract vehicle reference patterns like V507G, V484N, VC01G, etc.
        const patterns = [
            /^([A-Z]+\d+[A-Z]*)/, // Matches V507G, V484N, VC01G, VB07N, etc.
            /V[A-Z0-9]+/,         // Standard V pattern
            /[A-Z][0-9]+[A-Z]/,   // Alternative pattern
        ];
        
        for (const pattern of patterns) {
            const match = vehicleName.match(pattern);
            if (match) return match[1] || match[0];
        }
        
        return vehicleName.split('-')[0] || 'Unknown';
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

        // Check if this is the new data format with vehicle_name and vehicle_id
        const hasVehicleInfo = data.some(item => item.vehicle_name && item.vehicle_id);
        
        if (hasVehicleInfo) {
            // Handle new data format with vehicle grouping but keep time periods on X-axis
            const groupedByVehicle: { [key: string]: any[] } = {};
            
            // Group data by vehicle reference
            data.forEach(item => {
                if (!item || !item.vehicle_name || item[dataKey1] === undefined || item[dataKey1] === null) return;
                
                const vehicleRef = this.extractVehicleReference(item.vehicle_name);
                if (vehicleRef === 'Unknown') return;
                
                if (!groupedByVehicle[vehicleRef]) {
                    groupedByVehicle[vehicleRef] = [];
                }
                groupedByVehicle[vehicleRef].push(item);
            });
            
            // Create chart data with time periods but grouped by vehicle
            const chartData: any[] = [];
            const vehicleGroups: { [key: string]: { start: number; count: number } } = {};
            
            Object.entries(groupedByVehicle).forEach(([vehicleRef, vehicleData]) => {
                const startIndex = chartData.length;
                vehicleGroups[vehicleRef] = { start: startIndex, count: vehicleData.length };
                
                vehicleData.forEach(item => {
                    chartData.push({
                        name: item.name, // Keep time period name like "lun. 2"
                        vehicleRef,
                        [dataKey1]: this.normalizeValue(item[dataKey1], dataKey1),
                        [`${dataKey1}_original`]: item[dataKey1], // Store original value for labels
                        ...(dataKey2 && item[dataKey2] !== undefined && item[dataKey2] !== null && { 
                            [dataKey2]: this.normalizeValue(item[dataKey2], dataKey2),
                            [`${dataKey2}_original`]: item[dataKey2] // Store original value for labels
                        })
                    });
                });
            });
            
            const formatTooltip = (value: number, name: string, props: any) => {
                const dataItem = chartData[props.payload?.index];
                if (!dataItem) return [this.formatValue(value, dataKey1), name];
                
                let originalValue;
                if (name === label1) {
                    originalValue = dataItem[`${dataKey1}_original`];
                } else if (dataKey2 && name === (label2 || dataKey2)) {
                    originalValue = dataItem[`${dataKey2}_original`];
                } else {
                    originalValue = value;
                }
                
                // For time values, return the original time string directly
                // For other values, format appropriately
                if (this.props.valueType === 'time' && originalValue) {
                    return [originalValue, name];
                }
                
                return [originalValue || this.formatValue(value, dataKey1), name];
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
                                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={{ stroke: "#9ca3af" }}
                                    tick={{ fill: "#1F497D", fontSize: 11, fontWeight: "bold" }}
                                />
                                <YAxis
                                    domain={[0, 'dataMax']}
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
                                        <LabelList content={(props: any) => {
                                            const { x, y, width, height, index } = props;
                                            if (index === undefined) return null;
                                            const dataItem = chartData[index];
                                            if (!dataItem) return null;
                                            const originalValue = dataItem[`${dataKey1}_original`];
                                            if (originalValue === undefined || originalValue === null) return null;
                                            return (
                                                <text x={x + width / 2} y={y + height / 2} fill="black" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="bold">
                                                    {originalValue}
                                                </text>
                                            );
                                        }} />
                                    )}
                                    {this.props.valueType === 'percentage' && (
                                        <LabelList content={this.renderPercentageLabel1} />
                                    )}
                                    {this.props.valueType === 'number' && (
                                        <LabelList content={this.renderNumberLabel1} />
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
                                            <LabelList content={(props: any) => {
                                                const { x, y, width, height, index } = props;
                                                if (index === undefined || !dataKey2) return null;
                                                const dataItem = chartData[index];
                                                if (!dataItem) return null;
                                                const originalValue = dataItem[`${dataKey2}_original`];
                                                if (originalValue === undefined || originalValue === null) return null;
                                                return (
                                                    <text x={x + width / 2} y={y + height / 2} fill="black" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="bold">
                                                        {originalValue}
                                                    </text>
                                                );
                                            }} />
                                        )}
                                        {this.props.valueType === 'percentage' && (
                                            <LabelList content={this.renderPercentageLabel2} />
                                        )}
                                    </Bar>
                                )}
                            </BarChart>
                        </ResponsiveContainer>
                        {/* Vehicle reference labels below the chart */}
                        <div className="relative" style={{ height: '40px', marginTop: '-60px' }}>
                            <div className="absolute inset-0" style={{ left: '80px', right: '40px' }}>
                                {Object.entries(vehicleGroups).map(([vehicleRef, groupInfo]) => {
                                    const totalWidth = 100;
                                    const groupWidth = (groupInfo.count / chartData.length) * totalWidth;
                                    const leftPosition = (groupInfo.start / chartData.length) * totalWidth;
                                    
                                    return (
                                        <div
                                            key={vehicleRef}
                                            className="absolute flex items-center justify-center"
                                            style={{
                                                left: `${leftPosition}%`,
                                                width: `${groupWidth}%`,
                                                height: '40px',
                                                fontSize: '12px',
                                                color: '#1F497D',
                                                fontWeight: 'bold',
                                                borderLeft: groupInfo.start > 0 ? '2px solid #1F497D' : 'none',
                                                textAlign: 'center',
                                                padding: '0 2px',
                                                lineHeight: '1.2'
                                            }}
                                        >
                                            <span>{vehicleRef}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
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

            const formatTooltip = (value: number, name: string, props: any) => {
                // Get the original data item to show the correct aggregated values
                const dataItem = chartData[props.payload?.index];
                if (!dataItem) return [this.formatTime(value), name];
                
                // Use the actual aggregated value from the data item
                let actualValue;
                if (name === label1) {
                    actualValue = dataItem[dataKey1];
                } else if (dataKey2 && name === (label2 || dataKey2)) {
                    actualValue = dataItem[dataKey2];
                } else {
                    actualValue = value;
                }
                
                return [this.formatTime(actualValue), name];
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
                                    domain={[0, 'dataMax']}
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
                                    {this.props.valueType === 'number' && (
                                        <LabelList content={this.renderNumberLabel1} />
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
            
            const vehicleCode = this.extractVehicleReference(item.name);
            const baseName = this.extractBaseName(item.name);
            
            // Skip items that couldn't be properly parsed
            if (vehicleCode === 'Unknown' || baseName === 'Unknown') return;
            
            // Use composite key (vehicle + base) to keep vehicles separate by base
            const key = `${vehicleCode}-${baseName}`;
            
            if (!aggregatedData[key]) {
                aggregatedData[key] = {
                    name: vehicleCode,
                    vehicleCode,
                    baseName,
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
            .filter((item: any) => {
                // For single dataKey charts, show items even if value is 0
                if (!dataKey2) {
                    return item[dataKey1] !== undefined && item[dataKey1] !== null;
                }
                // For stacked charts, show if either value exists
                return item[dataKey1] > 0 || (dataKey2 && item[dataKey2] > 0);
            })
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

        // Create local label functions that have access to chartData
        const renderTimeLabel1Local = (props: any) => {
            const { x, y, width, height, index } = props;
            if (index === undefined) return null;
            
            const dataItem = chartData[index];
            if (!dataItem) return null;
            
            const actualValue = dataItem[dataKey1];
            if (actualValue === undefined || actualValue === null) return null;
            
            const displayValue = this.formatTime(actualValue);
            
            return (
                <text
                    x={x + width / 2}
                    y={y + height / 2}
                    fill="black"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontWeight="bold"
                >
                    {displayValue}
                </text>
            );
        };

        const renderTimeLabel2Local = (props: any) => {
            const { x, y, width, height, index } = props;
            if (index === undefined || !dataKey2) return null;
            
            const dataItem = chartData[index];
            if (!dataItem) return null;
            
            const actualValue = dataItem[dataKey2];
            if (actualValue === undefined || actualValue === null) return null;
            
            const displayValue = this.formatTime(actualValue);
            
            return (
                <text
                    x={x + width / 2}
                    y={y + height / 2}
                    fill="black"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontWeight="bold"
                >
                    {displayValue}
                </text>
            );
        };
        const formatTooltip = (value: number, name: string, props: any) => {
            // Get the original data item to show the correct aggregated values
            const dataItem = chartData[props.payload?.index];
            if (!dataItem) return [this.formatTime(value), name];
            
            // Use the actual aggregated value from the data item
            let actualValue;
            if (name === label1) {
                actualValue = dataItem[dataKey1];
            } else if (dataKey2 && name === (label2 || dataKey2)) {
                actualValue = dataItem[dataKey2];
            } else {
                actualValue = value;
            }
            
            return [this.formatTime(actualValue), name];
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
                                domain={[0, 'dataMax']}
                                tickFormatter={(value) => this.formatValue(value, dataKey1)}
                                axisLine={{ stroke: "#9ca3af" }}
                                tick={{ fill: "#1F497D" }}
                            />
                            <Tooltip
                                formatter={formatTooltip}
                                labelFormatter={(label) => `Véhicule: ${label}`}
                            />

                            {/* Premier bar - toujours présent */}
                            <Bar
                                dataKey={dataKey1}
                                stackId="a"
                                fill={color1}
                                name={label1}
                            >
                                {this.props.valueType === 'time' && (
                                    <LabelList content={renderTimeLabel1Local} />
                                )}
                                {this.props.valueType === 'percentage' && (
                                    <LabelList content={this.renderPercentageLabel1} />
                                )}
                                {this.props.valueType === 'number' && (
                                    <LabelList content={this.renderNumberLabel1} />
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
                                        <LabelList content={renderTimeLabel2Local} />
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