const { exec } = require('child_process');
const { pool } = require('./pool');
const dbSetup = require('./db_setup');

async function main() {
    await dbSetup(pool);

    const worker1 = exec('node worker');
    const worker2 = exec('node worker');
    const worker3 = exec('node worker');

    worker1.stdout.on('data', console.log);
    worker2.stdout.on('data', console.log);
    worker3.stdout.on('data', console.log);
    worker1.stderr.on('data', console.error);
    worker2.stderr.on('data', console.error);
    worker3.stderr.on('data', console.error);
    worker1.on('close', () => console.log('worker is done'));
    worker2.on('close', () => console.log('worker is done'));
    worker3.on('close', () => console.log('worker is done'));

    // Simulate new entries on the db
    await waitSeconds(2);
    await pool.query(`insert into "request" (url, status, http_code)
        values ('https://httpstat.us/200', 'NEW', null)
    `);
    await pool.query(`insert into "request" (url, status, http_code)
        values ('https://httpstat.us/200', 'NEW', null)
    `);

    // Arbitrary wait to let the workers finish
    await waitSeconds(30);

    worker1.kill();
    worker2.kill();
    worker3.kill();

    // Print how the DB is at the end
    const { rows } = await pool.query(`select * from "request"`);
    rows.forEach(({ id, url, status, http_code }) => {
        console.log([id, url, status, http_code].join(' - '));
    });
}

function waitSeconds(seconds) {
    return new Promise((r) => {
        setTimeout(r, seconds * 1000);
    });
}

console.log('Process start.');
main()
    .catch(console.error)
    .finally(() => console.log('Process finish.'));
