import axios from 'axios';
import type { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import type { DashboardData, vehicles, exceptions, vehiclesGroup } from '../types/ChartDataType';


export interface PaginationParams {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
    vehicleId?: number;
    groupId?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface Exception {
    ids: number;
    dates: string;
    vcleid: number;
    nbrsp: number,
    nbrhb: number,
    nbha: number,
    groupid: number,
    vehicle_name: string,
    group_name: string

}

export interface HeureMoteur {
    ids: number;
    dates: string;
    vcleid: number;
    heures: number;
    dureetotal: string,
    dureel: string,
    arretmoteurtournant: string,
    distancekm: number,
    vmax: number,
    percentuse: number,
    consototal: number,
    conso100km: number,
    consolitperhour: number,
    groupid: number,
    vehicle_name: string,
    group_name: string
}


interface ApiErrorResponse {
    error?: string;

}

//const BASE_URL = 'http://localhost:8000'


export const fetchHeureMoteurData = async (
    params: {
        date1?: string;
        date2?: string;
        vehicle?: number | number[];
        vcleGroupId?: number;
        groupBy?: "day" | "week" | "month";
    }
): Promise<DashboardData> => {
    try {
        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
                ...(localStorage.getItem('authToken') && {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                })
            },
            params: {
                date1: params.date1,
                date2: params.date2,
                id: params.vehicle,
                vcleGroupId: params.vcleGroupId,
                groupBy: params.groupBy
            },
            paramsSerializer: { indexes: null } // Format id[]=1&id[]=2
        };

        const response = await axios.get<DashboardData>(
            `/api/razel_dashboard/heuremoteur`,
            config
        );

        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;

        if (axiosError.response) {
            const errorMessage = axiosError.response.data?.error ||
                axiosError.response.statusText ||
                `Erreur ${axiosError.response.status}`;

            throw new Error(errorMessage);
        } else {
            throw new Error('Erreur réseau');
        }
    }
};

/* export const fetchExeptions = async (
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
}; */



export const fetchExceptions = async (
    params: {
        date1?: string;
        date2?: string;
        id?: number | number[];
        vcleGroupId?: number;
        groupBy?: "day" | "week" | "month";
    }
): Promise<exceptions> => {
    try {
        const queryParams = new URLSearchParams();


        if (params.date1) queryParams.append('date1', params.date1);
        if (params.date2) queryParams.append('date2', params.date2);


        if (params.id !== undefined) {
            if (Array.isArray(params.id)) {
                params.id.forEach(id => queryParams.append('id', id.toString()));
            } else {
                queryParams.append('id', params.id.toString());
            }
        }


        if (params.vcleGroupId !== undefined) {
            queryParams.append('vcleGroupId', params.vcleGroupId.toString());
        }
        if (params.groupBy !== undefined) {
            queryParams.append('groupBy', params.groupBy);
        }

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


export const fetchVehicleById = async (
    id: number
): Promise<vehicles> => {
    try {
        const response: AxiosResponse<vehicles> = await axios.get(
            `/api/razel_dashboard/single_vehicle?id=${id}`,
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
                case 404:
                    throw new Error('Véhicule non trouvé');
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


export const fetchVehicleGroupById = async (
    id: number
): Promise<vehicles> => {
    try {
        const response: AxiosResponse<vehicles> = await axios.get(
            `/api/razel_dashboard/single_vehicle_group?id=${id}`,
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
                case 404:
                    throw new Error('Véhicule non trouvé');
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



export const fetchData = async <T>(
    endpoint: 'list_exceptions' | 'list_heuremoteur',
    params: PaginationParams = {}
): Promise<PaginatedResponse<T>> => {
    const queryString = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
            queryString.append(key, String(value));
        }
    });

    const response = await fetch(`/api/razel_dashboard/${endpoint}?${queryString}`,
        {
            headers: {
                'Content-Type': 'application/json',
                ...(localStorage.getItem('authToken') && {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                })
            },
        }
    );
    if (!response.ok) throw new Error('Erreur réseau');
    return response.json();
};






