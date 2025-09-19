function formatDureeParBase(data) {
    return data.map(item => {
        const day = item.dates ? getFrenchDayName(item.dates) : 'Période';

        const name = `${day} - ${item.vehicle_name} - ${item.base_name}`;

        return {
            name: name,
            day: day,
            base_name: item.base_name,
            vehicle_name: item.vehicle_name,
            base_id: item.base_id,
            duree_totale: item.duree_totale,
            dates: item.dates,
            key: `${day}-${item.base_id}-${item.vehicle_name}`
        };
    });
}


function formatToursParBase(data) {
    console.log(data);
    return data.map(item => {
        const day = item.dates ? getFrenchDayName(item.dates) : 'Période';

        const name = `${day} - ${item.vehicle_name} - ${item.base_name}`;

        return {
            name: name,
            day: day,
            base_name: item.base_name,
            vehicle_name: item.vehicle_name,
            base_id: item.base_id,
            nombre_tours: item.nombre_tours,
            dates: item.dates,
            key: `${day}-${item.base_id}-${item.vehicle_name}`
        };
    });
}


function formatDureeTransitMax(data) {
    return data.map(item => {
        const day = item.dates ? getFrenchDayName(item.dates) : 'Période';

        const name = `${day} - ${item.vehicle_name} - ${item.base_name}`;

        return {
            name: name,
            day: day,
            base_name: item.base_name,
            vehicle_name: item.vehicle_name,
            base_id: item.base_id,
            duree_transit_max: item.duree_transit_max,
            dates: item.dates,
            key: `${day}-${item.base_id}-${item.vehicle_name}`
        };
    });
}


function formatHistoriqueTransit(data) {
    return data.map(item => {
        const day = item.dates ? getFrenchDayName(item.dates) : 'Période';

        const name = `${day} - ${item.vehicle_name} - ${item.base_depart} → ${item.base_arrivee}`;

        return {
            name: name,
            day: day,
            vehicle_name: item.vehicle_name,
            base_depart: item.base_depart,
            base_arrivee: item.base_arrivee,
            base_depart_id: item.base_depart_id,
            base_arrivee_id: item.base_arrivee_id,
            date_depart: item.date_depart,
            date_arrivee: item.date_arrivee,
            duree_base_depart: item.duree_base_depart,
            duree_transit: item.duree_transit,
            dates: item.dates,
            key: `${day}-${item.vehicle_name}-${item.base_depart_id}-${item.base_arrivee_id}`
        };
    });
}


function getFrenchDayName(dateString) {
    if (!dateString) return 'Période';

    try {
        const date = new Date(dateString);
        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        return `${days[date.getDay()]}`;
    } catch (error) {
        console.error('Erreur conversion date:', error);
        return 'Date invalide';
    }
}


function formatDashboardDataForCharts(data) {
    return {
        DureeParBase: formatDureeParBase(data.DureeParBase),
        ToursParBase: formatToursParBase(data.ToursParBase),
        HistoriqueTransit: formatHistoriqueTransit(data.HistoriqueTransit),
        DureeTransitMax: formatDureeTransitMax(data.DureeTransitMax)
    };
}

module.exports = { formatDashboardDataForCharts }

