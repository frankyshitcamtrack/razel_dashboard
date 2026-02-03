import { useQuery } from '@tanstack/react-query';
import type { DashboardTransitData } from '../types/ChartDataType';
import { fetchTransitData } from '../api/api'

export const useTransitData = (params: {
    date1?: string;
    date2?: string;
    vehicle?: number | number[] | null;
    vcleGroupId?: number;
    groupBy?: "day" | "week" | "month";
}) => {
    const isEnabled = !!(params.date1 && params.date2 && params.date1.trim() && params.date2.trim());
    console.log('useTransitData enabled:', isEnabled, 'date1:', params.date1, 'date2:', params.date2);
    
    return useQuery<DashboardTransitData, Error>({
        queryKey: ['transit data', params],
        queryFn: () => fetchTransitData(params),
        enabled: isEnabled,
        staleTime: 0,
    });
};