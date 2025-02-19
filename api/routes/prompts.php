<?php
function handlePromptRoutes($endpoint) {
  // Nur authentifizierte Benutzer dürfen diese Routen verwenden
  $user = requireAuth();
  $promptModel = new Prompt();

  if ($endpoint === 'prompts') {
    switch ($_SERVER['REQUEST_METHOD']) {
      case 'GET':
        $prompts = $promptModel->getAll();
        echo json_encode(['success' => true, 'data' => ['prompts' => $prompts]]);
        break;

      case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $prompt = $promptModel->create($data);
        echo json_encode(['success' => true, 'data' => $prompt]);
        break;

      default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Methode nicht erlaubt']);
    }
    exit;
  }

  if (strpos($endpoint, 'prompts/') === 0) {
    $id = substr($endpoint, 8);

    switch ($_SERVER['REQUEST_METHOD']) {
      case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $prompt = $promptModel->update($id, $data);
        if ($prompt) {
          echo json_encode(['success' => true, 'data' => $prompt]);
        } else {
          http_response_code(404);
          echo json_encode(['success' => false, 'message' => 'Prompt nicht gefunden']);
        }
        break;

      case 'DELETE':
        if ($promptModel->delete($id)) {
          echo json_encode(['success' => true]);
        } else {
          http_response_code(404);
          echo json_encode(['success' => false, 'message' => 'Prompt nicht gefunden']);
        }
        break;

      default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Methode nicht erlaubt']);
    }
    exit;
  }

  return false;
}
