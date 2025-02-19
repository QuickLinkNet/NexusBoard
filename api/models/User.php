<?php
require_once __DIR__ . '/../config/Database.php';

class User {
  private $conn;

  public function __construct() {
    $this->conn = Database::getInstance()->getConnection();
  }

  public function authenticate($username, $password) {
    $stmt = $this->conn->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
      unset($user['password']);
      return $user;
    }
    return false;
  }

  public function findByUsername($username) {
    $stmt = $this->conn->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    if ($user) {
      unset($user['password']);
    }
    return $user;
  }

  public function findById($id) {
    $stmt = $this->conn->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch();
    if ($user) {
      unset($user['password']);
    }
    return $user;
  }
}
