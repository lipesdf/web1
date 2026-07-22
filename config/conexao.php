<?php
declare(strict_types=1);

function obterConexao(): PDO
{
    static $conexao = null;
    if ($conexao instanceof PDO) {
        return $conexao;
    }

//  servidor local
    $host = getenv('DB_HOST') ?: 'db';
    $database = getenv('DB_NAME') ?: 'faculdade_db';
    $user = getenv('DB_USER') ?: 'aluno';
    $password = getenv('DB_PASSWORD') ?: 'senha123';
    $dsn = "mysql:host={$host};dbname={$database};charset=utf8mb4";

//    servidor remoto
//    $host = getenv('DB_HOST') ?: 'sql305.infinityfree.com';
//    $database = getenv('DB_NAME') ?: 'if0_42472585_faculdade_db';
//    $user = getenv('DB_USER') ?: 'if0_42472585';
//    $password = getenv('DB_PASSWORD') ?: 'projetoweb1';
//    $dsn = "mysql:host={$host};dbname={$database};charset=utf8mb4";

    $conexao = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $conexao;
}
