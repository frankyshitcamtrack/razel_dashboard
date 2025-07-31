import React, { useState, useMemo } from "react";
import {
    CalendarDaysIcon,
    TruckIcon,
    MagnifyingGlassIcon,
    Squares2X2Icon,
    XMarkIcon,
    CheckIcon
} from "@heroicons/react/24/outline";
import { useVehiclesData } from "../../hooks/useVehiclesData";
import { useVehiclesGroupData } from "../../hooks/useVehiclesGroupData";

export interface Filters {
    date1?: string;
    date2?: string;
    vehicle?: number | number[];
    vcleGroupId?: number;
    groupBy?: "day" | "week" | "month";
}

interface FilterBarProps {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const GlobalFilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

    const handleVehicleChange = (vehicleId: number) => {
        setFilters(prev => {
            const currentVehicles = Array.isArray(prev.vehicle) ? prev.vehicle :
                prev.vehicle ? [prev.vehicle] : [];

            const newVehicles = currentVehicles.includes(vehicleId)
                ? currentVehicles.filter(id => id !== vehicleId)
                : [...currentVehicles, vehicleId];

            return {
                ...prev,
                vehicle: newVehicles.length ? newVehicles : undefined
            };
        });
    };

    const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value ? Number(e.target.value) : undefined;
        setFilters(prev => ({
            ...prev,
            vcleGroupId: value,
            vehicle: undefined // Reset vehicle selection when group changes
        }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value || undefined }));
    };

    const handleGroupByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, groupBy: e.target.value as "day" | "week" | "month" }));
    };

    const removeVehicle = (vehicleId: number) => {
        setFilters(prev => {
            const currentVehicles = Array.isArray(prev.vehicle) ? prev.vehicle :
                prev.vehicle ? [prev.vehicle] : [];
            const newVehicles = currentVehicles.filter(id => id !== vehicleId);
            return {
                ...prev,
                vehicle: newVehicles.length ? newVehicles : undefined
            };
        });
    };

    const selectedVehicles = useMemo(() => {
        const currentVehicles = Array.isArray(filters.vehicle) ? filters.vehicle :
            filters.vehicle ? [filters.vehicle] : [];
        return vehicles?.filter(v => currentVehicles.includes(v.ids)) || [];
    }, [filters.vehicle, vehicles]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white p-6 rounded-2xl shadow-md border">

            <div className="col-span-1 md:col-span-2">
                <label className="flex items-center text-sm text-gray-700 font-medium mb-1">
                    <TruckIcon className="w-5 h-5 text-gray-500 mr-2" />
                    Sélection des véhicules
                </label>

                {/* Affichage des véhicules sélectionnés */}
                <div className="flex flex-wrap gap-2 mb-2">
                    {selectedVehicles.map(vehicle => (
                        <span
                            key={vehicle.ids}
                            className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
                        >
                            {vehicle.names}
                            <button
                                onClick={() => removeVehicle(vehicle.ids)}
                                className="ml-2 text-blue-500 hover:text-blue-700"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </span>
                    ))}
                </div>

                <div className="relative mb-3">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher un véhicule..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onFocus={() => setIsDropdownOpen(true)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />


                    {isDropdownOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsDropdownOpen(false)}
                            />
                            <div className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white shadow-lg border border-gray-200">
                                <div className="p-2">
                                    {isLoading ? (
                                        <div className="p-2 text-center text-gray-500">Chargement...</div>
                                    ) : filteredVehicles.length === 0 ? (
                                        <div className="p-2 text-center text-gray-500">Aucun véhicule trouvé</div>
                                    ) : (
                                        <ul className="divide-y divide-gray-200">
                                            {filteredVehicles.map(vehicle => {
                                                const isSelected = Array.isArray(filters.vehicle)
                                                    ? filters.vehicle.includes(vehicle.ids)
                                                    : filters.vehicle === vehicle.ids;
                                                return (
                                                    <li key={vehicle.ids} className="p-2 hover:bg-gray-50">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleVehicleChange(vehicle.ids)}
                                                            className="w-full flex items-center justify-between"
                                                        >
                                                            <span>{vehicle.names}</span>
                                                            {isSelected && (
                                                                <CheckIcon className="h-5 w-5 text-blue-500" />
                                                            )}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>


                <select
                    name="vcleGroupId"
                    value={filters.vcleGroupId ?? ""}
                    onChange={handleGroupChange}
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
            </div>


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
                        onChange={handleDateChange}
                        className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                        type="date"
                        name="date2"
                        value={filters.date2 ?? ""}
                        onChange={handleDateChange}
                        className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            <div>
                <label className="flex items-center text-sm text-gray-700 font-medium mb-1">
                    <Squares2X2Icon className="w-5 h-5 text-gray-500 mr-2" />
                    Regrouper par
                </label>
                <select
                    name="groupBy"
                    value={filters.groupBy ?? "day"}
                    onChange={handleGroupByChange}
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