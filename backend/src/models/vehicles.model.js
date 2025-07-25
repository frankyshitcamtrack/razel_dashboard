const pool = require('../config/db')


async function getVehicles() {
    const result = await pool.query('SELECT * FROM vehicles');
    return result.rows;
}

async function getVehicleById(id) {
    const result = await pool.query('SELECT * FROM vehicles WHERE ids = $1', [id]);

    if (result.rows.length === 0) {
        throw new Error('Véhicule non trouvé');
    }

    return result.rows[0];
}



module.exports = { getVehicles, getVehicleById }
