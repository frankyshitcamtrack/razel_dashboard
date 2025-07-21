const pool = require('../config/db')


async function getHmoteur() {
    const result = await pool.query('SELECT * FROM heuremoteurs');
    return result.rows;
}

async function getHmoteurByDatesAndId(date1, date2, id) {
    let query = 'SELECT * FROM heuremoteurs';
    let conditions = [];
    let params = [];

    if (date1 && date2) {
        conditions.push('dates BETWEEN $1 AND $2');
        params.push(date1, date2);
    } else if (date1) {
        conditions.push('dates >= $1');
        params.push(date1);
    } else if (date2) {
        conditions.push('dates <= $1');
        params.push(date2);
    }

    if (id) {
        const paramIndex = params.length + 1;
        conditions.push(`vcleid = $${paramIndex}`);
        params.push(id);
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


