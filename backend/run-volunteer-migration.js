require('dotenv').config();
const db = require('./db/connection');

async function run() {
    try {
        console.log("Altering volunteers table again...");
        await db.execute(`
            ALTER TABLE volunteers 
            MODIFY phone VARCHAR(20) NULL,
            MODIFY city VARCHAR(100) NULL;
        `);
        console.log("volunteers table altered.");

        console.log("All done!");
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        process.exit();
    }
}

run();
