import { useQuery } from '@tanstack/react-query';
import type { vehicles } from '../types/ChartDataType';
import { fetchVehicles } from '../api/api';
export const useVehiclesData = () => {
    return useQuery<vehicles[], Error>({
        queryKey: ['vehicles'],
        queryFn: () => fetchVehicles(),
        staleTime: 0,
    });
};