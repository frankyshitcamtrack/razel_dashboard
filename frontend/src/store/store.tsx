import React, { createContext, useContext, useState, useEffect } from 'react';
import type { dashboardType } from '../types/ChartDataType';

interface ContextType {
    vehicleImmat: string | null;
    startDate: string | Date | null;
    endDate: string | Date | null;
    updateStartDate: (id: string) => void;
    updateEndDate: (id: string) => void;
    updateVehicleImmat: (id: string) => void;
}


const Context = createContext<ContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [vehicleImmat, setvehicleImmat] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string | Date | null>(null);
    const [endDate, setEndDate] = useState<string | Date | null>(null);
    const [data, setData] = useState<dashboardType | {}>({});

    const updateVehicleImmat = (immat: string) => {
        setvehicleImmat(immat);
    };

    const updateStartDate = (id: string) => {
        setStartDate(id);
    };

    const updateEndDate = (id: string) => {
        setEndDate(id);
    };







    return (
        <Context.Provider value={{ vehicleImmat, startDate, endDate, updateStartDate, updateEndDate, updateVehicleImmat }}>
            {children}
        </Context.Provider>
    );
};


export const useSubscription = () => {
    const context = useContext(Context);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a useSubscription provider');
    }
    return context;
};