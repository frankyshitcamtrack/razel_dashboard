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


// 7.Acceleration exetives
export interface HarshAccelerationBraking extends BaseChartItem {
    name: string,
    acceleration: number,
    braking: number
}

//---------------------------------transit base---------------------------\\
// 8.duree par base
export interface DureeParBase extends BaseChartItem {
    duree_totale: string,
}

//9.tours par base
export interface NbrsToursParBase extends BaseChartItem {
    nombre_tours: number,
}

//10.Historique Transit
export interface HistoriqueTransit extends BaseChartItem {
    duree_base_depart: string,
    duree_transit: string
}

//11.Duree transit
export interface DureeTransit extends BaseChartItem {
    duree_transit_max: string
}

//---------------------------------trajet---------------------------\\
// 12.temps moteur
export interface tempsMoteur extends BaseChartItem {
    value: string,
}

//13.sommes des distances
export interface SommeDistances extends BaseChartItem {
    value: number,
}

export type TempsMoteurData = tempsMoteur[];
export type SommeDistancesData = SommeDistances[];

export type DureeParBaseData = DureeParBase[];
export type NbrsToursParBaseData = NbrsToursParBase[];
export type HistoriqueTransitData = HistoriqueTransit[];
export type DureeTransitData = DureeTransit[];

export type EngineUsageData = EngineUsageItem[];
export type EngineUsagePercentageData = EngineUsagePercentageItem[];
export type DaylyConsommationData = DaylyConsommationItem[];
export type DurationDistanceData = DurationDistanceItem[];
export type DistanceConsumptionData = DistanceConsumptionItem[];
export type HundredKmConsumptionData = HundredKmConsumptionItem[];
export type RatioConsumptionData = RatioConsumptionItem[];
export type SpeedingUsageData = SpeedingItem[];
export type HarshAccelerationBrakingUsageData = HarshAccelerationBraking[];



export type DashboardTrajet = {
    tempsMoteur: TempsMoteurData,
    SommeDistances: SommeDistancesData
}


export type DashboardData = {
    engineData: EngineUsageData,
    engineDataPercentage: EngineUsagePercentageData,
    DaylyConsommationData: DaylyConsommationData,
    dureeDistanceparcouru: DurationDistanceData,
    DistanConsommation: DistanceConsumptionData,
    hundredKmConsumption: HundredKmConsumptionData,
    ratioConsumption: RatioConsumptionData
}


export type DashboardTransitData = {
    DureeParBase: DureeParBaseData,
    ToursParBase: NbrsToursParBaseData,
    HistoriqueTransit: HistoriqueTransitData,
    DureeTransitMax: DureeTransitData
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
