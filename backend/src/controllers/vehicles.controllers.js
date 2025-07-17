const { getVehicles } = require('../models/vehicles.model');

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



module.exports = { httpGetVehicles }
