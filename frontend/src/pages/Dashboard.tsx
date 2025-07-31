import { useState } from "react";
import Sidebar from "../components/layout/SideBar";
import GlobalFilterBar from "../components/filters/GlobalFilterBars";
import CustomBarChart from "../components/charts/BarChart";
import PieChartComponent from "../components/charts/PieChart";
import CombinedChartComponent from "../components/charts/CombinedChart";
import StackedBarChart from "../components/charts/StackedBarChart";
import { useHeureMoteurData } from "../hooks/useHeureMoteurData";
import { useExceptions } from "../hooks/useExceptions";
/* import CombinedChartTimeComponent from "../components/charts/CombinedChartTime"; */
import CombinedBarChartTimeComponent from "../components/charts/CombinedBarChartTime";
import type { Filters } from "../components/filters/GlobalFilterBars";

const Dashboard = () => {
    const [filters, setFilters] = useState<Filters>({
        date1: '2025-07-01',
        date2: '2025-07-31',
        vehicle: 68,
        groupBy: "day",
        vcleGroupId: undefined
    });

    const { data, isLoading } = useHeureMoteurData(filters);
    const { data: exceptions, isLoading: exceptionsLoading } = useExceptions(filters);



    return (
        <div className="min-h-screen bg-gray-100 flex">
            <Sidebar />
            <div className="w-full">
                <main className="p-6">
                    <GlobalFilterBar filters={filters} setFilters={setFilters} />

                    {/* Section 1 : Stack Bar Charts (2 colonnes) */}
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
                                        color1="#02509D"
                                        color2="#F7D000"
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
                                        color1="#02509D"
                                        color2="#F7D000"
                                        valueType="percentage"
                                        title="Arrêts moteur vs Durée d'utilisation (%)"
                                    />
                                )}
                            </>
                        )}
                    </div>

                    <div className="col-span-full mb-8">
                        {isLoading ? (
                            <div className="h-[500px] flex items-center justify-center">
                                <DonutSkeleton />
                            </div>
                        ) : (
                            <PieChartComponent
                                title="Consommation journalière par moteur"
                                data={data?.DaylyConsommationData}
                                unit="L"
                                className="h-[500px]"
                            />
                        )}
                    </div>

                    {/* Section 3 : Combined Charts (2 colonnes) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        {isLoading ? (
                            <>
                                <DonutSkeleton />
                                <DonutSkeleton />
                            </>
                        ) : (
                            <>
                                <CombinedBarChartTimeComponent
                                    data={data?.dureeDistanceparcouru}
                                    title="Distance parcourue et durée"
                                    barLabel="Durée (heures)"
                                    lineLabel="Distance (km)"
                                />
                                <CombinedChartComponent
                                    data={data?.DistanConsommation}
                                    title="Distance & Consommation"
                                    barDataKey="distance"
                                    barLabel="Distance (km)"
                                    lineDataKey="consumption"
                                    lineLabel="Consommation (L)"
                                />
                            </>
                        )}
                    </div>

                    {/* Section 4 : Autres graphiques (2 colonnes) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        {isLoading ? (
                            <>
                                <DonutSkeleton />
                                <DonutSkeleton />
                            </>
                        ) : (
                            <>
                                {data?.hundredKmConsumption && (
                                    <CustomBarChart
                                        data={data.hundredKmConsumption}
                                        title="Consommation au 100 km"
                                        dataKey1="value"
                                        label1="Consommation (L/100km)"
                                        color1="#02509D"
                                    />
                                )}
                                {data?.ratioConsumption && (
                                    <CustomBarChart
                                        data={data.ratioConsumption}
                                        title="Ratio consommation L/M"
                                        dataKey1="value"
                                        label1="L/M"
                                        color1="#02509D"
                                    />
                                )}
                            </>
                        )}
                    </div>

                    {/* Section 5 : Exceptions (2 colonnes) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {exceptionsLoading ? (
                            <>
                                <DonutSkeleton />
                                <DonutSkeleton />
                            </>
                        ) : (
                            <>
                                {exceptions?.speeding && (
                                    <CustomBarChart
                                        data={exceptions.speeding}
                                        title="Excès de vitesse"
                                        dataKey1="value"
                                        label1="Nombre d'excès de vitesse"
                                        color1="#02509D"
                                    />
                                )}
                                {exceptions?.harshAccelerationBraking && (
                                    <CombinedChartComponent
                                        data={exceptions.harshAccelerationBraking}
                                        title="Freinage & Acceleration"
                                        barDataKey="acceleration"
                                        barLabel="Somme des Accelerations"
                                        lineDataKey="braking"
                                        lineLabel="Somme de Freinage"
                                    />
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

const DonutSkeleton = () => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center`}>
        <div className="bg-gray-100 rounded-xl w-full h-64 animate-pulse" />
    </div>
);

export default Dashboard;
