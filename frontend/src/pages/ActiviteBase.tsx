import Sidebar from "../components/layout/SideBar";
import { useState } from "react";
import GlobalFilterBar from "../components/filters/GlobalFilterBars";
import StackedBarChart from "../components/charts/StackedBarChart";
// import CustomBarChart from "../components/charts/BarChart"
import DurationProgressChart from "../components/charts/DurationProgressChart";
import ToursProgressChart from "../components/charts/ToursProgressChart";
import HistoriqueTransitChart from "../components/charts/HistoriqueTransitChart";
import { useTransitData } from "../hooks/useTransitData";
import { useFilters } from "../store/GlobalFiltersContext";
import { VehicleLoadingSpinner } from "../components/UI/LoadingSpinner";
import HamburgerButton from "../components/UI/HamburgerButton";

const ActiviteBase = () => {
    const { filters, setFilters, isInitialized } = useFilters();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { data, isLoading } = useTransitData(filters);

    //console.log(data);
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
                        <span className="text-lg font-semibold text-gray-800">Acivite sur Base</span>
                        <div className="w-6"></div> {/* Pour l'équilibrage */}
                    </div>
                </header>
                <main className="p-4">
                    <GlobalFilterBar filters={filters} setFilters={setFilters} />

                    {/* Section 1 : Stack Bar Charts (vertical layout) */}
                    <div className="space-y-4 overflow-hidden">
                        {isLoading ? (
                            <>
                                <DonutSkeleton />
                                <DonutSkeleton />
                                <DonutSkeleton />
                                <DonutSkeleton />
                            </>
                        ) : (
                            <>                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {data?.DureeParBase && (
                                        <DurationProgressChart
                                            data={data.DureeParBase}
                                            title="Durée/Base"
                                        />
                                    )}
                                    {data?.ToursParBase && (
                                        <ToursProgressChart
                                            data={data.ToursParBase}
                                            title="Nbre de tours/Bases"
                                        />
                                    )}
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {data?.HistoriqueTransit && (
                                        <HistoriqueTransitChart
                                            data={data.HistoriqueTransit}
                                        />
                                    )}
                                    {data?.DureeTransitMax && (
                                        <StackedBarChart
                                            data={data?.DureeTransitMax}
                                            dataKey1="duree_transit_max"
                                            //dataKey2=""
                                            label1="Max duree transit"
                                            //label2=""
                                            color1="#f3992bff"
                                            //color2="#02509D"
                                            // valueType="percentage"
                                            title="Duree Transit"
                                            valueType="time"
                                        />
                                    )}
                                </div>

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

export default ActiviteBase;
