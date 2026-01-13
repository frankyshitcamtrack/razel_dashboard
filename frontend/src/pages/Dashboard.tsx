import Sidebar from "../components/layout/SideBar";
import GlobalFilterBar from "../components/filters/GlobalFilterBars";
import { useState } from "react";
//import CustomBarChart from "../components/charts/BarChart";
import { useFilters } from "../store/GlobalFiltersContext";
import PieChartComponent from "../components/charts/PieChart";
import CombinedChartComponent from "../components/charts/CombinedChart";
import StackedBarChart from "../components/charts/StackedBarChart";
import { useHeureMoteurData } from "../hooks/useHeureMoteurData";
import { useExceptions } from "../hooks/useExceptions";
import HamburgerButton from "../components/UI/HamburgerButton";
/* import CombinedChartTimeComponent from "../components/charts/CombinedChartTime"; */
import CombinedBarChartTimeComponent from "../components/charts/CombinedBarChartTime";
import { VehicleLoadingSpinner } from "../components/UI/LoadingSpinner";
/* import LineChartComponent from "../components/charts/LineChart"; */

const Dashboard = () => {
    const { filters, setFilters, isInitialized } = useFilters();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { data, isLoading } = useHeureMoteurData(filters);
    const { data: exceptions } = useExceptions(filters);

    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-gray-100 flex">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="w-full flex justify-center items-center">
                    <VehicleLoadingSpinner />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="w-full">
                <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <HamburgerButton
                            isOpen={sidebarOpen}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        />
                        <span className="text-lg font-semibold text-gray-800">Tableau de bord</span>
                        <div className="w-6"></div> {/* Pour l'équilibrage */}
                    </div>
                </header>
                <main className="pl-4 pr-4 pt-4 pb-4">
                    <GlobalFilterBar filters={filters} setFilters={setFilters} />

                    {/* Section 1 : Stack Bar Charts (2 colonnes) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden lg:-ml-65 lg:pl-0">
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
                                        dataKey1="usage"
                                        dataKey2="stops"
                                        label1="Durée d'utilisation réelle"
                                        label2="Arrêts moteur tournant"
                                        color1="#002060"
                                        color2="#FAA330"
                                        valueType="time"
                                        title="Arrêts moteur vs Durée d'utilisation"
                                    />
                                )}
                                {data?.engineDataPercentage && (
                                    <StackedBarChart
                                        data={data.engineDataPercentage}
                                        dataKey1="usage"
                                        dataKey2="stops"
                                        label1="% temps d'utilisation réel"
                                        label2="% Arrêts moteur tournant"
                                        color1="#002060"
                                        color2="#FAA330"
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
