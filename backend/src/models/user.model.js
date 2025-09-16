const pool = require('../config/db');

async function getUserByUserNamePwd(username, pwd) {
    // console.log(username);

    const result = await pool.query(
        'SELECT ids,pwd, username,isadmin FROM users WHERE username = $1 AND pwd = $2',
        [username, pwd]
    );


    return result;
}

async function roleUsers() {
    try {
        const query = `SELECT u.*, vg.*, ru.vclegrpid AS groupID FROM roleusers ru INNER JOIN users u ON ru.userId = u.ids INNER JOIN vclegroup vg ON ru.vclegrpid= vg.ids`;
        const result = await pool.query(query);
        // console.log(result.rows)
        return result.rows;
    } catch (error) {
        console.error('Error fetching vehicle groups:', error);
        throw new Error('Failed to retrieve vehicle groups');
    }
}



module.exports = { getUserByUserNamePwd, roleUsers }
