import React, { useState, useMemo } from "react";
import {
    CalendarDaysIcon,
    TruckIcon,
    MagnifyingGlassIcon,
    Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { useVehiclesData } from "../../hooks/useVehiclesData";
import { useVehiclesGroupData } from "../../hooks/useVehiclesGroupData";

export interface Filters {
    date1?: string;
    date2?: string;
    vehicle?: number;
    vcleGroupId?: number;
    groupBy?: "day" | "week" | "month";
}

interface FilterBarProps {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const GlobalFilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const { data: vehicles, isLoading } = useVehiclesData();

    const { data: vehicleGroups, isLoading: groupLoading } = useVehiclesGroupData();

    const filteredVehicles = useMemo(() => {
        if (!vehicles) return [];

        return vehicles.filter(vehicle => {
            const matchesSearch = vehicle.names.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGroup = !filters.vcleGroupId || vehicle.groupid === filters.vcleGroupId;
            return matchesSearch && matchesGroup;
        });
    }, [vehicles, searchTerm, filters.vcleGroupId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFilters(prev => ({
            ...prev,
            [name]: ["vehicle", "vcleGroupId"].includes(name) && value
                ? Number(value)
                : value || undefined,
        }));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white p-6 rounded-2xl shadow-md border">
            {/* 🔍 Recherche véhicule */}
            <div className="col-span-1 md:col-span-2">
                <label className="flex items-center text-sm text-gray-700 font-medium mb-1">
                    <TruckIcon className="w-5 h-5 text-gray-500 mr-2" />
                    Rechercher un véhicule
                </label>
                <div className="relative mb-3">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Ex: Toyota Hiace, Camion 22T..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Groupe véhicule */}
                    <select
                        name="vcleGroupId"
                        value={filters.vcleGroupId ?? ""}
                        onChange={handleChange}
                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Tous les groupes</option>
                        {groupLoading ? (
                            <option disabled>Chargement...</option>
                        ) : (
                            vehicleGroups?.map(group => (
                                <option key={group.ids} value={group.ids ?? ""}>
                                    {group.names}
                                </option>
                            ))
                        )}
                    </select>

                    {/* Véhicule */}
                    <select
                        name="vehicle"
                        value={filters.vehicle ?? ""}
                        onChange={handleChange}
                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        disabled={!filteredVehicles.length}
                    >
                        <option value="">Tous les véhicules</option>
                        {
                            isLoading ? (
                                <option disabled>Chargement...</option>
                            ) :
                                (filteredVehicles.map(vehicle => (
                                    <option key={vehicle.ids} value={vehicle.ids}>
                                        {vehicle.names}
                                    </option>
                                )))}
                        {filteredVehicles.length === 0 && (
                            <option disabled>Aucun véhicule trouvé</option>
                        )}
                    </select>
                </div>
            </div>

            {/* 📅 Dates */}
            <div>
                <label className="flex items-center text-sm text-gray-700 font-medium mb-1">
                    <CalendarDaysIcon className="w-5 h-5 text-gray-500 mr-2" />
                    Période
                </label>
                <div className="flex flex-col gap-2">
                    <input
                        type="date"
                        name="date1"
                        value={filters.date1 ?? ""}
                        onChange={handleChange}
                        className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                        type="date"
                        name="date2"
                        value={filters.date2 ?? ""}
                        onChange={handleChange}
                        className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* 📊 Regroupement */}
            <div>
                <label className="flex items-center text-sm text-gray-700 font-medium mb-1">
                    <Squares2X2Icon className="w-5 h-5 text-gray-500 mr-2" />
                    Regrouper par
                </label>
                <select
                    name="groupBy"
                    value={filters.groupBy ?? "day"}
                    onChange={handleChange}
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
