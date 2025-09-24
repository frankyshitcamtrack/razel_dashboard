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
        enabled: (!!params.date1 && !!params.date2 && params.date1.length > 0 && params.date2.length > 0) || params.vehicle !== undefined || params.groupBy !== undefined || params.vcleGroupId !== undefined,
        staleTime: 5 * 60 * 1000,
    });
};