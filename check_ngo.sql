SELECT n.id, n.user_id, n.name, n.approved, u.email FROM ngos n LEFT JOIN users u ON n.user_id = u.id WHERE n.name LIKE '%karla%';
SELECT id, ngo_id, ngo_name, status FROM donations ORDER BY id DESC LIMIT 5;
