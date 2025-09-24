/**
 * Version avec format de nom personnalisable
 */
async function getTrajetsStatsDetails(data) {

    const groupedData = {};

    data.forEach(trajet => {
        const dateObj = new Date(trajet.dates);
        const dateFormatted = dateObj.toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });

        // Format: "lun. 22 sep - Véhicule A"
        const key = `${dateFormatted} - ${trajet.vehicle_name || 'Véhicule inconnu'}`;

        if (!groupedData[key]) {
            groupedData[key] = {
                name: key,
                tempsMoteur: 0,
                distance: 0,
                date: trajet.dates,
                vehicleName: trajet.vehicle_name,
                dateFormatted: dateFormatted
            };
        }

        groupedData[key].tempsMoteur += parseInt(trajet.tempsmoteur || 0);
        groupedData[key].distance += parseFloat(trajet.distance || 0);
    });

    // Trier par date
    const sortedData = Object.values(groupedData).sort((a, b) =>
        new Date(a.date) - new Date(b.date)
    );

    return {
        tempsMoteur: sortedData.map(item => ({
            name: item.name,
            value: item.tempsMoteur
        })),
        SommeDistances: sortedData.map(item => ({
            name: item.name,
            value: Math.round(item.distance * 100) / 100
        }))
    };
}

module.exports = { getTrajetsStatsDetails }