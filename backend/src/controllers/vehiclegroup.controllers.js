const { getVehiclesGroup } = require('../models/vehiclegroup.model');

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



module.exports = { httpGetVehiclesGroup }
