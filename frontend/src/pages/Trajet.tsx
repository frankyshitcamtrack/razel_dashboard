import Sidebar from "../components/layout/SideBar";
import GlobalFilterBar from "../components/filters/GlobalFilterBars";
//import VerticalStackedBarChart from "../components/charts/VerticalStakedBarChart";
import StackedBarChart from "../components/charts/StackedBarChart";
import CustomBarChart from "../components/charts/BarChart"
import { useTrajetData } from "../hooks/useTrajet";
import { useExceptions } from "../hooks/useExceptions";
import { useFilters } from "../store/GlobalFiltersContext";
import { useState } from "react";
import { VehicleLoadingSpinner } from "../components/UI/LoadingSpinner";
import HamburgerButton from "../components/UI/HamburgerButton";

const Trajet = () => {
    const { filters, setFilters, isInitialized } = useFilters();
    const { data: trajets, isLoading: istrajetLoading } = useTrajetData(filters);
    const { data: exceptions, isLoading: exceptionsLoading } = useExceptions(filters);
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
                        <span className="text-lg font-semibold text-gray-800">Utilisation Tracteurs</span>
                        <div className="w-6"></div> {/* Pour l'équilibrage */}
                    </div>
                </header>
                <main className="p-4">
                    <GlobalFilterBar filters={filters} setFilters={setFilters} />

                    {/* Section 1 : Stack Bar Charts (2 colonnes) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
                        {(istrajetLoading && exceptionsLoading) ? (
                            <>
                                <DonutSkeleton />
                                <DonutSkeleton />
                                <DonutSkeleton />
                            </>
                        ) : (
                            <>
                                {exceptions?.speeding && (
                                    <StackedBarChart
                                        data={exceptions?.speeding}
                                        dataKey1="value"
                                        //dataKey2="usage"
                                        label1="survitesse"
                                        //label2="Durée"
                                        color1="#02509D"
                                        //color1="#f3992bff"
                                        valueType="number"
                                        title="Nombre de survitesses"
                                    />
                                )}
                                {trajets?.SommeDistances && (
                                    <CustomBarChart
                                        data={trajets?.SommeDistances}
                                        dataKey1="value"
                                        //dataKey2="usage"
                                        label1="Somme de distance(KM)"
                                        //label2="Durée d'utilisation"
                                        //color1="#f3992bff"
                                        color1="#02509D"
                                        title="KM Journalier"
                                    />
                                )}
                                {trajets?.tempsMoteur && (
                                    <StackedBarChart
                                        data={trajets?.tempsMoteur}
                                        dataKey1="value"
                                        //dataKey2="usage"
                                        label1="Sommes de durée utilisation"
                                        //label2="Durée"
                                        color1="#02509D"
                                        //color1="#f3992bff"
                                        valueType="time"
                                        title="Temps d'utilisation"
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

export default Trajet;
