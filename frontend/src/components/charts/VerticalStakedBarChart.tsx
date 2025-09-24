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

        // Prépare les données normalisées
        const chartData = data.map(item => {
            const normalizedItem: any = {
                ...item,
                [dataKey1]: this.normalizeValue(item[dataKey1], dataKey1),
            };

            if (dataKey2 && item[dataKey2] !== undefined) {
                normalizedItem[dataKey2] = this.normalizeValue(item[dataKey2], dataKey2);
            }

            return normalizedItem;
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

        return (
            <div className="bg-white rounded-lg shadow p-2 flex flex-col h-[320px]">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                            data={chartData}
                            layout={isVertical ? "vertical" : "horizontal"}
                            margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                            {/* Axe X - dépend de l'orientation */}
                            <XAxis
                                type={isVertical ? "number" : "category"}
                                dataKey={isVertical ? undefined : "name"}
                                axisLine={{ stroke: "#9ca3af" }}
                                tick={{ fill: "#6b7280", fontSize: 11 }}
                                tickFormatter={isVertical ? (value) => this.formatValue(value, dataKey1) : undefined}
                            />

                            {/* Axe Y - dépend de l'orientation */}
                            <YAxis
                                type={isVertical ? "category" : "number"}
                                dataKey={isVertical ? "name" : undefined}
                                width={isVertical ? 100 : 60}
                                axisLine={{ stroke: "#9ca3af" }}
                                tick={{ fill: "#6b7280", fontSize: 11 }}
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
                                <LabelList dataKey={dataKey1} position="center" fill="#000" fontSize={12} fontWeight="bold" />
                            </Bar>

                            {dataKey2 && (
                                <Bar
                                    dataKey={dataKey2}
                                    stackId="a"
                                    fill={color2}
                                    name={label2 || dataKey2}
                                >
                                    <LabelList dataKey={dataKey2} position="center" fill="#000" fontSize={12} fontWeight="bold" />
                                </Bar>
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }
}