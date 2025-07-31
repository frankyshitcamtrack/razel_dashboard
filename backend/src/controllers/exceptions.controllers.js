const { getExceptions, getExceptionsByDatesAndId } = require('../models/exceptions.model');
const { formatExceptionsData, formatExceptionsDataWithperiod } = require('../utils/formatDashboardData')

async function httpGetExceptions(req, res) {
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
        return res.status(200).json(await getExceptions({ page, limit, dateFrom, dateTo, groupId }));
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'something went wrong with the server'
        })
    }
}



async function httpGetExceptionsByParams(req, res) {
    try {
        const { date1, date2, groupBy, id, vcleGroupId } = req.query;

        // Validation des dates
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


        let vehicleIds = null;
        if (id) {
            if (Array.isArray(id)) {

                vehicleIds = id.map(id => {
                    const num = Number(id);
                    if (isNaN(num)) {
                        throw new Error('Tous les IDs doivent être des nombres valides');
                    }
                    return num;
                });
            } else {

                const num = Number(id);
                if (isNaN(num)) {
                    return res.status(400).json({
                        error: 'id doit être un nombre valide ou une liste de nombres'
                    });
                }
                vehicleIds = [num];
            }
        }

        if (vcleGroupId && isNaN(Number(vcleGroupId))) {
            return res.status(400).json({
                error: 'vcleGroupId doit être un nombre valide'
            });
        }


        const dateFrom = date1 ? new Date(date1).toISOString().split('T')[0] : undefined;
        const dateTo = date2 ? new Date(date2).toISOString().split('T')[0] : undefined;


        const results = await getExceptionsByDatesAndId(
            dateFrom,
            dateTo,
            vehicleIds,
            vcleGroupId ? Number(vcleGroupId) : undefined
        );

        const formatData = await formatExceptionsDataWithperiod(results, groupBy);

        return res.status(200).json(formatData);

    } catch (error) {
        console.error('Erreur dans httpGetExceptionsByParams:', error);


        if (error.message.includes('IDs doivent être')) {
            return res.status(400).json({
                error: error.message
            });
        }

        return res.status(500).json({
            error: 'Une erreur est survenue lors de la récupération des données',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}


module.exports = { httpGetExceptions, httpGetExceptionsByParams }
