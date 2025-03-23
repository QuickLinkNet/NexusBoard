<?php
require_once __DIR__ . '/../models/FileManager.php';

function handleFileRoutes($endpoint) {
    if (strpos($endpoint, 'files') !== 0) {
        return false;
    }

    $fileModel = new FileManager();

    // Upload files
    if ($endpoint === 'files/upload' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!isset($_FILES['files'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Keine Dateien gefunden']);
            return true;
        }

        try {
            $uploadedFiles = [];
            foreach ($_FILES['files']['tmp_name'] as $key => $tmp_name) {
                $file = [
                    'name' => $_FILES['files']['name'][$key],
                    'type' => $_FILES['files']['type'][$key],
                    'tmp_name' => $tmp_name,
                    'error' => $_FILES['files']['error'][$key],
                    'size' => $_FILES['files']['size'][$key]
                ];

                if ($file['size'] > 10485760) { // 10MB
                    throw new Exception('Datei zu groß: ' . $file['name']);
                }

                $fileInfo = $fileModel->saveFile($file);
                $uploadedFiles[] = $fileInfo;
            }

            echo json_encode([
                'success' => true,
                'data' => ['files' => $uploadedFiles]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
        return true;
    }

    // List files
    if ($endpoint === 'files' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        try {
            $files = $fileModel->getFiles();
            echo json_encode([
                'success' => true,
                'data' => ['files' => $files]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
        return true;
    }

    // Get file content for preview
    if (preg_match('/^files\/(\d+)\/content$/', $endpoint, $matches)) {
        $fileId = $matches[1];
        try {
            $fileContent = $fileModel->getFileContent($fileId);
            echo json_encode([
                'success' => true,
                'data' => $fileContent
            ]);
        } catch (Exception $e) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
        return true;
    }

    // Download file
    if (preg_match('/^files\/(\d+)\/download$/', $endpoint, $matches)) {
        $fileId = $matches[1];
        try {
            $fileModel->downloadFile($fileId);
        } catch (Exception $e) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
        return true;
    }

    // Delete file
    if (preg_match('/^files\/(\d+)$/', $endpoint, $matches) && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $fileId = $matches[1];
        try {
            $success = $fileModel->deleteFile($fileId);
            if ($success) {
                echo json_encode(['success' => true]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Datei nicht gefunden'
                ]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
        return true;
    }

    return false;
}