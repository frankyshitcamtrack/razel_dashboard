import { useState } from "react";
import Sidebar from "../components/layout/SideBar";
import GlobalFilterBar from "../components/filters/GlobalFilterBars";
import CustomBarChart from "../components/charts/BarChart";
import PieChartComponent from "../components/charts/PieChart";
import CombinedChartComponent from "../components/charts/CombinedChart";
import StackedBarChart from "../components/charts/StackedBarChart";
import { useHeureMoteurData } from "../hooks/useHeureMoteurData";
import { useExceptions } from "../hooks/useExceptions";
import CombinedChartTimeComponent from "../components/charts/CombinedChartTime";
import type { Filters } from "../components/filters/GlobalFilterBars";

const Dashboard = () => {
    const [filters, setFilters] = useState<Filters>({
        date1: '2025-07-01',
        date2: '2025-07-31',
        vehicle: 68,
        groupBy: "day",
        vcleGroupId: 1
    });

    const { data, isLoading } = useHeureMoteurData(filters);
    const { data: exceptions, isLoading: exceptionsLoading } = useExceptions(filters);



    return (
        <div className="min-h-screen bg-gray-100 flex">
            <Sidebar />
            <div className="w-full">
                <main className="p-6">
                    <GlobalFilterBar filters={filters} setFilters={setFilters} />

                    {/* Section 1 : Stack Bar Charts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        {isLoading ? (
                            <>
                                <DonutSkeleton />
                                <DonutSkeleton />
                            </>
                        ) : (
                            <>
                                {data?.engineData && (
                                    <StackedBarChart
                                        data={data.engineData}
                                        dataKey1="stops"
                                        dataKey2="usage"
                                        label1="Arrêts moteur"
                                        label2="Durée d'utilisation"
                                        color1="#3b82f6"
                                        color2="#10b981"
                                        valueType="time"
                                        title="Arrêts moteur vs Durée d'utilisation"
                                    />
                                )}
                                {data?.engineDataPercentage && (
                                    <StackedBarChart
                                        data={data.engineDataPercentage}
                                        dataKey1="stops"
                                        dataKey2="usage"
                                        label1="Arrêts moteur"
                                        label2="Durée d'utilisation"
                                        color1="#8b5cf6"
                                        color2="#ec4899"
                                        valueType="percentage"
                                        title="Arrêts moteur vs Durée d'utilisation (%)"
                                    />
                                )}
                            </>
                        )}
                    </div>

                    {/* Section 2 : Pie + 2 combined */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        {isLoading ? (
                            <DonutSkeleton />
                        ) : (
                            <PieChartComponent
                                title="Consommation journalière par moteur"
                                data={data?.DaylyConsommationData}
                            />
                        )}

                        {isLoading ? (
                            <DonutSkeleton />
                        ) : (
                            <CombinedChartTimeComponent
                                data={data?.dureeDistanceparcouru}
                                title="Distance parcourue et durée"
                                barLabel="Distance (km)"
                                lineLabel="Durée (heures)"
                            />
                        )}

                        {isLoading ? (
                            <DonutSkeleton />
                        ) : (
                            <CombinedChartComponent
                                data={data?.DistanConsommation}
                                title="Distance & Consommation"
                                barDataKey="distance"
                                barLabel="Distance (km)"
                                lineDataKey="consumption"
                                lineLabel="Consommation (L)"
                            />
                        )}
                    </div>

                    {/* Section 3 : autres bar charts (2 par ligne max) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        {isLoading ? (
                            <DonutSkeleton />
                        ) : (
                            data?.hundredKmConsumption && (
                                <CustomBarChart
                                    data={data.hundredKmConsumption}
                                    title="Consommation au 100 km"
                                    dataKey1="value"
                                    label1="Consommation (L/100km)"
                                    color1="#3B82F6"
                                />
                            )
                        )}

                        {isLoading ? (
                            <DonutSkeleton />
                        ) : (
                            data?.ratioConsumption && (
                                <CustomBarChart
                                    data={data.ratioConsumption}
                                    title="Ratio consommation L/M"
                                    dataKey1="value"
                                    label1="L/M"
                                    color1="#3B82F6"
                                />
                            )
                        )}

                        {exceptionsLoading ? (
                            <DonutSkeleton />
                        ) : (
                            exceptions?.speeding && (
                                <CustomBarChart
                                    data={exceptions.speeding}
                                    title="Excès de vitesse"
                                    dataKey1="value"
                                    label1="Nombre d'excès de vitesse"
                                    color1="#3B82F6"
                                />
                            )
                        )}

                        {exceptionsLoading ? (
                            <DonutSkeleton />
                        ) : (
                            exceptions?.harshAccelerationBraking && (
                                <CombinedChartComponent
                                    data={exceptions.harshAccelerationBraking}
                                    title="Freinage & Acceleration"
                                    barDataKey="acceleration"
                                    barLabel="Somme des Accelerations"
                                    lineDataKey="braking"
                                    lineLabel="Somme de Freinage"
                                />
                            )
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

const DonutSkeleton = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
        <div className="bg-gray-100 rounded-xl w-full h-64 animate-pulse" />
    </div>
);

export default Dashboard;
