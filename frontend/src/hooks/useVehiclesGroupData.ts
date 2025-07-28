import { useQuery } from '@tanstack/react-query';
import type { vehiclesGroup } from '../types/ChartDataType';
import { fetchVehiclesGroup } from '../api/api';

export const useVehiclesGroupData = () => {
    return useQuery<vehiclesGroup[], Error>({
        queryKey: ['vehiclesGroup'],
        queryFn: () => fetchVehiclesGroup(),
        staleTime: 5 * 60 * 1000,
    });
};