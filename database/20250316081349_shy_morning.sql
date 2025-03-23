-- Erstelle die Datenbank, falls sie nicht existiert
CREATE
DATABASE IF NOT EXISTS h205172_nexusboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE
h205172_nexusboard;

-- Benutzer Tabelle
CREATE TABLE IF NOT EXISTS users
(
    id
    INT
    AUTO_INCREMENT
    PRIMARY
    KEY,
    username
    VARCHAR
(
    255
) NOT NULL UNIQUE,
    email VARCHAR
(
    255
) NOT NULL UNIQUE,
    password VARCHAR
(
    255
) NOT NULL,
    role VARCHAR
(
    50
) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Prompts Tabelle
CREATE TABLE IF NOT EXISTS prompts
(
    id
    INT
    AUTO_INCREMENT
    PRIMARY
    KEY,
    title
    VARCHAR
(
    255
) NOT NULL,
    prompt TEXT NOT NULL,
    keywords TEXT,
    expected_runs INT DEFAULT 0,
    successful_runs INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dateien Tabelle
CREATE TABLE IF NOT EXISTS files
(
    id
    INT
    AUTO_INCREMENT
    PRIMARY
    KEY,
    original_name
    VARCHAR
(
    255
) NOT NULL,
    stored_name VARCHAR
(
    255
) NOT NULL UNIQUE,
    file_type VARCHAR
(
    100
),
    file_size INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indizes für schnellere Abfragen
CREATE INDEX idx_prompt_title ON prompts (title);

-- Erstelle einen Testbenutzer (Passwort: admin123)
INSERT INTO users (username, email, password, role)
VALUES ('admin', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'admin') ON DUPLICATE KEY
UPDATE id=id;