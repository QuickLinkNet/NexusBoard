<?php
function handleHealthRoute($endpoint) {
    if ($endpoint === 'health') {
        try {
            // Prüfe die Datenbankverbindung nur, wenn sie bereits existiert
            $db = Database::getInstance();
            if ($db->getConnection()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'API is running',
                    'database' => 'connected'
                ]);
            } else {
                echo json_encode([
                    'success' => true,
                    'message' => 'API is running',
                    'database' => 'not connected'
                ]);
            }
        } catch (Exception $e) {
            // Bei Datenbankfehlern trotzdem 200 OK zurückgeben
            echo json_encode([
                'success' => true,
                'message' => 'API is running',
                'database' => 'error: ' . $e->getMessage()
            ]);
        }
        exit;
    }
    return false;
}