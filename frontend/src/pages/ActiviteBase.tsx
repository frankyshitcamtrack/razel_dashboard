import Sidebar from "../components/layout/SideBar";
import { useState } from "react";
import GlobalFilterBar from "../components/filters/GlobalFilterBars";
import StackedBarChart from "../components/charts/StackedBarChart";
import VerticalStackedBarChart from "../components/charts/VerticalStakedBarChart";
import CustomBarChart from "../components/charts/BarChart"
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

                    {/* Section 1 : Stack Bar Charts (2 colonnes) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
                        {isLoading ? (
                            <>
                                <DonutSkeleton />
                                <DonutSkeleton />
                                <DonutSkeleton />
                                <DonutSkeleton />
                            </>
                        ) : (
                            <>
                                {data?.DureeParBase && (
                                    <VerticalStackedBarChart
                                        data={data.DureeParBase}
                                        dataKey1="duree_totale"
                                        //dataKey2="usage"
                                        label1="Sommes de durée"
                                        //label2="Durée"
                                        //color1="#02509D"
                                        color1="#f3992bff"
                                        valueType="time"
                                        title="Durée/Base"
                                    />
                                )}
                                {data?.ToursParBase && (
                                    <CustomBarChart
                                        data={data.ToursParBase}
                                        dataKey1="nombre_tours"
                                        //dataKey2="usage"
                                        label1="Nombre de tours"
                                        //label2="Durée d'utilisation"
                                        color1="#f3992bff"
                                        //color2="#02509D"

                                        title="Nbre de tours/Bases
"
                                    />
                                )}
                                {data?.HistoriqueTransit && (
                                    <StackedBarChart
                                        data={data.HistoriqueTransit}
                                        dataKey1="duree_base_depart"
                                        dataKey2="duree_transit"
                                        label1="duree base depart"
                                        label2="duree de transit"
                                        color1="#F68A2A"
                                        color2="#255186"
                                        valueType="time"
                                        title="Historique Transit"
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
