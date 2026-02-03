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
    const isEnabled = !!(params.date1 && params.date2 && params.date1.trim() && params.date2.trim());
    
    return useQuery<DashboardTrajet, Error>({
        queryKey: ['transit data', params],
        queryFn: () => fetchTrajets(params),
        enabled: isEnabled,
        staleTime: 0,
    });
};