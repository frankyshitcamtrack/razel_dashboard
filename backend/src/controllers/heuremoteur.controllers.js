const { getHmoteur, getHmoteurByDatesAndId } = require('../models/heuremoteur.model');
const { formatDashboardData, formatDashboardDataWithperiod } = require('../utils/formatDashboardData');
const { reverseAllArrays } = require('../utils/reverse')


async function httpGetHeureMoteur(req, res) {
    const { page, limit, dateFrom, dateTo, groupId } = req.query;


    if (dateFrom && isNaN(new Date(dateFrom).getTime())) {
        return res.status(400).json({
            error: 'dateFrom doit être une date valide (format: YYYY-MM-DD)'
        });
    }

    if (dateTo && isNaN(new Date(dateTo).getTime())) {
        return res.status(400).json({
            error: 'dateTo doit être une date valide (format: YYYY-MM-DD)'
        });
    }
    try {
        return res.status(200).json(await getHmoteur({ page, limit, dateFrom, dateTo, groupId }));
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'something went wrong with the server'
        })
    }
}



async function httpGetHeureMoteurByParams(req, res) {
    try {
        const { date1, date2, groupBy, vehicle, vcleGroupId, weekDays } = req.query;


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


        let vehicleIds = null;
        if (vehicle) {
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
                        error: 'id doit être un nombre valide ou une liste de nombres',
                    });
                }
                vehicleIds = [num];
            }
        }


        const groupId = vcleGroupId ? Number(vcleGroupId) : undefined;
        if (vcleGroupId && isNaN(groupId)) {
            return res.status(400).json({
                error: 'vcleGroupId doit être un nombre valide',
            });
        }

        let weekDaysArray = null;
        if (weekDays) {
            try {
                const parsed = JSON.parse(weekDays);
                if (!Array.isArray(parsed)) throw new Error();
                if (!parsed.every(d => d >= 1 && d <= 7)) {
                    throw new Error('Les jours doivent être entre 1 (lundi) et 7 (dimanche)');
                }
                weekDaysArray = parsed;
            } catch (err) {
                return res.status(400).json({
                    error: 'weekDaysThisWeek doit être un tableau de nombres (ex: [1,3,5])',
                });
            }
        }


        const dateFrom = date1 ? new Date(date1).toISOString().split('T')[0] : undefined;
        const dateTo = date2 ? new Date(date2).toISOString().split('T')[0] : undefined;

        const results = await getHmoteur({
            dateFrom,
            dateTo,
            vehicleId: vehicleIds,
            groupId,
            weekDaysThisWeek: weekDaysArray,
            // page: 1,
            //limit: 1000,
        });

        const data = await formatDashboardDataWithperiod(results.data, groupBy, vehicleIds);

        return res.status(200).json(reverseAllArrays(data));
    } catch (error) {
        console.error('Erreur dans httpGetHeureMoteurByParams:', error);

        if (error.message.includes('IDs doivent être') || error.message.includes('jours')) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(500).json({
            error: 'Une erreur est survenue lors de la récupération des données',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
}
module.exports = { httpGetHeureMoteur, httpGetHeureMoteurByParams }
