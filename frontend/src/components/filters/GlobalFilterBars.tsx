import React, { useState, useMemo } from "react";
import {
    CalendarDaysIcon,
    TruckIcon,
    MagnifyingGlassIcon,
    Squares2X2Icon
} from "@heroicons/react/24/outline";
import { useVehiclesData } from "../../hooks/useVehiclesData";

export interface Filters {
    date1?: string;
    date2?: string;
    vehicle?: number;
    groupBy?: "day" | "week" | "month";
}

interface FilterBarProps {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const GlobalFilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const { data, isLoading } = useVehiclesData();

    const filteredVehicles = useMemo(() => {
        if (!data) return [];
        return data.filter(vehicle =>
            vehicle.names.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="flex flex-wrap gap-4 mb-6 bg-white p-6 rounded-xl shadow-sm border">
            {/* Recherche et sélection véhicule */}
            <div className="flex flex-col w-full md:w-1/3">
                <label className="flex items-center text-sm text-gray-600 mb-1">
                    <TruckIcon className="w-5 h-5 text-gray-500 mr-2" />
                    Véhicule
                </label>
                <div className="relative mb-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher un véhicule..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {isLoading ? (
                    <p className="text-sm text-gray-500">Chargement des véhicules...</p>
                ) : (
                    <select
                        name="vehicle"
                        value={filters.vehicle}
                        onChange={handleChange}
                        className="w-full py-2 pl-3 pr-10 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    >
                        {!searchTerm && <option value="">Tous les véhicules</option>}
                        {filteredVehicles.map(item => (
                            <option key={item.ids} value={item.ids}>
                                {item.names}
                            </option>
                        ))}
                        {filteredVehicles.length === 0 && (
                            <option disabled>Aucun véhicule trouvé</option>
                        )}
                    </select>
                )}
            </div>

            {/* Date de début */}
            <div className="flex flex-col w-full sm:w-auto">
                <label className="flex items-center text-sm text-gray-600 mb-1">
                    <CalendarDaysIcon className="w-5 h-5 text-gray-500 mr-2" />
                    Date début
                </label>
                <input
                    type="date"
                    name="date1"
                    value={filters.date1}
                    onChange={handleChange}
                    className="py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Date de fin */}
            <div className="flex flex-col w-full sm:w-auto">
                <label className="flex items-center text-sm text-gray-600 mb-1">
                    <CalendarDaysIcon className="w-5 h-5 text-gray-500 mr-2" />
                    Date fin
                </label>
                <input
                    type="date"
                    name="date2"
                    value={filters.date2}
                    onChange={handleChange}
                    className="py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Group By */}
            <div className="flex flex-col w-full sm:w-auto">
                <label className="flex items-center text-sm text-gray-600 mb-1">
                    <Squares2X2Icon className="w-5 h-5 text-gray-500 mr-2" />
                    Regrouper par
                </label>
                <select
                    name="groupBy"
                    value={filters.groupBy}
                    onChange={handleChange}
                    className="py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="day">Jour</option>
                    <option value="week">Semaine</option>
                    <option value="month">Mois</option>
                </select>
            </div>
        </div>
    );
};

export default GlobalFilterBar;
