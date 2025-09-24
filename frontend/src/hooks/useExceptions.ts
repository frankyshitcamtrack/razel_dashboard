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
    return useQuery<exceptions, Error>({
        queryKey: ['exceptions values', params],
        queryFn: () => fetchExceptions(params),
        enabled: !!params.date2 || params.vehicle !== undefined || params.groupBy !== undefined || params.vcleGroupId !== undefined,
        staleTime: 5 * 60 * 1000,
    });
};