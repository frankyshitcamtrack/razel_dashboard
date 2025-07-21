const pool = require('../config/db')


async function getExceptions() {
    const result = await pool.query('SELECT * FROM exceptionsnbr');
    return result.rows;
}


async function getExceptionsByDatesAndId(date1, date2, id) {
    let query = 'SELECT * FROM exceptionsnbr';
    let conditions = [];
    let params = [];


    const convertToUTC = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        date.setHours(date.getHours() - 1);
        return date.toISOString();
    };

    if (date1 && date2) {
        conditions.push('dates BETWEEN $1 AND $2');
        params.push(convertToUTC(date1), convertToUTC(date2));
    } else if (date1) {
        conditions.push('dates >= $1');
        params.push(convertToUTC(date1));
    } else if (date2) {
        conditions.push('dates <= $1');
        params.push(convertToUTC(date2));
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



module.exports = { getExceptions, getExceptionsByDatesAndId }
