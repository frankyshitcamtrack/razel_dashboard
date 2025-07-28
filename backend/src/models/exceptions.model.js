const pool = require('../config/db')


async function getExceptions() {
    const result = await pool.query('SELECT * FROM exceptionsnbr');
    return result.rows;
}


async function getExceptionsByDatesAndId(date1, date2, vehicleId, vehicleGroupId) {
    let query = `
        SELECT e.* 
        FROM exceptionsnbr e
        JOIN vehicles v ON e.vcleid = v.ids
    `;
    let conditions = [];
    let params = [];

    const convertToUTC = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        date.setHours(date.getHours() - 1);
        return date.toISOString();
    };

    if (date1 && date2) {
        conditions.push('e.dates BETWEEN $1 AND $2');
        params.push(convertToUTC(date1), convertToUTC(date2));
    } else if (date1) {
        conditions.push('e.dates >= $1');
        params.push(convertToUTC(date1));
    } else if (date2) {
        conditions.push('e.dates <= $1');
        params.push(convertToUTC(date2));
    }

    if (vehicleId) {
        const paramIndex = params.length + 1;
        conditions.push(`e.vcleid = $${paramIndex}`);
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



module.exports = { getExceptions, getExceptionsByDatesAndId }
