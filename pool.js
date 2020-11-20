const { Pool } = require('pg');

const pool = new Pool({
    host: 'database',
    port: 5432,
    database: 'proxify',
    user: 'proxify',
    password: '123',
    connectionTimeoutMillis: 1000 * 10, // 1 minutes
    idleTimeoutMillis: 1000 * 10, // 10 seconds
    max: 20,
});

module.exports = {
    pool,
    getClient: async function () {
        return await pool.connect();
    },
};
