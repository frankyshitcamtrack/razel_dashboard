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
    return useQuery<DashboardTransitData, Error>({
        queryKey: ['transit data', params],
        queryFn: () => fetchTransitData(params),
        enabled: (!!params.date2 && params.date2.length > 0) || params.vehicle !== undefined || params.groupBy !== undefined,
        staleTime: 5 * 60 * 1000,
    });
};