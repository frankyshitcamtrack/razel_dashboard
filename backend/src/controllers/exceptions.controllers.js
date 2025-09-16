const { getExceptions, getExceptionsByDatesAndId } = require('../models/exceptions.model');
const { formatExceptionsData, formatExceptionsDataWithperiod } = require('../utils/formatDashboardData');
const { reverseAllArrays } = require('../utils/reverse')



async function httpGetExceptions(req, res) {
    const { date1, date2, vehicleId, vehicleGroupId, page = 1, limit = 10 } = req.query;

    if (date1 && isNaN(new Date(date1).getTime())) {
        return res.status(400).json({
            error: 'date1 doit être une date valide (format: YYYY-MM-DD)'
        });
    }

    if (date2 && isNaN(new Date(date2).getTime())) {
        return res.status(400).json({
            error: 'date2 doit être une date valide (format: YYYY-MM-DD)'
        });
    }


    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
            error: 'page doit être un nombre entier positif'
        });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
            error: 'limit doit être un nombre entre 1 et 100'
        });
    }

    try {
        const result = await getExceptionsByDatesAndId(date1, date2, vehicleId, vehicleGroupId, pageNum, limitNum);
        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'something went wrong with the server'
        });
    }
}



async function httpGetExceptionsByParams(req, res) {
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
                if (!Array.isArray(parsed)) {
                    throw new Error();
                }
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


        const results = await getExceptions({
            dateFrom,
            dateTo,
            vehicleId: vehicleIds,
            groupId,
            weekDaysThisWeek: weekDaysArray,
            //page: 1, 
            //limit: 1000,
        });

        const formatData = await formatExceptionsDataWithperiod(results.data, groupBy);

        return res.status(200).json(reverseAllArrays(formatData));
    } catch (error) {
        console.error('Erreur dans httpGetExceptionsByParams:', error);

        if (error.message.includes('IDs doivent être') || error.message.includes('jours')) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(500).json({
            error: 'Une erreur est survenue lors de la récupération des données',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
}


module.exports = { httpGetExceptions, httpGetExceptionsByParams }
