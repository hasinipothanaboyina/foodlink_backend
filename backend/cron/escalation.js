const pool = require('../db/connection');
// If you want to use the same findBestNGO logic, you should export it from donations.js
// Since it's inside routes, let's just make a simple function here or require it if exported.
// Wait, findBestNGO isn't exported from donations.js. We can copy it or just do the basic rejection logic here.
// Let's implement the escalation check.

const ESCALATION_INTERVAL = 60 * 1000; // run every minute
const TIMEOUT_MINUTES = 15; // 15 mins

async function runEscalationCheck() {
  try {
    // Find matched donations that are older than TIMEOUT_MINUTES
    const [staleDonations] = await pool.query(
      `SELECT * FROM donations 
       WHERE status = 'matched' 
       AND last_matched_at IS NOT NULL
       AND TIMESTAMPDIFF(MINUTE, last_matched_at, NOW()) >= ?`,
      [TIMEOUT_MINUTES]
    );

    if (staleDonations.length === 0) return;

    for (const donation of staleDonations) {
      console.log(`[Escalation] Donation #${donation.id} timed out. Re-matching...`);
      
      const ngoId = donation.ngo_id;
      const alreadyRejected = donation.rejected_by
        ? donation.rejected_by.split(',').map(Number).filter(Boolean)
        : [];
      if (!alreadyRejected.includes(ngoId)) alreadyRejected.push(ngoId);
      const rejectedStr = alreadyRejected.join(',');

      // For a quick fix, since findBestNGO is not exported easily, we can just do a fetch to the backend's own endpoint
      // Or we can just set it to pending and let the frontend/another process re-match. 
      // But we can also just execute the sql logic:
      
      const [ngos] = await pool.query('SELECT * FROM ngos WHERE approved = 1 AND availability_status != "offline"');
      let best = null;
      let bestScore = Infinity;

      for (const ngo of ngos) {
        if (alreadyRejected.includes(ngo.id) || !ngo.user_id) continue;
        
        // simple distance calc
        let distance = 0; // Simplified for background script, in real life you'd use getDistanceKm
        if (donation.latitude && ngo.latitude) {
            const R = 6371;
            const dLat = ((ngo.latitude - donation.latitude) * Math.PI) / 180;
            const dLon = ((ngo.longitude - donation.longitude) * Math.PI) / 180;
            const a = Math.sin(dLat / 2) ** 2 + Math.cos((donation.latitude * Math.PI) / 180) * Math.cos((ngo.latitude * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
            distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        }
        
        if (distance > 30) continue;
        
        const acceptancePenalty = (1.0 - (ngo.acceptance_rate || 1.0)) * 20;
        const responsePenalty = Math.min((ngo.avg_response_time || 0) / 60 * 0.5, 10);
        const score = distance + acceptancePenalty + responsePenalty;
        
        if (score < bestScore) {
          bestScore = score;
          best = { ngo, distance, score };
        }
      }

      if (best) {
        await pool.query(
          `UPDATE donations SET status = 'matched', ngo_id = ?, ngo_name = ?, distance_km = ?, rejected_by = ?, last_matched_at = NOW() WHERE id = ?`,
          [best.ngo.id, best.ngo.name, best.distance, rejectedStr, donation.id]
        );
        console.log(`[Escalation] Re-matched to ${best.ngo.name}`);
      } else {
        await pool.query(
          `UPDATE donations SET status = 'pending', ngo_id = NULL, ngo_name = NULL, rejected_by = ? WHERE id = ?`,
          [rejectedStr, donation.id]
        );
        console.log(`[Escalation] No NGOs found, marked as pending.`);
      }
    }
  } catch (err) {
    console.error('[Escalation Error]', err);
  }
}

// Start interval
setInterval(runEscalationCheck, ESCALATION_INTERVAL);
console.log('⏳ Escalation cron started...');
