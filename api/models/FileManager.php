<?php
class FileManager {
    private $conn;
    private $uploadDir;
    private $previewableTypes = [
        'text/plain' => true,
        'text/csv' => true,
        'application/json' => true,
        'text/markdown' => true,
        'application/xml' => true,
        'text/html' => true,
        'text/css' => true,
        'application/javascript' => true,
        'application/x-httpd-php' => true
    ];

    public function __construct() {
        $this->conn = Database::getInstance()->getConnection();
        $this->uploadDir = __DIR__ . '/../storage/files/';

        if (!file_exists($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    public function saveFile($file) {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Upload fehlgeschlagen');
        }

        $fileInfo = pathinfo($file['name']);
        $safeFilename = $this->sanitizeFilename($fileInfo['filename']);
        $extension = strtolower($fileInfo['extension']);

        // Generiere eindeutigen Dateinamen
        $uniqueId = uniqid();
        $storedFilename = "{$safeFilename}_{$uniqueId}.{$extension}";
        $storagePath = $this->uploadDir . $storedFilename;

        if (!move_uploaded_file($file['tmp_name'], $storagePath)) {
            throw new Exception('Fehler beim Speichern der Datei');
        }

        $stmt = $this->conn->prepare("
            INSERT INTO files (
                original_name,
                stored_name,
                file_type,
                file_size
            ) VALUES (?, ?, ?, ?)
        ");

        $stmt->execute([
            $file['name'],
            $storedFilename,
            $file['type'],
            $file['size']
        ]);

        return [
            'id' => $this->conn->lastInsertId(),
            'name' => $file['name'],
            'type' => $file['type'],
            'size' => $file['size']
        ];
    }

    public function getFiles() {
        $stmt = $this->conn->prepare("
            SELECT
                id,
                original_name as name,
                file_type as type,
                file_size as size,
                uploaded_at
            FROM files
            ORDER BY uploaded_at DESC
        ");

        $stmt->execute();
        $files = $stmt->fetchAll();

        // Add preview capability flag
        foreach ($files as &$file) {
            $file['previewable'] = isset($this->previewableTypes[$file['type']]);
        }

        return $files;
    }

    public function getFile($fileId) {
        $stmt = $this->conn->prepare("
            SELECT *
            FROM files
            WHERE id = ?
        ");

        $stmt->execute([$fileId]);
        return $stmt->fetch();
    }

    public function getFileContent($fileId) {
        $file = $this->getFile($fileId);

        if (!$file) {
            throw new Exception('Datei nicht gefunden');
        }

        if (!isset($this->previewableTypes[$file['file_type']])) {
            throw new Exception('Dateityp wird nicht unterstützt');
        }

        $filePath = $this->uploadDir . $file['stored_name'];
        if (!file_exists($filePath)) {
            throw new Exception('Datei nicht gefunden');
        }

        $content = file_get_contents($filePath);
        if ($content === false) {
            throw new Exception('Fehler beim Lesen der Datei');
        }

        return [
            'content' => $content,
            'type' => $file['file_type'],
            'name' => $file['original_name']
        ];
    }

    public function downloadFile($fileId) {
        $file = $this->getFile($fileId);

        if (!$file) {
            throw new Exception('Datei nicht gefunden');
        }

        $filePath = $this->uploadDir . $file['stored_name'];
        if (!file_exists($filePath)) {
            throw new Exception('Datei nicht gefunden');
        }

        header('Content-Type: ' . $file['file_type']);
        header('Content-Disposition: attachment; filename="' . $file['original_name'] . '"');
        header('Content-Length: ' . filesize($filePath));
        header('Cache-Control: no-cache');

        readfile($filePath);
        exit;
    }

    public function deleteFile($fileId) {
        $stmt = $this->conn->prepare("
            SELECT stored_name
            FROM files
            WHERE id = ?
        ");

        $stmt->execute([$fileId]);
        $file = $stmt->fetch();

        if (!$file) {
            return false;
        }

        $filePath = $this->uploadDir . $file['stored_name'];
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        $stmt = $this->conn->prepare("
            DELETE FROM files
            WHERE id = ?
        ");

        $stmt->execute([$fileId]);
        return true;
    }

    private function sanitizeFilename($filename) {
        // Entferne unerwünschte Zeichen
        $filename = preg_replace('/[^a-zA-Z0-9-_.]/', '', $filename);
        // Begrenze die Länge
        return substr($filename, 0, 100);
    }
}