<?php
function handlePromptRoutes($endpoint) {
    $promptModel = new Prompt();

    // Check for secret parameter first
    $data = json_decode(file_get_contents('php://input'), true);
    $secret = isset($_GET['secret']) ? $_GET['secret'] : (isset($data['secret']) ? $data['secret'] : null);
    
    $requireAuth = $secret !== 'brot';

    // Only require authentication if secret is not valid
    if ($requireAuth) {
        $user = requireAuth();
    }

    if ($endpoint === 'prompts') {
        switch ($_SERVER['REQUEST_METHOD']) {
            case 'GET':
                $prompts = $promptModel->getAll();
                echo json_encode(['success' => true, 'data' => ['prompts' => $prompts]]);
                break;

            case 'POST':
                if ($requireAuth) { // Only authenticated users can create prompts
                    $data = json_decode(file_get_contents('php://input'), true);
                    $prompt = $promptModel->create($data);
                    echo json_encode(['success' => true, 'data' => $prompt]);
                } else {
                    http_response_code(403);
                    echo json_encode(['success' => false, 'message' => 'Nur authentifizierte Benutzer können Prompts erstellen']);
                }
                break;

            default:
                http_response_code(405);
                echo json_encode(['success' => false, 'message' => 'Methode nicht erlaubt']);
        }
        exit;
    }

    if ($endpoint === 'prompts/pending') {
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $limit = isset($_GET['limit']) ? intval($_GET['limit']) : null;
            $prompts = $promptModel->getPending($limit);
            echo json_encode(['success' => true, 'data' => ['prompts' => $prompts]]);
            exit;
        }
        
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Methode nicht erlaubt']);
        exit;
    }

    // Neue Route für increment-success
    if (preg_match('/^prompts\/(\d+)\/increment-success$/', $endpoint, $matches)) {
        $promptId = $matches[1];

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            try {
                $prompt = $promptModel->getById($promptId);
                if (!$prompt) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Prompt nicht gefunden']);
                    exit;
                }

                $currentSuccessful = intval($prompt['successful_runs']);
                $updatedPrompt = $promptModel->update($promptId, [
                    'successful_runs' => (string)($currentSuccessful + 1)
                ]);

                if ($updatedPrompt) {
                    echo json_encode(['success' => true, 'data' => $updatedPrompt]);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => 'Fehler beim Aktualisieren des Prompts']);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Interner Serverfehler: ' . $e->getMessage()]);
            }
            exit;
        }

        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Methode nicht erlaubt']);
        exit;
    }

    if (strpos($endpoint, 'prompts/') === 0) {
        if (!$requireAuth) { // Only authenticated users can modify prompts
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Nur authentifizierte Benutzer können Prompts bearbeiten']);
            exit;
        }

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