const { Pool } = require('pg')

const pass_db = process.env.PASS_DB;
const user_db = process.env.USER_DB;
const db = process.env.DB;
const host = process.env.HOST;

// Debug: Log connection parameters (remove in production)
console.log('DB Connection params:', {
    host: host,
    user: user_db,
    database: db,
    port: 5432,
    password: pass_db ? '***masked***' : 'undefined'
});

const pool = new Pool(
    {
        host: host,
        user: user_db,
        password: pass_db,
        database: db,
        port: 5432,
        ssl: false
    }
)



module.exports = pool;

