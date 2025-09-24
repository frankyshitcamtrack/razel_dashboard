import { useQuery } from '@tanstack/react-query';
import type { DashboardTrajet } from '../types/ChartDataType';
import { fetchTrajets } from '../api/api'

export const useTrajetData = (params: {
    date1?: string;
    date2?: string;
    vehicle?: number | number[] | null;
    vcleGroupId?: number;
    groupBy?: "day" | "week" | "month";
}) => {
    return useQuery<DashboardTrajet, Error>({
        queryKey: ['transit data', params],
        queryFn: () => fetchTrajets(params),
        enabled: !!(params.date2 && params.date2.length > 0) || params.vehicle !== undefined || params.groupBy !== undefined,
        staleTime: 0,
    });
};