import Sidebar from "../components/layout/SideBar";
import GlobalFilterBar from "../components/filters/GlobalFilterBars";
import StackedBarChart from "../components/charts/StackedBarChart";
import VerticalStackedBarChart from "../components/charts/VerticalStakedBarChart";
import CustomBarChart from "../components/charts/BarChart"
import { useTransitData } from "../hooks/useTransitData";
import { useFilters } from "../store/GlobalFiltersContext";
import { VehicleLoadingSpinner } from "../components/UI/LoadingSpinner";

const ActiviteBase = () => {
    const { filters, setFilters, isInitialized } = useFilters();

    const { data, isLoading } = useTransitData(filters);

    //console.log(data);
    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-gray-100 flex">
                <Sidebar />
                <div className="w-full flex justify-center items-center">
                    <VehicleLoadingSpinner />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <Sidebar />
            <div className="w-full">
                <main className="p-4">
                    <GlobalFilterBar filters={filters} setFilters={setFilters} />

                    {/* Section 1 : Stack Bar Charts (2 colonnes) */}
                    <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 overflow-hidden">
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
                                        color1="#02509D"
                                        color2="#f3992bff"
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
