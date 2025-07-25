import { useQuery } from '@tanstack/react-query';
import type { DashboardData } from '../types/ChartDataType';
import { fetchHeureMoteurData } from '../api/api'

export const useHeureMoteurData = (params: {
    date1?: string;
    date2?: string;
    vehicle?: number;
    groupBy?: "day" | "week" | "month";
}) => {
    return useQuery<DashboardData, Error>({
        queryKey: ['heureMoteur', params],
        queryFn: () => fetchHeureMoteurData(params),
        enabled: !!params.date1 || !!params.date2 || params.vehicle !== undefined || params.groupBy !== undefined,
        staleTime: 5 * 60 * 1000,
    });
};