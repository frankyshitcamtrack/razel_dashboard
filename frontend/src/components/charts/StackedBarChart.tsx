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
    data: any;
    dataKey1: string;
    dataKey2: string;
    label1: string;
    label2: string;
    color1?: string;
    color2?: string;
    isPercentage?: boolean;
    title?: string;
}

export default class StackedBarChart extends PureComponent<StackedBarChartProps> {
    render() {
        const {
            data,
            dataKey1,
            dataKey2,
            label1,
            label2,
            color1 = "#3b82f6",
            color2 = "#10b981",
            isPercentage = false,
            title = "Graphique",
        } = this.props;

        // Fonction pour formater les valeurs Y
        const formatYAxis = (value: number): string =>
            +   value > 1000 ? `${value / 1000}k` : value.toString();

        return (
            <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={data}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" axisLine={{ stroke: "#9ca3af" }} tick={{ fill: "#6b7280" }} />
                            <YAxis
                                tickFormatter={formatYAxis}
                                axisLine={{ stroke: "#9ca3af" }}
                                tick={{ fill: "#6b7280" }}
                            />
                            <Tooltip formatter={(value: number) => (isPercentage ? `${value}%` : value)} />
                            <Legend />
                            <Bar dataKey={dataKey1} stackId="a" fill={color1} name={label1} />
                            <Bar dataKey={dataKey2} stackId="a" fill={color2} name={label2} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }
}