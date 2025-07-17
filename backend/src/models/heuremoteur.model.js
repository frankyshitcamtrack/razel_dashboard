const pool = require('../config/db')


async function getHmoteur() {
    const result = await pool.query('SELECT * FROM heuremoteurs');
    return result[0];
}


module.exports = { getHmoteur }


