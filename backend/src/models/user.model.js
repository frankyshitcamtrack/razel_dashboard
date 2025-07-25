const pool = require('../config/db');

async function getUserByUserNamePwd(username, pwd) {
    const result = await pool.query(
        'SELECT ids, username FROM users WHERE username = $1 AND pwd = $2',
        [username, pwd]
    );


    return result;
}

module.exports = { getUserByUserNamePwd }
