const pool = require('./db/connection');

async function migrate() {
    try {
        console.log('Adding image_url to donations...');
        await pool.query('ALTER TABLE donations ADD COLUMN image_url VARCHAR(255) NULL');
        console.log('Added image_url column.');
    } catch (e) {
        console.log('image_url column might already exist or error:', e.message);
    }
    process.exit(0);
}

migrate();
