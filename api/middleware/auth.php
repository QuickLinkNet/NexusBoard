<?php
require_once __DIR__ . '/../utils/JWT.php';

function requireAuth() {
    error_log("Auth Middleware - Starting authentication check");
    
    // Prüfe verschiedene Möglichkeiten, den Authorization-Header zu bekommen
    $authHeader = null;
    
    // 1. Standard-Header
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }
    // 2. Apache-spezifischer Header
    elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    // 3. Manuell gesetzter Header durch .htaccess
    elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
        }
    }

    if (!$authHeader) {
        error_log("Auth Middleware - No Authorization header found in any location");
        error_log("Available headers: " . print_r(getallheaders(), true));
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Keine Authentifizierung']);
        exit;
    }

    error_log("Auth Middleware - Authorization header found: " . $authHeader);

    $token = str_replace('Bearer ', '', $authHeader);
    error_log("Auth Middleware - Extracted token: " . substr($token, 0, 20) . '...');

    $payload = JWT::verify($token);

    if (!$payload) {
        error_log("Auth Middleware - Token verification failed");
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Ungültiger Token']);
        exit;
    }

    error_log("Auth Middleware - Token verified successfully for user_id: " . $payload['user_id']);
    return $payload;
}