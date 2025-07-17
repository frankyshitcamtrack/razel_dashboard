const pool = require('../config/db')


async function getExceptions() {
    const result = await pool.query('SELECT * FROM exceptionsnbr');
    return result[0];
}


module.exports = { getExceptions }
