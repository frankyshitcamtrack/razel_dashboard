import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';
import type { DashboardData } from '../types/ChartDataType';


interface ApiErrorResponse {
    error?: string;

}

export const fetchHeureMoteurData = async (
    params: {
        date1?: string;
        date2?: string;
        id?: number;
    }
): Promise<DashboardData> => {
    try {
        // Construction des query params
        const queryParams = new URLSearchParams();

        if (params.date1) queryParams.append('date1', params.date1);
        if (params.date2) queryParams.append('date2', params.date2);
        if (params.id !== undefined) queryParams.append('id', params.id.toString());

        const response: AxiosResponse<DashboardData> = await axios.get(
            `/api/razel_dashboard/heuremoteur`,
            {
                params: queryParams,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError;

        if (axiosError.response) {
            switch (axiosError.response.status) {
                case 400:
                    const errorData = axiosError.response?.data as ApiErrorResponse;
                    throw new Error('Paramètres invalides: ' + errorData?.error || 'Erreur inconnue');
                case 500:
                    throw new Error('Erreur serveur');
                default:
                    throw new Error(`Erreur ${axiosError.response.status}`);
            }
        } else {
            throw new Error('Erreur réseau');
        }
    }
};


export const fetchExeptions = async (
    params: {
        date1?: string;
        date2?: string;
        id?: number;
    }
): Promise<DashboardData> => {
    try {

        const queryParams = new URLSearchParams();

        if (params.date1) queryParams.append('date1', params.date1);
        if (params.date2) queryParams.append('date2', params.date2);
        if (params.id !== undefined) queryParams.append('id', params.id.toString());

        const response: AxiosResponse<DashboardData> = await axios.get(
            `/api/razel_dashboard/exceptions`,
            {
                params: queryParams,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError;

        if (axiosError.response) {
            switch (axiosError.response.status) {
                case 400:
                    throw new Error('Paramètres invalides');
                case 500:
                    throw new Error('Erreur serveur');
                default:
                    throw new Error(`Erreur ${axiosError.response.status}`);
            }
        } else {
            throw new Error('Erreur réseau');
        }
    }
};
