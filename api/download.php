<?php
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/models/FileManager.php';

if (!isset($_GET['token'])) {
    http_response_code(400);
    exit('Token fehlt');
}

$token = $_GET['token'];
$db = Database::getInstance()->getConnection();

// Prüfe Token und hole Dateiinformationen
$stmt = $db->prepare("
    SELECT f.*
    FROM files f
    JOIN download_tokens dt ON f.id = dt.file_id
    WHERE dt.token = ? AND dt.expires_at > NOW()
    AND dt.used = 0
");

$stmt->execute([$token]);
$file = $stmt->fetch();

if (!$file) {
    http_response_code(404);
    exit('Ungültiger oder abgelaufener Download-Link');
}

$filePath = __DIR__ . '/storage/files/' . $file['stored_name'];

if (!file_exists($filePath)) {
    http_response_code(404);
    exit('Datei nicht gefunden');
}

// Markiere Token als verwendet
$stmt = $db->prepare("
    UPDATE download_tokens
    SET used = 1
    WHERE token = ?
");
$stmt->execute([$token]);

// Sende Datei
header('Content-Type: ' . $file['file_type']);
header('Content-Disposition: attachment; filename="' . $file['original_name'] . '"');
header('Content-Length: ' . filesize($filePath));
header('Cache-Control: no-cache');

readfile($filePath);
exit;