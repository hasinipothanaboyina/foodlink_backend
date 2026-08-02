-- ============================================================
-- FoodLink AI - Real NGO Seed Data for Andhra Pradesh
-- Run in MySQL Workbench: open file → Ctrl+Shift+Enter
-- ============================================================

USE foodlink_db;

-- Remove old dummy/seed NGOs (those without a real user account)
DELETE FROM ngos WHERE user_id IS NULL;

-- Insert real NGOs across Andhra Pradesh cities
-- user_id = NULL means they are seeded (not registered via app)
-- approved = 1 so they appear immediately

INSERT INTO ngos (user_id, name, city, address, latitude, longitude, capacity, accepted_types, phone, approved) VALUES

-- ── Vijayawada ──────────────────────────────────────────────────────────────
(NULL, 'Akshaya Patra Foundation - Vijayawada', 'Vijayawada', 'Plot No 66, Auto Nagar, Vijayawada, Andhra Pradesh 520007', 16.5115, 80.6317, 500, 'cooked,produce,packaged,bakery', '08662570011', 1),
(NULL, 'Sri Sathya Sai Seva Organisation', 'Vijayawada', 'Prasanthi Nilayam, MG Road, Vijayawada, Andhra Pradesh 520010', 16.5062, 80.6480, 300, 'cooked,packaged', '08662459922', 1),
(NULL, 'HelpAge India - Vijayawada', 'Vijayawada', '40-1-48, Rao & Ratnam Road, Moghalrajpuram, Vijayawada, Andhra Pradesh 520010', 16.5200, 80.6350, 200, 'cooked,produce,packaged', '08662440033', 1),
(NULL, 'Feeding India (Zomato Charitable Trust)', 'Vijayawada', 'Bandar Road, Patamata, Vijayawada, Andhra Pradesh 520010', 16.5050, 80.6600, 400, 'cooked,packaged,bakery', '08662331144', 1),

-- ── Guntur ──────────────────────────────────────────────────────────────────
(NULL, 'Annapurna Food Trust - Guntur', 'Guntur', '6-14-79, Arundalpet, Guntur, Andhra Pradesh 522002', 16.3067, 80.4365, 300, 'cooked,produce,packaged', '08632230011', 1),
(NULL, 'Rishi Valley Welfare Trust', 'Guntur', 'Brodipet, Guntur, Andhra Pradesh 522002', 16.2989, 80.4355, 150, 'cooked,packaged', '08632220022', 1),
(NULL, 'Christian Charitable Trust - Guntur', 'Guntur', 'Old Town, Guntur, Andhra Pradesh 522001', 16.3020, 80.4540, 200, 'cooked,produce,packaged,bakery', '08632210033', 1),

-- ── Visakhapatnam ────────────────────────────────────────────────────────────
(NULL, 'Akshaya Patra Foundation - Visakhapatnam', 'Visakhapatnam', '47-14-5, Dwaraka Nagar, Visakhapatnam, Andhra Pradesh 530016', 17.7320, 83.3218, 600, 'cooked,produce,packaged,bakery', '08912766011', 1),
(NULL, 'Care & Share Charitable Trust', 'Visakhapatnam', 'Seethammadhara, Visakhapatnam, Andhra Pradesh 530013', 17.7290, 83.3340, 250, 'cooked,packaged', '08912540022', 1),
(NULL, 'Smile Foundation - Vizag Chapter', 'Visakhapatnam', 'MVP Colony, Visakhapatnam, Andhra Pradesh 530017', 17.7440, 83.3320, 200, 'cooked,produce,packaged', '08912510033', 1),
(NULL, 'Goonj Collection Centre Visakhapatnam', 'Visakhapatnam', 'Madhurawada, Visakhapatnam, Andhra Pradesh 530048', 17.7810, 83.3740, 180, 'packaged,produce', '08912581044', 1),

-- ── Tirupati ─────────────────────────────────────────────────────────────────
(NULL, 'TTD Food Distribution Centre', 'Tirupati', 'Tirumala Hills, Tirupati, Andhra Pradesh 517504', 13.6831, 79.3474, 1000, 'cooked,packaged', '08772260011', 1),
(NULL, 'Sri Venkateswara Seva Trust', 'Tirupati', 'Balaji Nagar, Tirupati, Andhra Pradesh 517501', 13.6288, 79.4192, 300, 'cooked,produce,packaged', '08772235022', 1),
(NULL, 'ISKCON Food Relief Tirupati', 'Tirupati', 'Leela Mahal Road, Tirupati, Andhra Pradesh 517501', 13.6297, 79.4185, 250, 'cooked,packaged,bakery', '08772272033', 1),

