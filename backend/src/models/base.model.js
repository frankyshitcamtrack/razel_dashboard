const pool = require('../config/db')


async function getbases() {
    const result = await pool.query('SELECT * FROM bases');
    return result.rows;
}


module.exports = { getbases }