const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' }); // Adjusted for running inside backend folder

async function fixDuplicates() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // 1. Find the REAL NGO for 'karla koteawara rao foundation' (the one with a user_id)
    const [realNgos] = await pool.query("SELECT id FROM ngos WHERE name LIKE '%karla%' AND user_id IS NOT NULL");
    
    if (realNgos.length > 0) {
      const realNgoId = realNgos[0].id;
      
      // 2. Find any DUMMY NGOs with a similar name
      const [dummyNgos] = await pool.query("SELECT id FROM ngos WHERE name LIKE '%karla%' AND user_id IS NULL");
      
      for (const dummy of dummyNgos) {
        // 3. Re-assign any donations from the dummy to the real NGO
        const [updateRes] = await pool.query("UPDATE donations SET ngo_id = ? WHERE ngo_id = ?", [realNgoId, dummy.id]);
        console.log(`Reassigned ${updateRes.affectedRows} donations from dummy NGO ${dummy.id} to real NGO ${realNgoId}`);
        
        // 4. Delete the dummy NGO
        await pool.query("DELETE FROM ngos WHERE id = ?", [dummy.id]);
        console.log(`Deleted dummy NGO ${dummy.id}`);
      }
    }

    // Also delete any other dummy NGOs globally so they don't intercept future donations
    const [delResult] = await pool.query("DELETE FROM ngos WHERE user_id IS NULL");
    if (delResult.affectedRows > 0) {
      console.log(`Deleted ${delResult.affectedRows} other dummy NGOs globally.`);
    }

    console.log("Cleanup complete!");

  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

fixDuplicates();
