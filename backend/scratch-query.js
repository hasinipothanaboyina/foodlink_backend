const pool = require('./db/connection');
async function run() {
    try {
        const [rows] = await pool.query("SELECT id, name, address, latitude, longitude FROM ngos WHERE name LIKE '%Abhaya%'");
        console.table(rows);
    } catch (e) { console.error(e); }
    process.exit(0);
}
run();
