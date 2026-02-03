import { useQuery } from '@tanstack/react-query';
import type { exceptions } from '../types/ChartDataType';
import { fetchExceptions } from '../api/api'

export const useExceptions = (params: {
    date1?: string;
    date2?: string;
    vehicle?: number | number[] | null;
    vcleGroupId?: number;
    groupBy?: "day" | "week" | "month";
}) => {
    const isEnabled = !!(params.date1 && params.date2 && params.date1.trim() && params.date2.trim());
    
    return useQuery<exceptions, Error>({
        queryKey: ['exceptions values', params],
        queryFn: () => fetchExceptions(params),
        enabled: isEnabled,
        staleTime: 0,
    });
};