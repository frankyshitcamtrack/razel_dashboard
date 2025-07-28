import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';
import type { DashboardData, vehicles, exceptions, vehiclesGroup } from '../types/ChartDataType';


interface ApiErrorResponse {
    error?: string;

}

export const fetchHeureMoteurData = async (
    params: {
        date1?: string;
        date2?: string;
        vehicle?: number;
        vcleGroupId?: number;
        groupBy?: "day" | "week" | "month";
    }
): Promise<DashboardData> => {
    try {
        // Construction des query params
        const queryParams = new URLSearchParams();

        if (params.date1) queryParams.append('date1', params.date1);
        if (params.date2) queryParams.append('date2', params.date2);
        if (params.vehicle !== undefined) queryParams.append('id', params.vehicle.toString());
        if (params.groupBy !== undefined) queryParams.append('groupBy', params.groupBy.toString());
        if (params.vcleGroupId !== undefined) queryParams.append('vcleGroupId', params.vcleGroupId.toString());

        const response: AxiosResponse<DashboardData> = await axios.get(
            `/api/razel_dashboard/heuremoteur`,
            {
                params: queryParams,
                headers: {
                    'Content-Type': 'application/json',
                    ...(localStorage.getItem('authToken') && {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    })
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
        vcleGroupId?: number;
        groupBy?: "day" | "week" | "month";
    }
): Promise<exceptions> => {

    try {

        const queryParams = new URLSearchParams();

        if (params.date1) queryParams.append('date1', params.date1);
        if (params.date2) queryParams.append('date2', params.date2);
        if (params.id !== undefined) queryParams.append('id', params.id.toString());
        if (params.vcleGroupId !== undefined) queryParams.append('vcleGroupId', params.vcleGroupId.toString());
        if (params.groupBy !== undefined) queryParams.append('groupBy', params.groupBy.toString());

        const response: AxiosResponse<exceptions> = await axios.get(
            `/api/razel_dashboard/exceptions`,
            {
                params: queryParams,
                headers: {
                    'Content-Type': 'application/json',
                    ...(localStorage.getItem('authToken') && {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    })
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


export const fetchVehicles = async (
): Promise<vehicles[]> => {
    try {
        const response: AxiosResponse<vehicles[]> = await axios.get(
            `/api/razel_dashboard/vehicles`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(localStorage.getItem('authToken') && {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    })
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


export const fetchVehiclesGroup = async (
): Promise<vehicles[]> => {
    try {
        const response: AxiosResponse<vehiclesGroup[]> = await axios.get(
            `/api/razel_dashboard/vehicles_group`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(localStorage.getItem('authToken') && {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    })
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



