import { useQuery } from '@tanstack/react-query';
import type { DashboardData } from '../types/ChartDataType';
import { fetchHeureMoteurData } from '../api/api'

export const useHeureMoteurData = (params: {
    date1?: string;
    date2?: string;
    vehicle?: number | number[] | null;
    vcleGroupId?: number;
    groupBy?: "day" | "week" | "month";
}) => {
    const isEnabled = !!(params.date1 && params.date2 && params.date1.trim() && params.date2.trim());
    
    return useQuery<DashboardData, Error>({
        queryKey: ['heureMoteur', params],
        queryFn: () => fetchHeureMoteurData(params),
        enabled: isEnabled,
        staleTime: 0,
    });
};