import { useState } from "react";
import Sidebar from "../components/layout/SideBar";
import GlobalFilterBar from "../components/filters/GlobalFilterBars";
//import VerticalStackedBarChart from "../components/charts/VerticalStakedBarChart";
import StackedBarChart from "../components/charts/StackedBarChart";
import CustomBarChart from "../components/charts/BarChart"
import { useTrajetData } from "../hooks/useTrajet";
import { useExceptions } from "../hooks/useExceptions";
import type { Filters } from "../components/filters/GlobalFilterBars";


const Trajet = () => {
    const [filters, setFilters] = useState<Filters>({
        date1: undefined,
        date2: undefined,
        vehicle: undefined,
        groupBy: undefined,
        vcleGroupId: undefined,
        weekDays: []
    });

    const { data: trajets, isLoading: istrajetLoading } = useTrajetData(filters);
    const { data: exceptions, isLoading: _exceptionsLoading } = useExceptions(filters);

    console.log(trajets);

    //console.log(data);

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <Sidebar />
            <div className="w-full">
                <main className="p-4">
                    <GlobalFilterBar filters={filters} setFilters={setFilters} />

                    {/* Section 1 : Stack Bar Charts (2 colonnes) */}
                    <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 overflow-hidden">
                        {(istrajetLoading) ? (
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
