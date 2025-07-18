function formatDashboardData(rawData) {

    const dataByDay = {};

    rawData.forEach(item => {
        const date = new Date(item.dates);
        const dayKey = date.toLocaleDateString('fr-FR', { weekday: 'short' });

        if (!dataByDay[dayKey]) {
            dataByDay[dayKey] = [];
        }
        dataByDay[dayKey].push(item);
    });

    // Créer les différentes catégories de données
    const engineData = [];
    const engineDataPercentage = [];
    const dureeDistanceparcouru = [];
    const DistanConsommation = [];
    const hundredKmConsumption = [];
    const ratioConsumption = [];
    const speeding = [];

    // Traiter chaque jour
    Object.entries(dataByDay).forEach(([day, dayData]) => {
        // Calculs pour EngineUsage
        const totalStops = dayData.reduce((sum, item) => {
            const [hours, minutes, seconds] = item.arretmoteurtournant.split(':').map(Number);
            return sum + hours * 3600 + minutes * 60 + seconds;
        }, 0);

        const totalUsage = dayData.reduce((sum, item) => {
            const [hours, minutes, seconds] = item.dureel.split(':').map(Number);
            return sum + hours * 3600 + minutes * 60 + seconds;
        }, 0);

        // Calculs pour EngineUsagePercentage
        const totalDuration = dayData.reduce((sum, item) => {
            const [hours, minutes, seconds] = item.dureetotal.split(':').map(Number);
            return sum + hours * 3600 + minutes * 60 + seconds;
        }, 0);

        const stopsPercentage = totalDuration > 0 ? Math.round((totalStops / totalDuration) * 100) : 0;
        const usagePercentage = totalDuration > 0 ? Math.round((totalUsage / totalDuration) * 100) : 0;

        // Calculs pour DurationDistance
        const totalDistance = dayData.reduce((sum, item) => sum + (item.distancekm || 0), 0);

        // Calculs pour DistanceConsumption
        const totalConsumption = dayData.reduce((sum, item) => sum + (item.consototal || 0), 0);

        // Calculs pour HundredKmConsumption
        const avgConsumption = totalDistance > 0 ? (totalConsumption / totalDistance) * 100 : 0;

        // Calculs pour RatioConsumption
        const totalDurationHours = totalUsage > 0 ? totalUsage / 3600 : 1; // Éviter la division par zéro
        const consumptionRatio = totalConsumption / totalDurationHours;

        // Calculs pour Speeding (exemple: nombre de fois où vmax > 80)
        const speedingCount = dayData.filter(item => item.vmax > 80).length;

        // Ajouter les données pour ce jour
        engineData.push({
            name: day,
            stops: Math.round(totalStops / 3600 * 10) / 10, // Convertir en heures
            usage: Math.round(totalUsage / 3600 * 10) / 10   // Convertir en heures
        });

        engineDataPercentage.push({
            name: day,
            stops: stopsPercentage,
            usage: usagePercentage
        });

        dureeDistanceparcouru.push({
            name: day,
            duration: Math.round(totalUsage / 60), // Convertir en minutes
            distance: Math.round(totalDistance * 10) / 10
        });

        DistanConsommation.push({
            name: day,
            consumption: Math.round(totalConsumption * 10) / 10,
            distance: Math.round(totalDistance * 10) / 10
        });

        hundredKmConsumption.push({
            name: day,
            value: Math.round(avgConsumption * 10) / 10
        });

        ratioConsumption.push({
            name: day,
            value: Math.round(consumptionRatio * 10) / 10
        });

        speeding.push({
            name: day,
            value: speedingCount
        });
    });

    // Retourner l'objet formaté
    return {
        engineData,
        engineDataPercentage,
        dureeDistanceparcouru,
        DistanConsommation,
        hundredKmConsumption,
        ratioConsumption,
        speeding
    };
}


module.exports = { formatDashboardData }
