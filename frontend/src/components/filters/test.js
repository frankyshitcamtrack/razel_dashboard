import React, { useState, useMemo, useEffect } from "react";
import {
    CalendarDaysIcon,
    TruckIcon,
    Squares2X2Icon,
    XMarkIcon,
    CheckIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon, // Icône pour le reset
} from "@heroicons/react/24/outline";
import { useVehiclesData } from "../../hooks/useVehiclesData";
import { useVehiclesGroupData } from "../../hooks/useVehiclesGroupData";

export interface Filters {
    date1?: string;
    date2?: string;
    vehicle?: number | number[];
    vcleGroupId?: number;
    groupBy?: "day" | "week" | "month";
    weekDays?: number[]
}

interface FilterBarProps {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const WEEKDAYS = [
    { num: 1, short: "Lun", long: "Lundi" },
    { num: 2, short: "Mar", long: "Mardi" },
    { num: 3, short: "Mer", long: "Mercredi" },
    { num: 4, short: "Jeu", long: "Jeudi" },
    { num: 5, short: "Ven", long: "Vendredi" },
    { num: 6, short: "Sam", long: "Samedi" },
    { num: 7, short: "Dim", long: "Dimanche" },
];

const AccordionFilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => {
    const [isExpandedGlogbal, setIsExpandedGlobal] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { data: vehicles, isLoading } = useVehiclesData();
    const { data: vehicleGroups, isLoading: groupLoading } = useVehiclesGroupData();

    // Fonction pour reset tous les filtres
    const resetAllFilters = () => {
        setFilters({
            date1: undefined,
            date2: undefined,
            vehicle: undefined, // Tous les véhicules seront sélectionnés par défaut
            vcleGroupId: undefined,
            groupBy: "day",
            weekDays: undefined
        });
        setSearchTerm("");
    };

    const filteredVehicles = useMemo(() => {
        if (!vehicles) return [];
        return vehicles.filter((vehicle) => {
            const matchesSearch = vehicle.names.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGroup = !filters.vcleGroupId || vehicle.groupid === filters.vcleGroupId;
            return matchesSearch && matchesGroup;
        });
    }, [vehicles, searchTerm, filters.vcleGroupId]);

    const handleVehicleChange = (vehicleId: number) => {
        setFilters((prev) => {
            const currentVehicles = Array.isArray(prev.vehicle) ? prev.vehicle : prev.vehicle ? [prev.vehicle] : [];
            const newVehicles = currentVehicles.includes(vehicleId)
                ? currentVehicles.filter((id) => id !== vehicleId)
                : [...currentVehicles, vehicleId];

            return {
                ...prev,
                vehicle: newVehicles.length ? newVehicles : undefined,
            };
        });
    };

    const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value ? Number(e.target.value) : undefined;
        setFilters((prev) => ({
            ...prev,
            vcleGroupId: value,
            vehicle: undefined,
        }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value || undefined }));
    };

    const handleGroupByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters((prev) => ({ ...prev, groupBy: e.target.value as "day" | "week" | "month" }));
    };

    const toggleWeekday = (day: number) => {
        const currentDays = filters?.weekDays || [];
        const newDays = currentDays.includes(day)
            ? currentDays.filter((d) => d !== day)
            : [...currentDays, day];

        setFilters((prev) => ({ ...prev, weekDays: newDays.length > 0 ? newDays : undefined }));
    };

    const removeVehicle = (vehicleId: number) => {
        setFilters((prev) => {
            const currentVehicles = Array.isArray(prev.vehicle) ? prev.vehicle : prev.vehicle ? [prev.vehicle] : [];
            const newVehicles = currentVehicles.filter((id) => id !== vehicleId);
            return {
                ...prev,
                vehicle: newVehicles.length ? newVehicles : undefined,
            };
        });
    };

    const selectedVehicles = useMemo(() => {
        if (!filters.vehicle || filters?.vehicle?.length === 0) {
            return vehicles || [];
        }
        const vehicleIds = Array.isArray(filters.vehicle) ? filters.vehicle : [filters.vehicle];
        return vehicles?.filter((v) => vehicleIds.includes(v.ids)) || [];
    }, [filters.vehicle, vehicles]);

    useEffect(() => {
        if (vehicles && vehicles.length > 0 && !filters.vehicle) {
            const allVehicleIds = vehicles.map(v => v.ids);
            setFilters((prev) => ({ ...prev, vehicle: allVehicleIds }));
        }
    }, [vehicles, filters.vehicle]);

    return (
        <>
            <div className="mb-2 bg-white p-4 rounded-2xl shadow-md border">
                <div className="flex items-center justify-between mb-4">
                    <div
                        className="flex items-center justify-between cursor-pointer flex-1"
                        onClick={() => setIsExpandedGlobal(!isExpandedGlogbal)}
                    >
                        <h3 className="text-lg font-semibold text-gray-800">
                            {isExpandedGlogbal ? "Masquer les filtres Generaux" : "Afficher les filtres Generaux"}
                        </h3>
                        {isExpandedGlogbal ? (
                            <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                        ) : (
                            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                        )}
                    </div>

                    {/* Bouton Reset */}
                    <button
                        onClick={resetAllFilters}
                        className="ml-4 flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Réinitialiser tous les filtres"
                    >
                        <ArrowPathIcon className="w-4 h-4 mr-1" />
                        Reset
                    </button>
                </div>

                {isExpandedGlogbal && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                        {/* ... le reste de votre code existant ... */}
                    </div>
                )}
            </div>

            <div className="mb-2 bg-white p-4 rounded-2xl shadow-md border">
                <div className="flex items-center justify-between mb-4">
                    <div
                        className="flex items-center justify-between cursor-pointer flex-1"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <h3 className="text-lg font-semibold text-gray-800">
                            Filtres : Jour & Véhicule
                        </h3>
                        {isExpanded ? (
                            <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                        ) : (
                            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                        )}
                    </div>

                    {/* Bouton Reset pour cette section aussi si vous voulez */}
                    <button
                        onClick={() => {
                            setFilters(prev => ({ ...prev, weekDays: undefined }));
                            setSearchTerm("");
                        }}
                        className="ml-4 flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Réinitialiser les filtres jours/véhicules"
                    >
                        <ArrowPathIcon className="w-4 h-4 mr-1" />
                        Reset
                    </button>
                </div>

                {isExpanded && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-5">
                        {/* ... le reste de votre code existant ... */}
                    </div>
                )}
            </div>
        </>
    );
};

export default AccordionFilterBar;