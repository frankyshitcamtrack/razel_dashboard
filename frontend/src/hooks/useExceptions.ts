import { useQuery } from '@tanstack/react-query';
import type { exceptions } from '../types/ChartDataType';
import { fetchExeptions } from '../api/api'

export const useExceptions = (params: {
    date1?: string;
    date2?: string;
    vehicle?: number;
}) => {
    return useQuery<exceptions, Error>({
        queryKey: ['exceptions values', params],
        queryFn: () => fetchExeptions(params),
        enabled: !!params.date1 || !!params.date2 || params.vehicle !== undefined,
        staleTime: 5 * 60 * 1000,
    });
};