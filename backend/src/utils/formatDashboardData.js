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


        id ? result.DaylyConsommationData.push({
            name: day,
            daylyConsom: sampleData.consototal,

        }) : '';

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


module.exports = { formatDashboardData, secondsToHms, formatExceptionsData };