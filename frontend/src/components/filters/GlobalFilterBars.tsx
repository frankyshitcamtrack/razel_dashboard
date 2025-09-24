import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../store/AuthContext";

import {
    CalendarDaysIcon,
    TruckIcon,
    Squares2X2Icon,
    CheckIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useVehiclesData } from "../../hooks/useVehiclesData";
import { useVehiclesGroupData } from "../../hooks/useVehiclesGroupData";

export interface Filters {
    date1?: string;
    date2?: string;
    vehicle?: number | number[] | null;
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
    const { user } = useAuth();
    const [isExpandedGlogbal, setIsExpandedGlobal] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { data: vehicles, isLoading } = useVehiclesData();
    const { data: vehicleGroups, isLoading: groupLoading } = useVehiclesGroupData();

    const filteredVehicles = useMemo(() => {
        if (!vehicles) return [];

        return vehicles.filter((vehicle) => {
            const matchesSearch = vehicle.names.toLowerCase().includes(searchTerm.toLowerCase());
            let matchesGroup = true;
            if (filters.vcleGroupId) {
                matchesGroup = vehicle.groupid === filters.vcleGroupId;
            } else if (user?.isadmin === false) {
                matchesGroup = vehicle.groupid === user?.groupid;
            }
            return matchesSearch && matchesGroup;
        });
    }, [vehicles, searchTerm, filters.vcleGroupId, user?.groupid]);


