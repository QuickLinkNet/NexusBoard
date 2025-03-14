<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/models/User.php';
require_once __DIR__ . '/models/Prompt.php';
require_once __DIR__ . '/middleware/auth.php';
require_once __DIR__ . '/utils/JWT.php';
require_once __DIR__ . '/routes/health.php';
require_once __DIR__ . '/routes/auth.php';
require_once __DIR__ . '/routes/prompts.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', trim($uri, '/'));

// Finde den Index von 'api' und nehme alles danach
$apiIndex = array_search('api', $uri);
$endpoint = $apiIndex !== false ? implode('/', array_slice($uri, $apiIndex + 1)) : '';

error_log("Requested endpoint: " . $endpoint);

// Versuche die Route zu den verschiedenen Handlern weiterzuleiten
if (handleHealthRoute($endpoint)) {
    exit;
}

if (handleAuthRoutes($endpoint)) {
    exit;
}

if (handlePromptRoutes($endpoint)) {
    exit;
}

// Wenn keine Route gefunden wurde
http_response_code(404);
echo json_encode(['success' => false, 'message' => 'Endpoint nicht gefunden']);
exit;