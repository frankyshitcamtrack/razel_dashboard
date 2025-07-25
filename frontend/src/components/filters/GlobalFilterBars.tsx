import React from "react";
import { CalendarDaysIcon, TruckIcon } from "@heroicons/react/24/outline";
import { useVehiclesData } from "../../hooks/useVehiclesData";

export interface Filters {
    date1: string;
    date2: string;
    vehicle: number;
}

interface FilterBarProps {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const GlobalFilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };


    const { data, error: _, isLoading, isError: ___ } = useVehiclesData();

    console.log(filters);

    return (
        <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border">

            {/* Sélection du véhicule */}
            <div className="flex items-center">
                <TruckIcon className="w-5 h-5 text-gray-500 mr-2" />
                {
                    isLoading && <p className="text-sm">loading vehicles...</p>
                }
                {
                    data &&
                    <select
                        name="vehicle"
                        value={filters.vehicle}
                        onChange={handleChange}
                        className="block w-full py-2 pl-3 pr-10 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    >

                        <option value="">Tous les véhicules</option>
                        {
                            (data && data.length > 0) && data.map(item => (
                                <option value={item.ids}>{item.names}</option>
                            ))
                        }
                    </select>
                }

            </div>

            {/* Date de début */}
            <div className="flex items-center">
                <CalendarDaysIcon className="w-5 h-5 text-gray-500 mr-2" />
                <input
                    type="date"
                    name="date1"
                    value={filters.date1}
                    onChange={handleChange}
                    className="block w-full py-2 pl-3 pr-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Date de fin */}
            <div className="flex items-center">
                <CalendarDaysIcon className="w-5 h-5 text-gray-500 mr-2" />
                <input
                    type="date"
                    name="date2"
                    value={filters.date2}
                    onChange={handleChange}
                    className="block w-full py-2 pl-3 pr-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
        </div>
    );
};

export default GlobalFilterBar;