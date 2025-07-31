const pool = require('../config/db')


async function getVehiclesGroup() {
    try {
        const query = `SELECT * FROM vclegroup WHERE actives = '1' ORDER BY names`;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching vehicle groups:', error);
        throw new Error('Failed to retrieve vehicle groups');
    }
}


async function getGroupById(id) {
    const result = await pool.query('SELECT * FROM vclegroup WHERE ids = $1', [id]);
    if (result.rows.length === 0) {
        throw new Error('group non trouvé');
    }

    return result.rows[0];
}

module.exports = { getVehiclesGroup, getGroupById }
