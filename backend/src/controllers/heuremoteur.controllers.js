const { getHmoteur } = require('../models/heuremoteur.model');

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



module.exports = { httpGetHeureMoteur }
