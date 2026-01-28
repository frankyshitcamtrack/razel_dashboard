import Sidebar from "../components/layout/SideBar";
import GlobalFilterBar from "../components/filters/GlobalFilterBars";
import { useState, useEffect } from "react";
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
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarDropdownOpen, setSidebarDropdownOpen] = useState(true);
    const [filterExpanded, setFilterExpanded] = useState(true);
    const [filterGlobalExpanded, setFilterGlobalExpanded] = useState(false);
    const { data, isLoading } = useHeureMoteurData(filters);
    const { data: exceptions } = useExceptions(filters);

    useEffect(() => {
        if (data) {
            console.log('Dashboard data:', data);
            console.log('engineData:', data.engineData);
            console.log('engineDataPercentage:', data.engineDataPercentage);
        }
    }, [data]);

    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-gray-100 lg:flex">
                <Sidebar 
                    isOpen={sidebarOpen} 
                    onClose={() => setSidebarOpen(false)} 
                    isDropdownOpen={sidebarDropdownOpen} 
                    setIsDropdownOpen={setSidebarDropdownOpen}
                    setFilterExpanded={setFilterExpanded}
                    setFilterGlobalExpanded={setFilterGlobalExpanded}
                />
                <div className="w-full lg:flex-1 flex justify-center items-center">
                    <VehicleLoadingSpinner />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 lg:flex">
            <Sidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
                isDropdownOpen={sidebarDropdownOpen} 
                setIsDropdownOpen={setSidebarDropdownOpen}
                setFilterExpanded={setFilterExpanded}
                setFilterGlobalExpanded={setFilterGlobalExpanded}
            />
            <div className="w-full lg:flex-1">
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
                    <GlobalFilterBar 
                        filters={filters} 
                        setFilters={setFilters} 
                        setSidebarOpen={setSidebarOpen} 
                        setSidebarDropdownOpen={setSidebarDropdownOpen}
                        isExpanded={filterExpanded}
                        setIsExpanded={setFilterExpanded}
                        isExpandedGlobal={filterGlobalExpanded}
                        setIsExpandedGlobal={setFilterGlobalExpanded}
                    />

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
                                {data?.engineData && data.engineData.length > 0 && (
                                    <div key="engine-data">
                                        <StackedBarChart
                                            data={data.engineData}
                                            dataKey1="usage"
                                            dataKey2="stops"
                                            label1="Somme de Durée d'utilisation réelle"
                                            label2="Somme de Arrêts moteur tournant"
                                            color1="#002060"
                                            color2="#FAA330"
                                            valueType="time"
                                            title="Durée d'utilisation"
                                        />
                                    </div>
                                )}
                                {data?.engineDataPercentage && data.engineDataPercentage.length > 0 && (
                                    <div key="engine-percentage">
                                        <StackedBarChart
                                            data={data.engineDataPercentage}
                                            dataKey1="usage"
                                            dataKey2="stops"
                                            label1="Somme de % temps d'utilisation réel"
                                            label2="Somme de % Arrêts moteur tournant"
                                            color1="#002060"
                                            color2="#FAA330"
                                            valueType="percentage"
                                            title="% temps d'utilisation"
                                        />
                                    </div>
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
                                            title="Durée/Base"
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

                                {data?.hundredKmConsumption && (
                                    <CombinedChartComponent
                                        data={data.hundredKmConsumption}
                                        title="Consommation au 100 Km"
                                        barDataKey=""
                                        barLabel=""
                                        lineDataKey="value"
                                        lineLabel="L/100km"
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
                                {data?.DistanConsommation && (
                                    <CombinedChartComponent
                                        data={data.DistanConsommation}
                                        title="Historique Transit"
                                        barDataKey="distance"
                                        barLabel="Distance Transit"
                                        lineDataKey="consumption"
                                        lineLabel="Durée Transit"
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
