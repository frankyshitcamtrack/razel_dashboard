const pool = require('../config/db')


async function getVehicles() {
    const result = await pool.query('SELECT * FROM vehicles');
    return result.rows;
}


module.exports = { getVehicles }
