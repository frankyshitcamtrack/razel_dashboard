// contexts/FilterContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../store/AuthContext';
import { useVehiclesData } from '../hooks/useVehiclesData';

export interface Filters {
    date1?: string;
    date2?: string;
    vehicle?: number | number[] | null;
    vcleGroupId?: number;
    groupBy?: "day" | "week" | "month";
    weekDays?: number[];
}

interface FilterContextType {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    isInitialized: boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { data: vehicles } = useVehiclesData();
    const [isInitialized, setIsInitialized] = useState(false);

    const [filters, setFilters] = useState<Filters>(() => {
        // 1. Essayer de récupérer depuis localStorage
        const saved = localStorage.getItem('global-filters');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setIsInitialized(true);
                return parsed;
            } catch (error) {
                console.error('Erreur parsing saved filters:', error);
            }
        }

        // 2. Valeurs par défaut (seront mises à jour après)
        return {
            groupBy: "day",
            weekDays: [1]
        };
    });

    // Initialisation UNE FOIS après chargement des données
    useEffect(() => {
        if (!isInitialized && vehicles && user) {
            console.log('Initialisation des filtres...');

            setFilters(prev => {
                const newFilters = { ...prev };

                // Initialiser vehicle et vcleGroupId seulement s'ils ne sont pas déjà définis
                if (!newFilters.vehicle) {
                    if (user.isadmin) {
                        newFilters.vehicle = vehicles.map(v => v.ids);
                        newFilters.vcleGroupId = undefined;
                    } else {
                        const userVehicles = vehicles.filter(v => v.groupid === user.groupid);
                        newFilters.vehicle = userVehicles.map(v => v.ids);
                        newFilters.vcleGroupId = user.groupid;
                    }
                }

                // S'assurer que weekDays a une valeur
                if (!newFilters.weekDays || newFilters.weekDays.length === 0) {
                    newFilters.weekDays = [1];
                }

                // S'assurer que groupBy a une valeur
                if (!newFilters.groupBy) {
                    newFilters.groupBy = "day";
                }

                return newFilters;
            });

            setIsInitialized(true);
        }
    }, [vehicles, user, isInitialized]);

    // Sauvegarder dans localStorage à chaque changement
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('global-filters', JSON.stringify(filters));
        }
    }, [filters, isInitialized]);

    return (
        <FilterContext.Provider value={{ filters, setFilters, isInitialized }}>
            {children}
        </FilterContext.Provider>
    );
};

export const useFilters = () => {
    const context = useContext(FilterContext);
    if (context === undefined) {
        throw new Error('useFilters must be used within a FilterProvider');
    }
    return context;
};