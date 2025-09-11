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
} from "recharts";

interface StackedBarChartProps {
    data: any[];
    dataKey1: string;
    dataKey2: string;
    label1: string;
    label2: string;
    color1?: string;
    color2?: string;
    valueType?: 'number' | 'time' | 'percentage'; // Nouvelle prop
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
        const type = this.props.valueType || this.detectValueType(this.props.data[0][key]);

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
            title = "Graphique",
        } = this.props;

        // Prépare les données normalisées
        const chartData = data.map(item => ({
            ...item,
            [dataKey1]: this.normalizeValue(item[dataKey1], dataKey1),
            [dataKey2]: this.normalizeValue(item[dataKey2], dataKey2),
        }));



        return (
            <div className="bg-white rounded-lg shadow p-2 flex flex-col h-[320px]">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
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
                                tick={{ fill: "#6b7280" }}
                            />
                            <YAxis
                                tickFormatter={(value) => this.formatValue(value, dataKey1)}
                                axisLine={{ stroke: "#9ca3af" }}
                                tick={{ fill: "#6b7280" }}
                            />
                            <Tooltip
                                formatter={(value: number, name: string) => [
                                    this.formatValue(value, name === label1 ? dataKey1 : dataKey2),
                                    name
                                ]}
                                labelFormatter={(label) => `Période: ${label}`}
                            />
                            <Legend />
                            <Bar
                                dataKey={dataKey1}
                                stackId="a"
                                fill={color1}
                                name={label1}
                            />
                            <Bar
                                dataKey={dataKey2}
                                stackId="a"
                                fill={color2}
                                name={label2}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }
}