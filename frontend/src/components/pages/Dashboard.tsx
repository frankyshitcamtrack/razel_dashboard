import { useState } from "react";
import Sidebar from "../layout/SideBar";
import GlobalFilterBar from "../filters/GlobalFilterBars";
import CustomBarChart from "../charts/BarChart";
import PieChartComponent from "../charts/PieChart";
import CombinedChartComponent from "../charts/CombinedChart";
import StackedBarChart from "../charts/StackedBarChart";
import { useHeureMoteurData } from "../../hooks/useHeureMoteurData";
import LoadingIndicator from "../UI/Loader";

const Dashboard = () => {
    const [filters, setFilters] = useState({
        date1: '2025-07-01',
        date2: '2025-07-31',
        id: 68,
    });

    const { data, error: _, isLoading, isError: ___ } = useHeureMoteurData(filters);


    //arret moteur / duree d'utilisation
    /*     const engineData = [
            { name: "Lun", stops: 4, usage: 5.1 },
            { name: "Mar", stops: 3, usage: 4.8 },
            { name: "Mer", stops: 5, usage: 4.5 },
            { name: "Jeu", stops: 2, usage: 5.0 },
            { name: "Ven", stops: 6, usage: 4.2 },
        ]; */

    //arret moteur / duree d'utilisation
    /*     const engineDataPercentage = [
            { name: "Lun", stops: 44, usage: 56 },
            { name: "Mar", stops: 39, usage: 61 },
            { name: "Mer", stops: 53, usage: 47 },
            { name: "Jeu", stops: 28, usage: 72 },
            { name: "Ven", stops: 58, usage: 42 },
        ]; */

    //duree et distance parcourue
    /*     const dureeDistanceparcouru = [
            { name: "Lun", duration: 360, distance: 120 },
            { name: "Mar", duration: 300, distance: 100 },
            { name: "Mer", duration: 420, distance: 130 },
            { name: "Jeu", duration: 240, distance: 90 },
            { name: "Ven", duration: 480, distance: 110 },
        ] */

    //distance parcourue et consommation
    /*    const DistanConsommation = [
           { name: "Lun", consumption: 360, distance: 120 },
           { name: "Mar", consumption: 300, distance: 100 },
           { name: "Mer", consumption: 420, distance: 130 },
           { name: "Jeu", consumption: 240, distance: 90 },
           { name: "Ven", consumption: 480, distance: 110 },
       ]
    */
    //consommation au 100km
    /*     const hundredKmConsumption = [
            { name: "Lun", value: 4 },
            { name: "Mar", value: 3 },
            { name: "Mer", value: 5 },
            { name: "Jeu", value: 2 },
            { name: "Ven", value: 6 }
        ] */

    //ration de consommation
    /*     const ratioConsumption = [
            { name: "Lun", value: 5 },
            { name: "Mar", value: 10 },
            { name: "Mer", value: 9 },
            { name: "Jeu", value: 5 },
            { name: "Ven", value: 4 }
        ]
     */

    //exces de vitess
    const speeding = [
        { name: "Lun", value: 2 },
        { name: "Mar", value: 4 },
        { name: "Mer", value: 18 },
        { name: "Jeu", value: 21 },
        { name: "Ven", value: 40 }
    ]



    return (
        <div className="min-h-screen bg-gray-100 flex">
            <Sidebar />
            <div className="w-full">
                {/*    <Header title="Tableau de bord - Gestion de flotte automobile" /> */}
                <main className="p-6">
                    <GlobalFilterBar filters={filters} setFilters={setFilters} />

                    {/* Graphe 1 & 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {isLoading && <LoadingIndicator />}
                        {isLoading && <LoadingIndicator />}
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
                                isPercentage
                                title="Arrêts moteur vs Durée d'utilisation (%)"
                            />
                        }
                    </div>

                    {/* Graphe 3 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <div className="lg:col-span-1">
                            {isLoading && <LoadingIndicator />}
                            {data &&
                                <PieChartComponent
                                    title="Consommation journalière par moteur"
                                    legendPosition="right"
                                />
                            }

                        </div>

                        {/* Graphe 4 & 5 */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {isLoading && <LoadingIndicator />}
                            {
                                data?.dureeDistanceparcouru &&
                                <CombinedChartComponent
                                    data={data?.dureeDistanceparcouru}
                                    title="Durée & Distance parcourue"
                                    barDataKey="duration"
                                    barLabel="Durée (hh:mm:ss)"
                                    lineDataKey="distance"
                                    lineLabel="Distance (km)"
                                    isTimeBased
                                />
                            }

                            {isLoading && <LoadingIndicator />}

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
                        {isLoading && <LoadingIndicator />}
                        {data?.hundredKmConsumption &&
                            <CustomBarChart
                                data={data?.hundredKmConsumption}
                                title="Consommation au 100 km"
                                dataKey1="value"
                                label1="Consommation (L/100km)"
                                color1="#3B82F6"
                            />
                        }
                        {isLoading && <LoadingIndicator />}
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

                        <CustomBarChart
                            data={speeding}
                            title="Excès de vitesse"
                            dataKey1="value"
                            label1="Nombre d'excès"
                            color1="#3B82F6"
                        />
                        <CustomBarChart
                            title="Taux d'utilisation (%)"
                            dataKey1="utilizationRate"
                            label1="Utilisation (%)"
                            color1="bg-orange-500"
                            percentage
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;