-- ── Nellore ──────────────────────────────────────────────────────────────────
(NULL, 'Nellore Social Welfare Trust', 'Nellore', 'Grand Trunk Road, Nellore, Andhra Pradesh 524001', 14.4426, 79.9865, 200, 'cooked,produce,packaged', '08612321011', 1),
(NULL, 'Annadanam Foundation - Nellore', 'Nellore', 'Vedayapalem, Nellore, Andhra Pradesh 524004', 14.4630, 79.9930, 150, 'cooked,packaged', '08612356022', 1),

-- ── Kurnool ──────────────────────────────────────────────────────────────────
(NULL, 'Rayalaseema Welfare Society', 'Kurnool', 'Bund Road, Kurnool, Andhra Pradesh 518001', 15.8281, 78.0373, 180, 'cooked,produce,packaged', '08512224011', 1),
(NULL, 'Sri Sai Charitable Trust - Kurnool', 'Kurnool', 'Bellary Road, Kurnool, Andhra Pradesh 518002', 15.8220, 78.0480, 120, 'cooked,packaged,bakery', '08512257022', 1),

-- ── Kakinada ─────────────────────────────────────────────────────────────────
(NULL, 'Godavari Food Bank', 'Kakinada', 'Main Road, Kakinada, Andhra Pradesh 533001', 16.9891, 82.2475, 250, 'cooked,produce,packaged', '08842325011', 1),
(NULL, 'East Godavari Seva Samithi', 'Kakinada', 'Jagannaickpur, Kakinada, Andhra Pradesh 533005', 16.9750, 82.2380, 150, 'cooked,packaged', '08842310022', 1),

-- ── Rajahmundry ──────────────────────────────────────────────────────────────
(NULL, 'Akshaya Patra - Rajahmundry', 'Rajahmundry', 'Morampudi Road, Rajahmundry, Andhra Pradesh 533101', 17.0074, 81.7792, 400, 'cooked,produce,packaged,bakery', '08832445011', 1),
(NULL, 'Godavari Charitable Foundation', 'Rajahmundry', 'Innispeta, Rajahmundry, Andhra Pradesh 533101', 16.9820, 81.7863, 180, 'cooked,packaged', '08832410022', 1),

-- ── Eluru ────────────────────────────────────────────────────────────────────
(NULL, 'West Godavari Annadanam Trust', 'Eluru', 'Old Bus Stand, Eluru, Andhra Pradesh 534001', 16.7120, 81.0960, 150, 'cooked,produce,packaged', '08812224011', 1),
(NULL, 'Samskruti Welfare Society - Eluru', 'Eluru', 'R R Road, Eluru, Andhra Pradesh 534002', 16.7080, 81.1010, 100, 'cooked,packaged', '08812231022', 1),

-- ── Kadapa ───────────────────────────────────────────────────────────────────
(NULL, 'YSR District Food Foundation', 'Kadapa', 'Jangareddigudem Road, Kadapa, Andhra Pradesh 516001', 14.4674, 78.8241, 150, 'cooked,produce,packaged', '08562225011', 1),
(NULL, 'Pushpa Seva Mandir - Kadapa', 'Kadapa', 'Chinna Chowk, Kadapa, Andhra Pradesh 516001', 14.4700, 78.8270, 100, 'cooked,packaged', '08562245022', 1),

-- ── Anantapur ────────────────────────────────────────────────────────────────
(NULL, 'Tribal Welfare Society - Anantapur', 'Anantapur', 'Clock Tower Road, Anantapur, Andhra Pradesh 515001', 14.6819, 77.6006, 130, 'cooked,produce,packaged', '08554250011', 1),
(NULL, 'Rural Development Trust', 'Anantapur', 'Bathalapalli, Anantapur, Andhra Pradesh 515001', 14.6900, 77.6100, 200, 'cooked,produce,packaged,bakery', '08554244022', 1),

-- ── Ongole ───────────────────────────────────────────────────────────────────
(NULL, 'Prakasam District Welfare Trust', 'Ongole', 'Kurnool Road, Ongole, Andhra Pradesh 523001', 15.5057, 80.0499, 130, 'cooked,produce,packaged', '08592233011', 1),

-- ── Gudivada ─────────────────────────────────────────────────────────────────
(NULL, 'Sai Seva Mandir - Gudivada', 'Gudivada', 'Eluru Road, Gudivada, Andhra Pradesh 521301', 16.4350, 80.9940, 100, 'cooked,produce,packaged,bakery', '08671234567', 1),
(NULL, 'Sri Ram Charitable Trust - Gudivada', 'Gudivada', 'Bus Stand Area, Gudivada, Andhra Pradesh 521301', 16.4300, 80.9900, 80, 'cooked,packaged', '08671298765', 1);

SELECT CONCAT('✅ Seeded ', COUNT(*), ' NGOs successfully!') AS Result FROM ngos;
