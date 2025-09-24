import { useState } from "react";
import Sidebar from "../components/layout/SideBar";
import GlobalFilterBar from "../components/filters/GlobalFilterBars";
import VerticalStackedBarChart from "../components/charts/VerticalStakedBarChart";
import CustomBarChart from "../components/charts/BarChart"
import { useTrajetData } from "../hooks/useTrajet";
import { useExceptions } from "../hooks/useExceptions";
import type { Filters } from "../components/filters/GlobalFilterBars";


const ActiviteBase = () => {
    const [filters, setFilters] = useState<Filters>({
        date1: undefined,
        date2: undefined,
        vehicle: undefined,
        groupBy: undefined,
        vcleGroupId: undefined,
        weekDays: []
    });

    const { data, isLoading } = useTrajetData(filters);
    const { data: exceptions, isLoading: exceptionsLoading } = useExceptions(filters);

    //console.log(data);

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <Sidebar />
            <div className="w-full">
                <main className="p-4">
                    <GlobalFilterBar filters={filters} setFilters={setFilters} />

                    {/* Section 1 : Stack Bar Charts (2 colonnes) */}
                    <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 overflow-hidden">
                        {(isLoading && exceptionsLoading) ? (
                            <>
                                <DonutSkeleton />
                                <DonutSkeleton />
                                <DonutSkeleton />
                            </>
                        ) : (
                            <>
                                {exceptions?.speeding && (
                                    <VerticalStackedBarChart
                                        data={exceptions.speeding}
                                        dataKey1="duree_totale"
                                        //dataKey2="usage"
                                        label1="survitesse"
                                        //label2="Durée"
                                        color1="#02509D"
                                        //color1="#f3992bff"
                                        valueType="number"
                                        title="Nombre de survitesses"
                                    />
                                )}
                                {data?.SommeDistances && (
                                    <CustomBarChart
                                        data={data.SommeDistances}
                                        dataKey1="value"
                                        //dataKey2="usage"
                                        label1="Somme de distance(KM)"
                                        //label2="Durée d'utilisation"
                                        //color1="#f3992bff"
                                        color1="#02509D"
                                        title="KM Journalier"
                                    />
                                )}
                                {data?.TempsMoteur && (
                                    <VerticalStackedBarChart
                                        data={data.TempsMoteur}
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

export default ActiviteBase;
