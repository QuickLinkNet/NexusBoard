<?php
return [
    'database' => [
        'host' => 'localhost',
        'dbname' => 'your_database',
        'username' => 'your_username',
        'password' => 'your_password',
        'charset' => 'utf8mb4'
    ],
    'jwt' => [
        'secret' => 'your-secret-key-here',
        'expiration' => 86400 // 24 Stunden
    ]
];