const { getHmoteur, getHmoteurByDatesAndId } = require('../models/heuremoteur.model');
const { formatDashboardData } = require('../utils/formatDashboardData');

async function httpGetHeureMoteur(req, res) {
    try {
        return res.status(200).json(await getHmoteur());
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'something went wrong with the server'
        })
    }
}


async function httpGetHeureMoteurByParams(req, res) {
    try {

        const { date1, date2, id } = req.query;

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


        if (id && isNaN(Number(id))) {
            return res.status(400).json({
                error: 'id doit être un nombre valide'
            });
        }


        const results = await getHmoteurByDatesAndId(date1, date2, id);

        const data = await formatDashboardData(results, id)

        return res.status(200).json(data);

    } catch (error) {
        console.error('Erreur dans httpGetHeureMoteur:', error);
        return res.status(500).json({
            error: 'Une erreur est survenue lors de la récupération des données'
        });
    }
}


module.exports = { httpGetHeureMoteur, httpGetHeureMoteurByParams }
