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
        // Always use current week logic for default dates
        const today = new Date();
        const currentDay = today.getDay(); // 0 = dimanche, 1 = lundi, etc.
        
        let startDate, endDate;
        
        if (currentDay === 1) { // Si c'est lundi
            // Start date = lundi précédent, end date = lundi actuel
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
            endDate = new Date(today);
        } else {
            // Start date = lundi de cette semaine, end date = aujourd'hui
            const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Dimanche = 6 jours depuis lundi
            startDate = new Date(today);
            startDate.setDate(today.getDate() - daysFromMonday);
            endDate = new Date(today);
        }
        
        // Try to get saved filters but override dates with current week
        const saved = localStorage.getItem('global-filters');
        let baseFilters = {
            groupBy: "day" as const,
            weekDays: [1]
        };
        
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                baseFilters = { ...baseFilters, ...parsed };
                setIsInitialized(true);
            } catch (error) {
                console.error('Erreur parsing saved filters:', error);
            }
        }
        
        return {
            ...baseFilters,
            date1: startDate.toISOString().split('T')[0],
            date2: endDate.toISOString().split('T')[0]
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