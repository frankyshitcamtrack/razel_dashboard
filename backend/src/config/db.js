const { Pool } = require('pg')

const pass_db = process.env.PASS_DB;
const user_db = process.env.USER_DB;
const db = process.env.DB;
const host = process.env.HOST;

const pool = new Pool(
    {
        host: host,
        user: user_db,
        password: pass_db,
        database: db,
        port: 5432,
    }
)



module.exports = pool;

