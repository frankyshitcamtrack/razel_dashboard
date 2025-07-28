// Type de base pour toutes les données avec un "name"
export interface BaseChartItem {
    name: string;
}

// 1. Arrêts moteur / Durée d'utilisation (valeurs brutes)
export interface EngineUsageItem extends BaseChartItem {
    stops: number;   // Nombre d'arrêts moteur
    usage: number;   // Durée d'utilisation (en heures ou autre)
}



// 2. Arrêts moteur / Durée d'utilisation (en %)
export interface EngineUsagePercentageItem extends BaseChartItem {
    stops: number;   // Pourcentage d'arrêts moteur
    usage: number;   // Pourcentage d'utilisation
}



export interface DaylyConsommationItem extends BaseChartItem {
    name: string,
    daylyConsom: number
}


// 3. Durée d'utilisation et distance parcourue
export interface DurationDistanceItem extends BaseChartItem {
    name: string;
    duration: string;   // Durée en secondes ou minutes
    distance: number;   // Distance en km
}



// 4. Distance parcourue et consommation
export interface DistanceConsumptionItem extends BaseChartItem {
    consumption: number; // Consommation en litres
    distance: number;    // Distance en km
}


// 5. Consommation au 100 km
export interface HundredKmConsumptionItem extends BaseChartItem {
    value: number; // Consommation en L/100km
}


// 6. Ratio de consommation
export interface RatioConsumptionItem extends BaseChartItem {
    value: number; // Ratio (ex: L/M ou autre)
}


// 7. Excès de vitesse
export interface SpeedingItem extends BaseChartItem {
    name: string,
    value: number; // Nombre d'excès de vitesse
}

export interface HarshAccelerationBraking extends BaseChartItem {
    name: string,
    acceleration: number,
    braking: number
}



export type EngineUsageData = EngineUsageItem[];
export type EngineUsagePercentageData = EngineUsagePercentageItem[];
export type DaylyConsommationData = DaylyConsommationItem[];
export type DurationDistanceData = DurationDistanceItem[];
export type DistanceConsumptionData = DistanceConsumptionItem[];
export type HundredKmConsumptionData = HundredKmConsumptionItem[];
export type RatioConsumptionData = RatioConsumptionItem[];
export type SpeedingUsageData = SpeedingItem[];
export type HarshAccelerationBrakingUsageData = HarshAccelerationBraking[];

export type DashboardData = {
    engineData: EngineUsageData,
    engineDataPercentage: EngineUsagePercentageData,
    DaylyConsommationData: DaylyConsommationData,
    dureeDistanceparcouru: DurationDistanceData,
    DistanConsommation: DistanceConsumptionData,
    hundredKmConsumption: HundredKmConsumptionData,
    ratioConsumption: RatioConsumptionData,
}

export type exceptions = {
    speeding: SpeedingUsageData,
    harshAccelerationBraking: HarshAccelerationBrakingUsageData
}


export type vehicles = {
    groupid?: number;
    names: string,
    create_at: string,
    ids: number
}

export type filtersProps = {
    date1: string;
    date2: string;
    vehicle: number | string;
    groupid?: number | undefined;
    groupBy?: "day" | "week" | "month";
}

export type vehiclesGroup = {
    active?: boolean;
    names: string,
    create_at: string,
    ids: number
}
