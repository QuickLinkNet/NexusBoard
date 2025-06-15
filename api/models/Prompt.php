<?php
require_once __DIR__ . '/../config/Database.php';

class Prompt {
    private $conn;

    public function __construct() {
        $this->conn = Database::getInstance()->getConnection();
    }

    public function getAll() {
        $stmt = $this->conn->query("SELECT * FROM prompts ORDER BY id DESC");
        return $stmt->fetchAll();
    }

    public function getPending($limit = null) {
        $sql = "SELECT * FROM prompts WHERE CAST(expected_runs AS SIGNED) > CAST(successful_runs AS SIGNED) ORDER BY id DESC";
        if ($limit !== null && $limit > 0) {
            $sql .= " LIMIT " . intval($limit);
        }
        
        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll();
    }

    public function create($data) {
        $stmt = $this->conn->prepare("
            INSERT INTO prompts (title, prompt, keywords, expected_runs, successful_runs)
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['title'],
            $data['prompt'],
            $data['keywords'],
            $data['expected_runs'] ?? 4,
            $data['successful_runs'] ?? 0
        ]);

        return $this->getById($this->conn->lastInsertId());
    }

    public function update($id, $data) {
        $updateFields = [];
        $params = [];

        foreach (['title', 'prompt', 'keywords', 'expected_runs', 'successful_runs'] as $field) {
            if (isset($data[$field])) {
                $updateFields[] = "$field = ?";
                $params[] = $data[$field];
            }
        }

        if (empty($updateFields)) {
            return false;
        }

        $params[] = $id;
        $sql = "UPDATE prompts SET " . implode(', ', $updateFields) . " WHERE id = ?";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);

        return $this->getById($id);
    }

    public function getById($id) {
        $stmt = $this->conn->prepare("SELECT * FROM prompts WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function delete($id) {
        $stmt = $this->conn->prepare("DELETE FROM prompts WHERE id = ?");
        return $stmt->execute([$id]);
    }
}