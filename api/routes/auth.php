<?php
function handleAuthRoutes($endpoint) {
  if ($_SERVER['REQUEST_METHOD'] === 'POST' && $endpoint === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['username']) || !isset($data['password'])) {
      http_response_code(400);
      echo json_encode(['success' => false, 'message' => 'Username und Passwort erforderlich']);
      return true;
    }

    $userModel = new User();
    $user = $userModel->authenticate($data['username'], $data['password']);

    if ($user) {
      $token = JWT::generate(['user_id' => $user['id'], 'username' => $user['username']]);
      echo json_encode([
        'success' => true,
        'data' => [
          'user' => $user,
          'token' => $token
        ]
      ]);
    } else {
      http_response_code(401);
      echo json_encode(['success' => false, 'message' => 'Ungültige Anmeldedaten']);
    }
    return true;
  }

  if ($endpoint === 'me') {
    $payload = requireAuth(); // Use the existing middleware function

    $userModel = new User();
    $user = $userModel->findById($payload['user_id']);

    if (!$user) {
      http_response_code(401);
      echo json_encode(['success' => false, 'message' => 'Benutzer nicht gefunden']);
      return true;
    }

    echo json_encode(['success' => true, 'data' => ['user' => $user]]);
    return true;
  }

  return false;
}
