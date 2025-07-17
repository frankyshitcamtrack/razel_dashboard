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


// 3. Durée d'utilisation et distance parcourue
export interface DurationDistanceItem extends BaseChartItem {
    duration: number;   // Durée en secondes ou minutes
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
    value: number; // Nombre d'excès de vitesse
}



export type EngineUsageData = EngineUsageItem[];
export type EngineUsagePercentageData = EngineUsagePercentageItem[];
export type DurationDistanceData = DurationDistanceItem[];
export type DistanceConsumptionData = DistanceConsumptionItem[];
export type HundredKmConsumptionData = HundredKmConsumptionItem[];
export type RatioConsumptionData = RatioConsumptionItem[];
export type SpeedingData = SpeedingItem[];

export type dashboardType = {
    engineData: EngineUsageData,
    engineDataPercentage: EngineUsagePercentageData,
    dureeDistanceparcouru: DurationDistanceData,
    DistanConsommation: DistanceConsumptionData,
    hundredKmConsumption: HundredKmConsumptionData,
    ratioConsumption: RatioConsumptionData,
    speeding: SpeedingData
}
