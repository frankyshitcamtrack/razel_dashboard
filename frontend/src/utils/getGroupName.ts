import { fetchVehicleGroupById, fetchVehicleById } from "../api/api";

export const getGroupName = async (id: number): Promise<string> => {

    const group = await fetchVehicleGroupById(id);

    return group.names;
};


export const getVehicleName = async (id: number): Promise<string> => {

    const vehicle = await fetchVehicleById(id);

    return vehicle.names;
};