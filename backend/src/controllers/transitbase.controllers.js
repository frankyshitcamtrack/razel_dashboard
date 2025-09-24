const { gettransitbase, getAllDashboards } = require('../models/transitbase.model');
const { reverseAllArrays } = require('../utils/reverse');
const { formatDashboardDataForCharts } = require('../utils/formatTransitData')

async function httpGettransitbase(req, res) {
    try {
        return res.status(200).json(await gettransitbase());
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'something went wrong with the server'
        })
    }
}


async function httpGetTransitDashboards(req, res) {
    try {
        const { date1, date2, vehicle, weekDays } = req.query;

        // Validation des dates
        if (date1 && isNaN(new Date(date1).getTime())) {
            return res.status(400).json({
                error: 'date1 doit être une date valide (format: YYYY-MM-DD)',
            });
        }
        if (date2 && isNaN(new Date(date2).getTime())) {
            return res.status(400).json({
                error: 'date2 doit être une date valide (format: YYYY-MM-DD)',
            });
        }

        // Traitement du paramètre vehicle
        let vehicleIds = null;
        if (vehicle) {
            try {
                const parsed = JSON.parse(vehicle);
                if (Array.isArray(parsed)) {
                    vehicleIds = parsed.map((idVal) => {
                        const num = Number(idVal);
                        if (isNaN(num)) throw new Error('Tous les IDs doivent être des nombres valides');
                        return num;
                    });
                } else {
                    const num = Number(vehicle);
                    if (isNaN(num)) {
                        return res.status(400).json({
                            error: 'vehicle doit être un nombre valide ou une liste de nombres',
                        });
                    }
                    vehicleIds = [num];
                }
            } catch (err) {
                return res.status(400).json({
                    error: 'vehicle doit être un nombre valide ou un tableau JSON valide',
                });
            }
        }

        // Traitement du paramètre weekDays
        let weekDaysArray = null;
        if (weekDays && vehicle) {
            try {
                const parsed = JSON.parse(weekDays);
                if (!Array.isArray(parsed)) throw new Error();
                if (!parsed.every(d => d >= 1 && d <= 7)) {
                    throw new Error('Les jours doivent être entre 1 (lundi) et 7 (dimanche)');
                }
                weekDaysArray = parsed;
            } catch (err) {
                return res.status(400).json({
                    error: 'weekDays doit être un tableau de nombres entre 1 et 7 (ex: [1,3,5])',
                });
            }
        }

        // Formatage des dates
        const dateFrom = date1 ? new Date(date1).toISOString().split('T')[0] : undefined;
        const dateTo = date2 ? new Date(date2).toISOString().split('T')[0] : undefined;

        // Récupération des données
        const results = await getAllDashboards({
            dateFrom,
            dateTo,
            vehicleId: vehicleIds,
            weekDaysThisWeek: weekDaysArray,
        });

        // Formatage des données pour les graphiques avec jours individuels
        const formattedData = formatDashboardDataForCharts(results);

        return res.status(200).json(formattedData);

    } catch (error) {
        console.error('Erreur dans httpGetTransitDashboards:', error);

        if (error.message.includes('IDs doivent être') || error.message.includes('jours')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Une erreur est survenue lors de la récupération des données',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
}







module.exports = { httpGettransitbase, httpGetTransitDashboards }