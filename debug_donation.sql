SELECT id, ngo_id, status, created_at FROM donations ORDER BY id DESC LIMIT 1;
SELECT id, user_id, name, city FROM ngos WHERE name LIKE '%karla%';
SELECT id, name, email FROM users WHERE id IN (SELECT user_id FROM ngos WHERE name LIKE '%karla%');
