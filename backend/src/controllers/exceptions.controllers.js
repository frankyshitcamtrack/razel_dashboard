const { getExceptions } = require('../models/exceptions.model');

async function httpGetExceptions(req, res) {
    try {
        return res.status(200).json(await getExceptions());
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'something went wrong with the server'
        })
    }
}



module.exports = { httpGetExceptions }
