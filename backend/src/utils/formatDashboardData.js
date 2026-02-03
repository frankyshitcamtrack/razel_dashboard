function secondsToHms(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

async function formatDashboardData(rawData, id = undefined) {
    // 1. Grouper les données par jour
    const dataByDay = {};
    rawData.forEach(item => {
        const date = new Date(item.dates);
        const dayKey = date.toLocaleDateString('fr-FR', { weekday: 'short' });

        if (!dataByDay[dayKey]) {
            dataByDay[dayKey] = [];
        }
        dataByDay[dayKey].push(item);
    });


    // 3. Structurer les données pour le dashboard
    const result = {
        engineData: [],
        engineDataPercentage: [],
        DaylyConsommationData: [],
        dureeDistanceparcouru: [],
        DistanConsommation: [],
        hundredKmConsumption: [],
        ratioConsumption: [],
        speeding: []
    };

    // 4. Parcourir les données groupées
    Object.entries(dataByDay).forEach(([day, dayData]) => {
        if (dayData.length === 0) return;

        const sampleData = dayData[0];

        result.engineData.push({
            name: day,
            stops: sampleData.arretmoteurtournant,
            usage: sampleData.dureel
        });

        result.engineDataPercentage.push({
            name: day,
            stops: sampleData.percentuse ? 100 - sampleData.percentuse : 0,
            usage: sampleData.percentuse || 0
        });


        result.DaylyConsommationData.push({
            name: day,
            daylyConsom: sampleData.consototal,

        })

        result.dureeDistanceparcouru.push({
            name: day,
            duration: sampleData.dureel,
            distance: sampleData.distancekm
        });

        result.DistanConsommation.push({
            name: day,
            consumption: sampleData.consototal,
            distance: sampleData.distancekm
        });

        result.hundredKmConsumption.push({
            name: day,
            value: sampleData.conso100km
        });

        result.ratioConsumption.push({
            name: day,
            value: sampleData.consolitperhour
        });

        result.speeding.push({
            name: day,
            value: sampleData.vmax > 80 ? 1 : 0
        });
    });

    return result;
}


async function formatDashboardDataWithperiod(rawData, groupBy = 'day', id) {
    const dataByPeriodAndVehicle = {};

    // Fonction pour convertir les secondes en hh:mm:ss
    const secondsToHms = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Fonction pour obtenir la clé de semaine ISO
    const getWeekKey = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        // Jeudi de la semaine
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        // Premier jour de l'année
        const yearStart = new Date(d.getFullYear(), 0, 1);
        // Calcul du numéro de semaine
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
    };

    // 1. Grouper les données selon la période et le véhicule
    rawData.forEach(item => {
        const date = new Date(item.dates);
        let periodKey;

        switch (groupBy) {
            case 'week':
                periodKey = getWeekKey(date);
                break;
            case 'month':
                periodKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                break;
            default: // 'day'
                periodKey = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
        }

        const vehicleKey = `${periodKey}_${item.vcleid}`;
        
        if (!dataByPeriodAndVehicle[vehicleKey]) {
            dataByPeriodAndVehicle[vehicleKey] = {
                periodKey,
                vehicleId: item.vcleid,
                vehicleName: item.vehicle_name,
                data: []
            };
        }
        dataByPeriodAndVehicle[vehicleKey].data.push(item);
    });

    // 2. Préparer la structure de résultats
    const result = {
        engineData: [],
        engineDataPercentage: [],
        DaylyConsommationData: [],
        dureeDistanceparcouru: [],
        DistanConsommation: [],
        hundredKmConsumption: [],
        ratioConsumption: [],
        speeding: []
    };

    // 3. Calculer les agrégats pour chaque période et véhicule
    Object.values(dataByPeriodAndVehicle).forEach(({ periodKey, vehicleId, vehicleName, data: periodData }) => {
        if (periodData.length === 0) return;

        // Calcul des totaux
        let totalUsageSec = 0;
        let totalStopsSec = 0;
        let totalDistance = 0;
        let totalConsumption = 0;
        let speedingCount = 0;

        periodData.forEach(item => {
            // Convertir les durées en secondes
            const [usageH, usageM, usageS] = item.dureel.split(':').map(Number);
            const [stopH, stopM, stopS] = item.arretmoteurtournant.split(':').map(Number);

            totalUsageSec += usageH * 3600 + usageM * 60 + usageS;
            totalStopsSec += stopH * 3600 + stopM * 60 + stopS;
            totalDistance += item.distancekm || 0;
            totalConsumption += item.consototal || 0;
            if (item.vmax > 80) speedingCount++;
        });

        // Calculer les pourcentages
        const totalDurationSec = totalUsageSec + totalStopsSec;
        const usagePercentage = totalDurationSec > 0
            ? Math.round((totalUsageSec / totalDurationSec) * 100)
            : 0;

        // Formater le nom d'affichage
        let displayName;
        const firstDate = new Date(periodData[0].dates);

        switch (groupBy) {
            case 'week':
                const weekNumber = periodKey.split('-W')[1];
                displayName = `Semaine ${weekNumber}`;
                break;
            case 'month':
                displayName = firstDate.toLocaleDateString('fr-FR', {
                    month: 'long',
                    year: 'numeric'
                });
                break;
            default: // 'day'
                displayName = firstDate.toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    day: 'numeric'
                });
        }

        // Ajouter les données au résultat avec les informations du véhicule
        result.engineData.push({
            name: displayName,
            stops: secondsToHms(totalStopsSec),
            usage: secondsToHms(totalUsageSec),
            vehicle_id: vehicleId,
            vehicle_name: vehicleName
        });

        result.engineDataPercentage.push({
            name: displayName,
            stops: 100 - usagePercentage,
            usage: usagePercentage,
            vehicle_id: vehicleId,
            vehicle_name: vehicleName
        });

        result.DaylyConsommationData.push({
            name: displayName,
            daylyConsom: parseFloat(totalConsumption.toFixed(2)),
            vehicle_id: vehicleId,
            vehicle_name: vehicleName
        });

        result.dureeDistanceparcouru.push({
            name: displayName,
            duration: secondsToHms(totalUsageSec),
            distance: parseFloat(totalDistance.toFixed(2)),
            vehicle_id: vehicleId,
            vehicle_name: vehicleName
        });

        result.DistanConsommation.push({
            name: displayName,
            consumption: parseFloat(totalConsumption.toFixed(2)),
            distance: parseFloat(totalDistance.toFixed(2)),
            vehicle_id: vehicleId,
            vehicle_name: vehicleName
        });

        const avg100km = totalDistance > 0
            ? (totalConsumption / totalDistance) * 100
            : 0;

        result.hundredKmConsumption.push({
            name: displayName,
            value: parseFloat(avg100km.toFixed(2)),
            vehicle_id: vehicleId,
            vehicle_name: vehicleName
        });

        const avgLiterPerHour = totalUsageSec > 0
            ? (totalConsumption / (totalUsageSec / 3600))
            : 0;

        result.ratioConsumption.push({
            name: displayName,
            value: parseFloat(avgLiterPerHour.toFixed(2)),
            vehicle_id: vehicleId,
            vehicle_name: vehicleName
        });

        result.speeding.push({
            name: displayName,
            value: speedingCount,
            vehicle_id: vehicleId,
            vehicle_name: vehicleName
        });
    });

    return result;
}



