const { getVehiclesGroup, getGroupById } = require('../models/vehiclegroup.model');

async function httpGetVehiclesGroup(req, res) {
    try {
        return res.status(200).json(await getVehiclesGroup());
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'something went wrong with the server'
        })
    }
}


async function httpGetVehiclesGroupByID(req, res) {
    const { id } = req.query

    try {
        if (id && isNaN(Number(id))) {
            return res.status(400).json({
                error: 'id doit être un nombre valide'
            });
        }
        const results = await getGroupById(id);
        return res.status(200).json(results);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'something went wrong with the server'
        })
    }
}



module.exports = { httpGetVehiclesGroup, httpGetVehiclesGroupByID }
