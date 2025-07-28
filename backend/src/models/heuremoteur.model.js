const pool = require('../config/db')


async function getHmoteur() {
    const result = await pool.query('SELECT * FROM heuremoteurs');
    return result.rows;
}

async function getHmoteurByDatesAndId(date1, date2, vehicleId, vehicleGroupId) {
    let query = `
        SELECT hm.* 
        FROM heuremoteurs hm
        JOIN vehicles v ON hm.vcleid = v.ids
    `;
    let conditions = [];
    let params = [];

    if (date1 && date2) {
        conditions.push('hm.dates BETWEEN $1 AND $2');
        params.push(date1, date2);
    } else if (date1) {
        conditions.push('hm.dates >= $1');
        params.push(date1);
    } else if (date2) {
        conditions.push('hm.dates <= $1');
        params.push(date2);
    }

    if (vehicleId) {
        const paramIndex = params.length + 1;
        conditions.push(`hm.vcleid = $${paramIndex}`);
        params.push(vehicleId);
    }

    if (vehicleGroupId) {
        const paramIndex = params.length + 1;
        conditions.push(`v.groupid = $${paramIndex}`);
        params.push(vehicleGroupId);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    try {
        const results = await pool.query(query, params);
        return results.rows;
    } catch (error) {
        throw error;
    }
}


module.exports = { getHmoteur, getHmoteurByDatesAndId }


