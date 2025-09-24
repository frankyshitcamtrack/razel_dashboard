import React from "react";
import {
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
    LabelList,
} from "recharts";


interface BarChartProps {
    data?: any;
    title: string;
    dataKey1: string;
    label1: string;
    dataKey2?: string;
    label2?: string;
    color1?: string;
    color2?: string;
    percentage?: boolean;
    isTimeBased?: boolean;
}

const CustomBarChart: React.FC<BarChartProps> = ({
    data,
    title,
    dataKey1,
    label1,
    dataKey2,
    label2,
    color1,
    color2,
    percentage = false,
    //isTimeBased = false,
}) => {
    // Convertir les secondes en hh:mm:ss si nécessaire
    /*    const formatYAxis = (value: number) => {
           if (isTimeBased) {
               const hours = Math.floor(value / 3600);
               const minutes = Math.floor((value % 3600) / 60);
               return `${hours}:${minutes.toString().padStart(2, "0")}`;
           }
           return value;
       }; */



    return (
        <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" axisLine={{ stroke: "#9ca3af" }} tick={{ fill: "#6b7280", fontSize: 11 }} />
                        <YAxis
                            yAxisId="left"
                            tickFormatter={percentage ? (val) => `${val}%` : (val) => val.toString()}
                            axisLine={{ stroke: "#9ca3af" }}
                            tick={{ fill: "#6b7280", fontSize: 11 }}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey={dataKey1} name={label1} fill={color1} >
                            <LabelList dataKey={dataKey1} position="center" fill="#000" fontSize={12} fontWeight="bold" />
                        </Bar>
                        {dataKey2 && (
                            <Bar yAxisId="left" dataKey={dataKey2} name={label2} fill={color2} >
                                <LabelList dataKey={dataKey2} position="center" fill="#000" fontSize={12} />
                            </Bar>
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CustomBarChart;