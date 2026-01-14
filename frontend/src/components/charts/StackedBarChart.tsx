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

        // Prépare les données normalisées
        const chartData = data.map(item => {
            const normalizedItem: any = {
                ...item,
                [dataKey1]: this.normalizeValue(item[dataKey1], dataKey1),
            };

            // Normalise dataKey2 seulement s'il est présent
            if (dataKey2 && item[dataKey2] !== undefined) {
                normalizedItem[dataKey2] = this.normalizeValue(item[dataKey2], dataKey2);
            }

            return normalizedItem;
        });

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
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
                    <div className="flex flex-col text-sm text-right">
                        <div className="flex items-center justify-end mb-1">
                            <div className="w-3 h-3 mr-2" style={{ backgroundColor: color1 }}></div>
                            <span>{label1}</span>
                        </div>
                        {label2 && (
                            <div className="flex items-center justify-end">
                                <div className="w-3 h-3 mr-2" style={{ backgroundColor: color2 }}></div>
                                <span>{label2}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="name"
                                axisLine={{ stroke: "#9ca3af" }}
                                tick={{ fontSize: 11 }}
                                label={{ value: 'VE38A', position: 'insideBottom', offset: -5, fontSize: 12 }}
                            />
                            <YAxis
                                tickFormatter={(value) => this.formatValue(value, dataKey1)}
                                axisLine={{ stroke: "#9ca3af" }}
                                tick={{ fill: "#6b7280" }}
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
                                <LabelList dataKey={dataKey1} position="center" fill="#ffffff" fontSize={12} fontWeight="bold" />
                            </Bar>

                            {/* Deuxième bar - seulement si dataKey2 est présent */}
                            {dataKey2 && (
                                <Bar
                                    dataKey={dataKey2}
                                    stackId="a"
                                    fill={color2}
                                    name={label2 || dataKey2} // Fallback si label2 non fourni
                                >
                                    <LabelList dataKey={dataKey2} position="center" fill="#ffffff" fontSize={12} fontWeight="bold" />
                                </Bar>

                            )}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }
}