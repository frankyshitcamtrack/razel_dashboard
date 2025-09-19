const { getbases } = require('../models/base.model');

async function httpGetbases(req, res) {
    try {
        return res.status(200).json(await getbases());
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'something went wrong with the server'
        })
    }
}


module.exports = { httpGetbases }