async function formatExceptionsData(rawData) {

    const dataByDay = {};
    rawData.forEach(item => {
        const date = new Date(item.dates);
        const dayKey = date.toLocaleDateString('fr-FR', { weekday: 'short' });

        if (!dataByDay[dayKey]) {
            dataByDay[dayKey] = [];
        }
        dataByDay[dayKey].push(item);
    });


    // 3. Structurer les données pour le dashboard
    const result = {
        speeding: [],
        harshAccelerationBraking: []
    };

    // 4. Parcourir les données groupées
    Object.entries(dataByDay).forEach(([day, dayData]) => {
        if (dayData.length === 0) return;

        const sampleData = dayData[0];


        result.speeding.push({
            name: day,
            value: sampleData.nbrsp,
        });

        result.harshAccelerationBraking.push({
            name: day,
            acceleration: sampleData.nbha,
            braking: sampleData.nbrhb
        });
    });

    return result;
}


async function formatExceptionsDataWithperiod(rawData, groupBy = 'day') {
    const dataByPeriodAndVehicle = {};

    // Fonction pour obtenir la clé de semaine ISO
    const getWeekKey = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        // Jeudi de la semaine
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        // Premier jour de l'année
        const yearStart = new Date(d.getFullYear(), 0, 1);
        // Calcul du numéro de semaine
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
    };

    // 1. Grouper les données selon la période et le véhicule
    rawData.forEach(item => {
        const date = new Date(item.dates);
        let periodKey;

        switch (groupBy) {
            case 'week':
                periodKey = getWeekKey(date);
                break;
            case 'month':
                periodKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                break;
            default: // 'day'
                periodKey = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
        }

        const vehicleKey = `${periodKey}_${item.vcleid}`;
        
        if (!dataByPeriodAndVehicle[vehicleKey]) {
            dataByPeriodAndVehicle[vehicleKey] = {
                periodKey,
                vehicleId: item.vcleid,
                vehicleName: item.vehicle_name,
                data: []
            };
        }
        dataByPeriodAndVehicle[vehicleKey].data.push(item);
    });

    // 2. Préparer la structure de résultats
    const result = {
        speeding: [],
        harshAccelerationBraking: []
    };

    // 3. Calculer les agrégats pour chaque période et véhicule
    Object.values(dataByPeriodAndVehicle).forEach(({ periodKey, vehicleId, vehicleName, data: periodData }) => {
        if (periodData.length === 0) return;

        // Calcul des totaux
        let totalSpeeding = 0;
        let totalAcceleration = 0;
        let totalBraking = 0;

        periodData.forEach(item => {
            totalSpeeding += item.nbrsp || 0;
            totalAcceleration += item.nbha || 0;
            totalBraking += item.nbrhb || 0;
        });

        // Formater le nom d'affichage
        let displayName;
        const firstDate = new Date(periodData[0].dates);

        switch (groupBy) {
            case 'week':
                const weekNumber = periodKey.split('-W')[1];
                displayName = `Semaine ${weekNumber}`;
                break;
            case 'month':
                displayName = firstDate.toLocaleDateString('fr-FR', {
                    month: 'long',
                    year: 'numeric'
                });
                break;
            default: // 'day'
                displayName = firstDate.toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    day: 'numeric'
                });
        }

        // Ajouter les données au résultat avec les informations du véhicule
        result.speeding.push({
            name: displayName,
            value: totalSpeeding,
            vehicle_id: vehicleId,
            vehicle_name: vehicleName
        });

        result.harshAccelerationBraking.push({
            name: displayName,
            acceleration: totalAcceleration,
            braking: totalBraking,
            vehicle_id: vehicleId,
            vehicle_name: vehicleName
        });
    });

    return result;
}


module.exports = { formatDashboardData, secondsToHms, formatExceptionsData, formatDashboardDataWithperiod, formatExceptionsDataWithperiod };