const pool = require('./db/connection');
require('dotenv').config({ path: '.env' });

const ngos = [
  // Vijayawada
  { name: 'Akshaya Patra Foundation - Vijayawada', city: 'Vijayawada', address: 'Plot No 66, Auto Nagar, Vijayawada, Andhra Pradesh 520007', latitude: 16.5115, longitude: 80.6317, capacity: 500, accepted_types: 'cooked,produce,packaged,bakery', phone: '08662570011' },
  { name: 'Sri Sathya Sai Seva Organisation - Vijayawada', city: 'Vijayawada', address: 'MG Road, Vijayawada, Andhra Pradesh 520010', latitude: 16.5062, longitude: 80.6480, capacity: 300, accepted_types: 'cooked,packaged', phone: '08662459922' },
  { name: 'HelpAge India - Vijayawada', city: 'Vijayawada', address: '40-1-48, Rao & Ratnam Road, Moghalrajpuram, Vijayawada 520010', latitude: 16.5200, longitude: 80.6350, capacity: 200, accepted_types: 'cooked,produce,packaged', phone: '08662440033' },
  { name: 'Feeding India - Vijayawada', city: 'Vijayawada', address: 'Bandar Road, Patamata, Vijayawada, Andhra Pradesh 520010', latitude: 16.5050, longitude: 80.6600, capacity: 400, accepted_types: 'cooked,packaged,bakery', phone: '08662331144' },

  // Guntur
  { name: 'Annapurna Food Trust - Guntur', city: 'Guntur', address: '6-14-79, Arundalpet, Guntur, Andhra Pradesh 522002', latitude: 16.3067, longitude: 80.4365, capacity: 300, accepted_types: 'cooked,produce,packaged', phone: '08632230011' },
  { name: 'Rishi Valley Welfare Trust - Guntur', city: 'Guntur', address: 'Brodipet, Guntur, Andhra Pradesh 522002', latitude: 16.2989, longitude: 80.4355, capacity: 150, accepted_types: 'cooked,packaged', phone: '08632220022' },
  { name: 'Christian Charitable Trust - Guntur', city: 'Guntur', address: 'Old Town, Guntur, Andhra Pradesh 522001', latitude: 16.3020, longitude: 80.4540, capacity: 200, accepted_types: 'cooked,produce,packaged,bakery', phone: '08632210033' },

  // Visakhapatnam
  { name: 'Akshaya Patra Foundation - Visakhapatnam', city: 'Visakhapatnam', address: '47-14-5, Dwaraka Nagar, Visakhapatnam, Andhra Pradesh 530016', latitude: 17.7320, longitude: 83.3218, capacity: 600, accepted_types: 'cooked,produce,packaged,bakery', phone: '08912766011' },
  { name: 'Care & Share Charitable Trust - Vizag', city: 'Visakhapatnam', address: 'Seethammadhara, Visakhapatnam, Andhra Pradesh 530013', latitude: 17.7290, longitude: 83.3340, capacity: 250, accepted_types: 'cooked,packaged', phone: '08912540022' },
  { name: 'Smile Foundation - Vizag', city: 'Visakhapatnam', address: 'MVP Colony, Visakhapatnam, Andhra Pradesh 530017', latitude: 17.7440, longitude: 83.3320, capacity: 200, accepted_types: 'cooked,produce,packaged', phone: '08912510033' },
  { name: 'Goonj Collection Centre Visakhapatnam', city: 'Visakhapatnam', address: 'Madhurawada, Visakhapatnam, Andhra Pradesh 530048', latitude: 17.7810, longitude: 83.3740, capacity: 180, accepted_types: 'packaged,produce', phone: '08912581044' },

  // Tirupati
  { name: 'TTD Food Distribution Centre', city: 'Tirupati', address: 'Tirumala Hills, Tirupati, Andhra Pradesh 517504', latitude: 13.6831, longitude: 79.3474, capacity: 1000, accepted_types: 'cooked,packaged', phone: '08772260011' },
  { name: 'Sri Venkateswara Seva Trust', city: 'Tirupati', address: 'Balaji Nagar, Tirupati, Andhra Pradesh 517501', latitude: 13.6288, longitude: 79.4192, capacity: 300, accepted_types: 'cooked,produce,packaged', phone: '08772235022' },
  { name: 'ISKCON Food Relief Tirupati', city: 'Tirupati', address: 'Leela Mahal Road, Tirupati, Andhra Pradesh 517501', latitude: 13.6297, longitude: 79.4185, capacity: 250, accepted_types: 'cooked,packaged,bakery', phone: '08772272033' },

  // Nellore
  { name: 'Nellore Social Welfare Trust', city: 'Nellore', address: 'Grand Trunk Road, Nellore, Andhra Pradesh 524001', latitude: 14.4426, longitude: 79.9865, capacity: 200, accepted_types: 'cooked,produce,packaged', phone: '08612321011' },
  { name: 'Annadanam Foundation - Nellore', city: 'Nellore', address: 'Vedayapalem, Nellore, Andhra Pradesh 524004', latitude: 14.4630, longitude: 79.9930, capacity: 150, accepted_types: 'cooked,packaged', phone: '08612356022' },

  // Kurnool
  { name: 'Rayalaseema Welfare Society - Kurnool', city: 'Kurnool', address: 'Bund Road, Kurnool, Andhra Pradesh 518001', latitude: 15.8281, longitude: 78.0373, capacity: 180, accepted_types: 'cooked,produce,packaged', phone: '08512224011' },
  { name: 'Sri Sai Charitable Trust - Kurnool', city: 'Kurnool', address: 'Bellary Road, Kurnool, Andhra Pradesh 518002', latitude: 15.8220, longitude: 78.0480, capacity: 120, accepted_types: 'cooked,packaged,bakery', phone: '08512257022' },

  // Kakinada
  { name: 'Godavari Food Bank - Kakinada', city: 'Kakinada', address: 'Main Road, Kakinada, Andhra Pradesh 533001', latitude: 16.9891, longitude: 82.2475, capacity: 250, accepted_types: 'cooked,produce,packaged', phone: '08842325011' },
  { name: 'East Godavari Seva Samithi', city: 'Kakinada', address: 'Jagannaickpur, Kakinada, Andhra Pradesh 533005', latitude: 16.9750, longitude: 82.2380, capacity: 150, accepted_types: 'cooked,packaged', phone: '08842310022' },

  // Rajahmundry
  { name: 'Akshaya Patra - Rajahmundry', city: 'Rajahmundry', address: 'Morampudi Road, Rajahmundry, Andhra Pradesh 533101', latitude: 17.0074, longitude: 81.7792, capacity: 400, accepted_types: 'cooked,produce,packaged,bakery', phone: '08832445011' },
  { name: 'Godavari Charitable Foundation', city: 'Rajahmundry', address: 'Innispeta, Rajahmundry, Andhra Pradesh 533101', latitude: 16.9820, longitude: 81.7863, capacity: 180, accepted_types: 'cooked,packaged', phone: '08832410022' },

  // Eluru
  { name: 'West Godavari Annadanam Trust', city: 'Eluru', address: 'Old Bus Stand, Eluru, Andhra Pradesh 534001', latitude: 16.7120, longitude: 81.0960, capacity: 150, accepted_types: 'cooked,produce,packaged', phone: '08812224011' },
  { name: 'Samskruti Welfare Society - Eluru', city: 'Eluru', address: 'R R Road, Eluru, Andhra Pradesh 534002', latitude: 16.7080, longitude: 81.1010, capacity: 100, accepted_types: 'cooked,packaged', phone: '08812231022' },

  // Kadapa
  { name: 'YSR District Food Foundation', city: 'Kadapa', address: 'Jangareddigudem Road, Kadapa, Andhra Pradesh 516001', latitude: 14.4674, longitude: 78.8241, capacity: 150, accepted_types: 'cooked,produce,packaged', phone: '08562225011' },
  { name: 'Pushpa Seva Mandir - Kadapa', city: 'Kadapa', address: 'Chinna Chowk, Kadapa, Andhra Pradesh 516001', latitude: 14.4700, longitude: 78.8270, capacity: 100, accepted_types: 'cooked,packaged', phone: '08562245022' },

  // Anantapur
  { name: 'Tribal Welfare Society - Anantapur', city: 'Anantapur', address: 'Clock Tower Road, Anantapur, Andhra Pradesh 515001', latitude: 14.6819, longitude: 77.6006, capacity: 130, accepted_types: 'cooked,produce,packaged', phone: '08554250011' },
  { name: 'Rural Development Trust - Anantapur', city: 'Anantapur', address: 'Bathalapalli, Anantapur, Andhra Pradesh 515001', latitude: 14.6900, longitude: 77.6100, capacity: 200, accepted_types: 'cooked,produce,packaged,bakery', phone: '08554244022' },

  // Ongole
  { name: 'Prakasam District Welfare Trust', city: 'Ongole', address: 'Kurnool Road, Ongole, Andhra Pradesh 523001', latitude: 15.5057, longitude: 80.0499, capacity: 130, accepted_types: 'cooked,produce,packaged', phone: '08592233011' },

  // Gudivada
  { name: 'Sai Seva Mandir - Gudivada', city: 'Gudivada', address: 'Eluru Road, Gudivada, Andhra Pradesh 521301', latitude: 16.4350, longitude: 80.9940, capacity: 100, accepted_types: 'cooked,produce,packaged,bakery', phone: '08671234567' },
  { name: 'Sri Ram Charitable Trust - Gudivada', city: 'Gudivada', address: 'Bus Stand Area, Gudivada, Andhra Pradesh 521301', latitude: 16.4300, longitude: 80.9900, capacity: 80, accepted_types: 'cooked,packaged', phone: '08671298765' },
];

async function seed() {
  let inserted = 0;
  let skipped = 0;

  for (const ngo of ngos) {
    try {
      // Check if already exists to avoid duplicates
      const [existing] = await pool.query('SELECT id FROM ngos WHERE name = ?', [ngo.name]);
      if (existing.length > 0) {
        skipped++;
        continue;
      }
      await pool.query(
        `INSERT INTO ngos (user_id, name, city, address, latitude, longitude, capacity, accepted_types, phone, approved)
         VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [ngo.name, ngo.city, ngo.address, ngo.latitude, ngo.longitude, ngo.capacity, ngo.accepted_types, ngo.phone]
      );
      inserted++;
      console.log(`✅ Added: ${ngo.name}`);
    } catch (err) {
      console.error(`❌ Failed: ${ngo.name} - ${err.message}`);
    }
  }

  console.log(`\n🎉 Done! Inserted: ${inserted}, Skipped (already exist): ${skipped}`);
  process.exit(0);
}

seed();