    useEffect(() => {
        if (vehicles && user) {
            if (user.isadmin === true) {
                const allVehicleIds = vehicles.map(v => v.ids);
                setFilters((prev) => ({
                    ...prev,
                    weekDays: [1],
                    vehicle: allVehicleIds,
                    vcleGroupId: undefined
                }));
            } else {
                const vehiclebygroups = vehicles.filter(item => item.groupid === user.groupid);
                const selectedVecle = vehiclebygroups.map(v => v.ids);
                setFilters((prev) => ({
                    ...prev,
                    weekDays: [1],
                    vehicle: selectedVecle,
                    vcleGroupId: user.groupid
                }));
            }
        }
    }, [vehicles, user]);



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
        setFilters((prev) => {
            const newFilters = { ...prev, vcleGroupId: value };
            if (value && vehicles) {
                const vehiclesInGroup = vehicles.filter(v => v.groupid === value);
                newFilters.vehicle = vehiclesInGroup.map(v => v.ids);
            } else if (!value && vehicles) {

                newFilters.vehicle = vehicles.map(v => v.ids);
            } else {
                newFilters.vehicle = [];
            }

            return newFilters;
        });
    };


    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => {
            const newFilters = {
                ...prev,
                [name]: value || undefined
            };
            if ((name === "date1" && !value) || (name === "date2" && !value)) {
                newFilters.date1 = undefined;
                newFilters.date2 = undefined;
            }
            return newFilters;
        });
    };

    const handleGroupByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters((prev) => ({ ...prev, groupBy: e.target.value as "day" | "week" | "month" }));
    };

    /*     const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const value = e.target.value ? Number(e.target.value) : undefined;
    
            setFilters((prev) => {
                const newFilters = {
                    ...prev,
                    vcleGroupId: value,
                };
    
                // Si un groupe est sélectionné, on sélectionne automatiquement tous ses véhicules
                if (value && vehicles) {
                    const vehiclesInGroup = vehicles.filter(v => v.groupid === value);
                    const vehicleIds = vehiclesInGroup.map(v => v.ids);
                    newFilters.vehicle = vehicleIds.length > 0 ? vehicleIds : undefined;
                } else {
                    // Si aucun groupe, on vide la sélection véhicules
                    newFilters.vehicle = undefined;
                }
    
                return newFilters;
            });
        };
     */
    const toggleWeekday = (day: number) => {
        if (!filters?.weekDays) return [];
        const newDays = filters?.weekDays?.includes(day)
            ? filters.weekDays.filter((d) => d !== day)
            : [...filters?.weekDays, day];

        setFilters((prev) => ({ ...prev, weekDays: newDays }));
    }

    const isVehicleSelectedByGroup = (vehicleId: number) => {
        if (!filters.vcleGroupId || !vehicles) return false;
        const vehiclesInSelectedGroup = vehicles.filter(v => v.groupid === filters.vcleGroupId);
        return vehiclesInSelectedGroup.some(v => v.ids === vehicleId);
    };


    const isVehicleIndividuallySelected = (vehicleId: number) => {
        return Array.isArray(filters.vehicle)
            ? filters.vehicle.includes(vehicleId)
            : filters.vehicle === vehicleId;
    };
    return (
        <>
            <div className="mb-2 bg-white p-4 rounded-2xl shadow-md border">

                <div
                    className="flex items-center justify-between cursor-pointer"
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


                {isExpandedGlogbal && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">

                        <div className="md:col-span-2">
                            <label className="flex items-center text-sm text-gray-700 font-medium mb-1">
                                <TruckIcon className="w-5 h-5 text-gray-500 mr-2" />
                                Sélection des véhicules
                            </label>


                            {/*      <div className="flex flex-wrap gap-2 mb-2">
                                {selectedVehicles.map((vehicle) => (
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
                            </div> */}

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
                                {user?.isadmin === true && <option value="">Tous les groupes</option>}
                                {groupLoading ? (
                                    <option disabled>Chargement...</option>
                                ) : user?.isadmin === true ? (
                                    vehicleGroups?.map((group) => (
                                        <option key={group.ids} value={group.ids ?? ""}>
                                            {group.names}
                                        </option>
                                    ))
                                ) :
                                    vehicleGroups?.filter(item => item.names === user?.group).map((group) => (
                                        <option key={group.ids} value={group.ids ?? ""}>
                                            {group.names}
                                        </option>
                                    ))
                                }
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

                    <button
                        onClick={() => {
                            setFilters({
                                date1: undefined,
                                date2: undefined,
                                vehicle: [],
                                vcleGroupId: undefined,
                                groupBy: "day",
                                weekDays: [],
                            });
                            setSearchTerm("");
                        }}
                        className="ml-4 flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Réinitialiser tous les filtres"
                    >
                        <ArrowPathIcon className="w-4 h-4 mr-1" />
                        Reset
                    </button>

                </div>
                <ul className="divide-y divide-gray-200"></ul>

                {isExpanded && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-5">
                        {/* Gauche : Jours de la semaine */}
                        <div className="border rounded-lg p-2">
                            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Sélectionner les jours
                            </label>

                            <div className="grid grid-cols-7 gap-2">
                                {WEEKDAYS.map(({ num, short, long }) => {
                                    const isSelected = filters?.weekDays?.includes(num);
                                    return (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => toggleWeekday(num)}
                                            title={long}
                                            className={`py-2 px-1 rounded text-xs font-medium transition-all duration-150 transform hover:scale-105 ${isSelected
                                                ? "bg-[#02509D] text-white shadow-md"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                }`}
                                        >
                                            {short}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Droite : Véhicules */}
                        <div className="border rounded-lg p-2">
                            <div className="flex items-center justify-between  mb-2">
                                <label className="block text-sm font-medium text-gray-700 flex items-center">
                                    <TruckIcon className="w-5 h-5 mr-2 text-green-500" />
                                    Sélectionner les véhicules
                                    {/*   {filters.vehicleIds.length > 0 && (
                                                <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                                                    {filters.vehicleIds.length} sélectionné(s)
                                                </span>
                                            )} */}
                                </label>
                                <div>
                                    <input
                                        type="checkbox"
                                        id="selectAllVehicles"
                                        checked={
                                            filteredVehicles.length > 0 &&
                                            filteredVehicles.every(v =>
                                                Array.isArray(filters.vehicle)
                                                    ? filters.vehicle.includes(v.ids)
                                                    : filters.vehicle === v.ids
                                            )
                                        }
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                const allIds = filteredVehicles.map(v => v.ids);
                                                setFilters(prev => ({ ...prev, vehicle: allIds }));
                                            } else {
                                                setFilters(prev => ({ ...prev, vehicle: [] }));
                                            }
                                        }}
                                        className="mr-2"
                                    />
                                    <label htmlFor="selectAllVehicles" className="text-sm text-gray-700">
                                        Sélectionner Tous les véhicules
                                    </label>
                                </div>

                            </div>

                            {/* Barre de recherche */}
                            {/*     <div className="relative mb-3">
                                <input
                                    type="text"
                                    placeholder="Rechercher un véhicule..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                                <svg
                                    className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div> */}

                            {/* Liste des véhicules en boutons */}
                            <div className="max-h-15 overflow-y-auto grid grid-cols-1 lg:grid-cols-11 gap-1 overflow-hidden">
                                {isLoading ? (
                                    <div className="text-center text-gray-500 py-4">Chargement des véhicules...</div>
                                ) : filteredVehicles.length === 0 ? (
                                    <div className="text-center text-gray-500 py-4">Aucun véhicule trouvé</div>
                                ) : (

                                    filteredVehicles.map((vehicle) => {
                                        const isGroupSelected = isVehicleSelectedByGroup(vehicle.ids);
                                        const isIndividuallySelected = isVehicleIndividuallySelected(vehicle.ids);
                                        const isActive = isGroupSelected || isIndividuallySelected;

                                        return (
                                            <button
                                                key={vehicle.ids}
                                                type="button"
                                                onClick={() => handleVehicleChange(vehicle.ids)}
                                                className={`w-full px-2 py-1 rounded text-sm transition-all ${isActive
                                                    ? "bg-[#F7D000] text-white shadow-sm"
                                                    : "bg-white text-gray-700 hover:bg-gray-100"
                                                    } ${isGroupSelected && !isIndividuallySelected
                                                        ? "bg-[#F7D000] text - white shadow - sm"// Style différent pour les véhicules sélectionnés par groupe
                                                        : ""
                                                    }`}
                                            >
                                                <span>{vehicle.names.split('-')[0]}</span>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                )}
            </div>
        </>

    );
};

export default AccordionFilterBar;