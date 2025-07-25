const { getVehicles, getVehicleById } = require('../models/vehicles.model');

async function httpGetVehicles(req, res) {
    try {
        return res.status(200).json(await getVehicles());
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'something went wrong with the server'
        })
    }
}


async function httpGetVehicleById(req, res) {
    try {
        const { id } = req.query;
        if (id && isNaN(Number(id))) {
            return res.status(400).json({
                error: 'id doit être un nombre valide'
            });
        }

        const results = await getVehicleById(id);
        return res.status(200).json(results);
    } catch (error) {
        console.error('Erreur dans httpGetVehicleById:', error);
        return res.status(500).json({
            error: 'Une erreur est survenue lors de la récupération des données'
        });
    }
}



module.exports = { httpGetVehicles, httpGetVehicleById }
