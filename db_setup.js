async function dbSetup(pool) {
    console.log('DB setup start');

    const c = await pool.connect();
    await c.query('begin');
    try {
        await c.query(`drop table if exists "request"`);
        await c.query(`create table if not exists "request" (
            id serial primary key,
            url text not null,
            status text not null,
            http_code integer
        )`);
        const dbEntries = [
            ['https://proxify.io', 'NEW', null],
            ['https://reddit.com', 'NEW', null],
            ['https://httpstat.us/404', 'NEW', null],
            ['https://httpstat.us/200', 'NEW', null],
            ['https://httpstat.us/401', 'NEW', null],
            ['https://httpstat.us/201', 'NEW', null],
            ['https://httpstat.us/500', 'NEW', null],
            ['https://httpstat.us/200', 'NEW', null],
        ];
        await Promise.all(
            dbEntries.map((entry) => {
                return c.query(
                    'insert into "request" (url, status, http_code) values ($1, $2, $3)',
                    entry
                );
            })
        );
        await c.query('commit');
    } catch (error) {
        await c.query('rollback');
        throw error;
    } finally {
        await c.release();
        console.log('DB setup finish');
    }
}

module.exports = dbSetup;
