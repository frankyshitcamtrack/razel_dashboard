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


const Dashboard = () => {
    const [filters, setFilters] = useState({
        date1: '2025-07-01',
        date2: '2025-07-31',
        vehicle: 68,
    });

    const { data, error: _, isLoading, isError: ___ } = useHeureMoteurData(filters);
    const { data: exceptions, isLoading: exceptionsLoading } = useExceptions(filters);


    return (
        <div className="min-h-screen bg-gray-100 flex">
            <Sidebar />
            <div className="w-full">
                {/*    <Header title="Tableau de bord - Gestion de flotte automobile" /> */}
                <main className="p-6">
                    <GlobalFilterBar filters={filters} setFilters={setFilters} />

                    {/* Graphe 1 & 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {isLoading && <DonutSkeleton />}
                        {isLoading && <DonutSkeleton />}
                        {
                            data?.engineData &&
                            <StackedBarChart
                                data={data?.engineData}
                                dataKey1="stops"
                                dataKey2="usage"
                                label1="Arrêts moteur"
                                label2="Durée d'utilisation"
                                color1="#3b82f6"
                                color2="#10b981"
                                valueType='time'
                                title="Arrêts moteur vs Durée d'utilisation"
                            />
                        }
                        {
                            data?.engineDataPercentage &&
                            <StackedBarChart
                                data={data?.engineDataPercentage}
                                dataKey1="stops"
                                dataKey2="usage"
                                label1="Arrêts moteur"
                                label2="Durée d'utilisation"
                                color1="#8b5cf6"
                                color2="#ec4899"
                                valueType='percentage'
                                title="Arrêts moteur vs Durée d'utilisation (%)"
                            />
                        }
                    </div>

                    {/* Graphe 3 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <div className="lg:col-span-1">
                            {isLoading && <DonutSkeleton />}
                            {data &&
                                <PieChartComponent
                                    title="Consommation journalière par moteur"
                                    data={data?.DaylyConsommationData}
                                />
                            }

                        </div>

                        {/* Graphe 4 & 5 */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {isLoading && <DonutSkeleton />}
                            {
                                data?.dureeDistanceparcouru &&
                                <CombinedChartTimeComponent
                                    data={data?.dureeDistanceparcouru}
                                    title="Distance parcourue et durée"
                                    barLabel="Distance (km)"
                                    lineLabel="Durée (heures)"
                                />
                            }

                            {isLoading && <DonutSkeleton />}

                            {
                                data?.DistanConsommation &&
                                <CombinedChartComponent
                                    data={data?.DistanConsommation}
                                    title="Distance & Consommation"
                                    barDataKey="distance"
                                    barLabel="Distance (km)"
                                    lineDataKey="consumption"
                                    lineLabel="Consommation (L)"
                                />
                            }

                        </div>
                    </div>

                    {/* Graphe 6 à 9 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {isLoading && <DonutSkeleton />}
                        {data?.hundredKmConsumption &&
                            <CustomBarChart
                                data={data?.hundredKmConsumption}
                                title="Consommation au 100 km"
                                dataKey1="value"
                                label1="Consommation (L/100km)"
                                color1="#3B82F6"
                            />
                        }
                        {isLoading && <DonutSkeleton />}
                        {
                            data?.ratioConsumption &&
                            <CustomBarChart
                                data={data?.ratioConsumption}
                                title="Ratio consommation L/M"
                                dataKey1="value"
                                label1="L/M"
                                color1="#3B82F6"
                            />

                        }


                        {
                            exceptionsLoading &&
                            <DonutSkeleton />
                        }

                        {
                            exceptions?.speeding &&
                            <CustomBarChart
                                data={exceptions?.speeding}
                                title="Excès de vitesse"
                                dataKey1="value"
                                label1="Nombre d'excès de vitesse"
                                color1="#3B82F6"
                            />
                        }

                        {exceptionsLoading && <DonutSkeleton />}

                        {
                            exceptions?.harshAccelerationBraking &&
                            <CombinedChartComponent
                                data={exceptions?.harshAccelerationBraking}
                                title="Freinage & Acceleration"
                                barDataKey="acceleration"
                                barLabel="Somme des Accelerations"
                                lineDataKey="braking"
                                lineLabel="Somme de Freinage"
                            />

                        }
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