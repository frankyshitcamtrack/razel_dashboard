import { useState } from "react";
import Sidebar from "../components/layout/SideBar";
import GlobalFilterBar from "../components/filters/GlobalFilterBars";
//import CustomBarChart from "../components/charts/BarChart";
import PieChartComponent from "../components/charts/PieChart";
import CombinedChartComponent from "../components/charts/CombinedChart";
import StackedBarChart from "../components/charts/StackedBarChart";
import { useHeureMoteurData } from "../hooks/useHeureMoteurData";
import { useExceptions } from "../hooks/useExceptions";
/* import CombinedChartTimeComponent from "../components/charts/CombinedChartTime"; */
import CombinedBarChartTimeComponent from "../components/charts/CombinedBarChartTime";
import type { Filters } from "../components/filters/GlobalFilterBars";
/* import LineChartComponent from "../components/charts/LineChart"; */

const Dashboard = () => {
    const [filters, setFilters] = useState<Filters>({
        date1: undefined,
        date2: undefined,
        vehicle: undefined,
        groupBy: undefined,
        vcleGroupId: undefined,
        weekDays: []
    });

    const { data, isLoading } = useHeureMoteurData(filters);
    const { data: exceptions } = useExceptions(filters);


    return (
        <div className="min-h-screen bg-gray-100 flex">
            <Sidebar />
            <div className="w-full">
                <main className="p-4">
                    <GlobalFilterBar filters={filters} setFilters={setFilters} />

                    {/* Section 1 : Stack Bar Charts (2 colonnes) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
                        {isLoading ? (
                            <>
                                <DonutSkeleton />
                                <DonutSkeleton />
                                <DonutSkeleton />
                                <DonutSkeleton />
                                <DonutSkeleton />
                                <DonutSkeleton />
                                <DonutSkeleton />
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
                                        color1="#F7D000"
                                        color2="#02509D"
                                        valueType="percentage"
                                        title="Arrêts moteur vs Durée d'utilisation (%)"
                                    />
                                )}

                                {
                                    data?.DistanConsommation && (
                                        <PieChartComponent
                                            title="Consommation journalière par moteur"
                                            data={data?.DaylyConsommationData}
                                            unit="L"
                                            className="h-[320px]"
                                            variant="pie"
                                        />
                                    )
                                }

                                {
                                    data?.dureeDistanceparcouru && (
                                        <CombinedBarChartTimeComponent
                                            data={data?.dureeDistanceparcouru}
                                            title="Distance parcourue et durée"
                                            barLabel="Durée (heures)"
                                            lineLabel="Distance (km)"
                                        />
                                    )
                                }

                                {
                                    data?.DistanConsommation && (
                                        <CombinedChartComponent
                                            data={data?.DistanConsommation}
                                            title="Distance & Consommation"
                                            barDataKey="distance"
                                            barLabel="Distance (km)"
                                            lineDataKey="consumption"
                                            lineLabel="Consommation (L)"
                                        />
                                    )
                                }

                                {exceptions?.speeding && (

                                    <CombinedChartComponent
                                        data={exceptions.speeding}
                                        title="Excès de vitesse"
                                        barDataKey=""
                                        barLabel=""
                                        lineDataKey="value"
                                        lineLabel="Nombre d'excès de vitesse"
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
                                {exceptions?.speeding && (

                                    <CombinedChartComponent
                                        data={exceptions.speeding}
                                        title="Excès de vitesse"
                                        barDataKey=""
                                        barLabel=""
                                        lineDataKey="value"
                                        lineLabel="Nombre d'excès de vitesse"
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
