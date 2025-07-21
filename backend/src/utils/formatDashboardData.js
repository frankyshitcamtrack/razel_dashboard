// Fonction utilitaire pour convertir des secondes en hh:mm:ss
function secondsToHms(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    // Formatage à 2 chiffres avec padding zéro si nécessaire
    const pad = (num) => num.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function formatDashboardData(rawData) {
    const dataByDay = {};

    // 1. Grouper les données par jour
    rawData.forEach(item => {
        const date = new Date(item.dates);
        const dayKey = date.toLocaleDateString('fr-FR', { weekday: 'short' });

        if (!dataByDay[dayKey]) {
            dataByDay[dayKey] = [];
        }
        dataByDay[dayKey].push(item);
    });

    // 2. Structurer les données pour le dashboard
    const result = {
        engineData: [],
        engineDataPercentage: [],
        dureeDistanceparcouru: [],
        DistanConsommation: [],
        hundredKmConsumption: [],
        ratioConsumption: [],
        speeding: []
    };

    // 3. Parcourir les données groupées
    Object.entries(dataByDay).forEach(([day, dayData]) => {
        // Prendre le premier élément comme référence (supposant que les calculs sont déjà faits)
        const sampleData = dayData[0];

        result.engineData.push({
            name: day,
            stops: sampleData.arretmoteurtournant, // Format hh:mm:ss existant
            usage: sampleData.dureel               // Format hh:mm:ss existant
        });

        result.engineDataPercentage.push({
            name: day,
            stops: sampleData.percentuse ? 100 - sampleData.percentuse : 0,
            usage: sampleData.percentuse || 0
        });

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
            value: sampleData.vmax > 80 ? 1 : 0 // Exemple: compte comme excès si > 80
        });
    });

    return result;
}

module.exports = { formatDashboardData, secondsToHms };