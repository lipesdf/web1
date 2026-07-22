<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config/conexao.php';

function responder(array $dados, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

function entrada(): array
{
    $conteudo = file_get_contents('php://input');
    if ($conteudo !== false && trim($conteudo) !== '') {
        $json = json_decode($conteudo, true);
        if (is_array($json)) return $json;
    }
    return $_POST;
}

function cpfValido(string $cpf): bool
{
    $cpf = preg_replace('/\D/', '', $cpf);
    if (strlen($cpf) !== 11 || preg_match('/^(\d)\1{10}$/', $cpf)) return false;
    for ($digito = 9; $digito < 11; $digito++) {
        $soma = 0;
        for ($i = 0; $i < $digito; $i++) $soma += (int)$cpf[$i] * (($digito + 1) - $i);
        $calculado = ((10 * $soma) % 11) % 10;
        if ((int)$cpf[$digito] !== $calculado) return false;
    }
    return true;
}

$acao = $_GET['acao'] ?? $_POST['acao'] ?? '';
$dados = entrada();
$db = obterConexao();

try {
    switch ($acao) {
        case 'anuncio':
            $stmt = $db->prepare('SELECT a.*, an.Nome AS NomeAnunciante, an.Telefone AS TelefoneAnunciante FROM anuncio a JOIN anunciante an ON an.IdAnunciante = a.IdAnunciante WHERE a.IdAnuncio = ?'); $stmt->execute([(int)($_GET['id'] ?? 0)]); $anuncio = $stmt->fetch(); if (!$anuncio) responder(['sucesso' => false, 'mensagem' => 'Anúncio não encontrado.'], 404); $fotos = $db->prepare('SELECT NomeArquivo FROM foto WHERE IdAnuncio = ? ORDER BY IdFoto'); $fotos->execute([$anuncio['IdAnuncio']]); $anuncio['fotos'] = $fotos->fetchAll(PDO::FETCH_COLUMN); responder(['sucesso' => true, 'anuncio' => $anuncio]);
        case 'listar-anuncios':
            $sql = 'SELECT a.*, (SELECT f.NomeArquivo FROM foto f WHERE f.IdAnuncio = a.IdAnuncio ORDER BY f.IdFoto LIMIT 1) AS Foto FROM anuncio a WHERE 1=1';
            $parametros = [];
            foreach (['marca' => 'Marca', 'modelo' => 'Modelo', 'cidade' => 'Cidade'] as $chave => $coluna) { if (!empty($_GET[$chave])) { $sql .= " AND a.{$coluna} = ?"; $parametros[] = $_GET[$chave]; } }
            $sql .= ' ORDER BY a.DataHora DESC LIMIT 20';
            $stmt = $db->prepare($sql); $stmt->execute($parametros); responder(['sucesso' => true, 'anuncios' => $stmt->fetchAll()]);

        case 'meus-anuncios':
            if (!isset($_SESSION['usuario'])) responder(['sucesso' => false, 'mensagem' => 'Não autenticado.'], 401);
            $stmt = $db->prepare('SELECT a.* FROM anuncio a WHERE a.IdAnunciante = ? ORDER BY a.DataHora DESC');
            $stmt->execute([$_SESSION['usuario']['id']]);
            $anuncios = $stmt->fetchAll();
            $stmtFotos = $db->prepare('SELECT NomeArquivo FROM foto WHERE IdAnuncio = ? ORDER BY IdFoto');
            foreach ($anuncios as &$anuncio) { $stmtFotos->execute([$anuncio['IdAnuncio']]); $anuncio['Fotos'] = $stmtFotos->fetchAll(PDO::FETCH_COLUMN); $anuncio['Foto'] = $anuncio['Fotos'][0] ?? null; }
            unset($anuncio);
            responder(['sucesso' => true, 'anuncios' => $anuncios]);

        case 'excluir-anuncio':
            if (!isset($_SESSION['usuario'])) responder(['sucesso' => false, 'mensagem' => 'Não autenticado.'], 401);
            $idExcluir = (int)($dados['id'] ?? 0);
            $fotosExcluir = $db->prepare('SELECT f.NomeArquivo FROM foto f JOIN anuncio a ON a.IdAnuncio = f.IdAnuncio WHERE a.IdAnuncio = ? AND a.IdAnunciante = ?');
            $fotosExcluir->execute([$idExcluir, $_SESSION['usuario']['id']]);
            $arquivosExcluir = $fotosExcluir->fetchAll(PDO::FETCH_COLUMN);
            $stmt = $db->prepare('DELETE FROM anuncio WHERE IdAnuncio = ? AND IdAnunciante = ?');
            $stmt->execute([$idExcluir, $_SESSION['usuario']['id']]);
            if ($stmt->rowCount() > 0) foreach ($arquivosExcluir as $arquivo) { if (!str_starts_with($arquivo, 'http')) { $caminho = __DIR__ . '/uploads/' . basename($arquivo); if (is_file($caminho)) unlink($caminho); } }
            responder(['sucesso' => true, 'removido' => $stmt->rowCount() > 0]);

        case 'cadastrar-interesse':
            $stmt = $db->prepare('INSERT INTO interesse (IdAnuncio, Nome, Telefone, Mensagem) VALUES (?, ?, ?, ?)'); $stmt->execute([(int)($dados['idAnuncio'] ?? 0), trim((string)($dados['nome'] ?? '')), trim((string)($dados['telefone'] ?? '')), trim((string)($dados['mensagem'] ?? ''))]); responder(['sucesso' => true], 201);

        case 'listar-interesses':
            if (!isset($_SESSION['usuario'])) responder(['sucesso' => false, 'mensagem' => 'Não autenticado.'], 401);
            $stmt = $db->prepare('SELECT i.*, a.Marca, a.Modelo FROM interesse i JOIN anuncio a ON a.IdAnuncio = i.IdAnuncio WHERE a.IdAnunciante = ? ORDER BY i.DataHora DESC'); $stmt->execute([$_SESSION['usuario']['id']]); responder(['sucesso' => true, 'interesses' => $stmt->fetchAll()]);

        case 'notificacoes':
            if (!isset($_SESSION['usuario'])) responder(['sucesso' => false, 'mensagem' => 'Não autenticado.'], 401);
            $stmt = $db->prepare('SELECT a.IdAnuncio, a.Marca, a.Modelo, COUNT(*) AS Quantidade FROM interesse i JOIN anuncio a ON a.IdAnuncio = i.IdAnuncio WHERE a.IdAnunciante = ? AND i.Lido = 0 GROUP BY a.IdAnuncio, a.Marca, a.Modelo ORDER BY Quantidade DESC');
            $stmt->execute([$_SESSION['usuario']['id']]); $itens = $stmt->fetchAll();
            responder(['sucesso' => true, 'total' => array_sum(array_column($itens, 'Quantidade')), 'itens' => $itens]);

        case 'marcar-interesses-lidos':
            if (!isset($_SESSION['usuario'])) responder(['sucesso' => false, 'mensagem' => 'Não autenticado.'], 401);
            $stmt = $db->prepare('UPDATE interesse i JOIN anuncio a ON a.IdAnuncio = i.IdAnuncio SET i.Lido = 1 WHERE a.IdAnunciante = ?');
            $stmt->execute([$_SESSION['usuario']['id']]); responder(['sucesso' => true]);

        case 'excluir-interesse':
            if (!isset($_SESSION['usuario'])) responder(['sucesso' => false, 'mensagem' => 'Não autenticado.'], 401);
            $stmt = $db->prepare('DELETE i FROM interesse i JOIN anuncio a ON a.IdAnuncio = i.IdAnuncio WHERE i.IdInteresse = ? AND a.IdAnunciante = ?'); $stmt->execute([(int)($dados['id'] ?? 0), $_SESSION['usuario']['id']]); responder(['sucesso' => true]);

        case 'cadastrar-anuncio':
            if (!isset($_SESSION['usuario'])) responder(['sucesso' => false, 'mensagem' => 'É necessário estar logado.'], 401);
            $obrigatorios = ['marca', 'modelo', 'ano', 'cor', 'quilometragem', 'descricao', 'valor', 'estado', 'cidade'];
            foreach ($obrigatorios as $campo) if (!isset($_POST[$campo]) || trim((string)$_POST[$campo]) === '') responder(['sucesso' => false, 'mensagem' => "Campo obrigatório: {$campo}."], 422);
            if (!isset($_FILES['fotos']) || !is_array($_FILES['fotos']['name']) || count($_FILES['fotos']['name']) < 3) responder(['sucesso' => false, 'mensagem' => 'Envie pelo menos três fotos.'], 422);
            $db->beginTransaction();
            try {
                $stmt = $db->prepare('INSERT INTO anuncio (IdAnunciante, Marca, Modelo, AnoFabricacao, Cor, Quilometragem, Descricao, Valor, Estado, Cidade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                $stmt->execute([$_SESSION['usuario']['id'], trim($_POST['marca']), trim($_POST['modelo']), (int)$_POST['ano'], trim($_POST['cor']), (int)$_POST['quilometragem'], trim($_POST['descricao']), (float)$_POST['valor'], strtoupper(trim($_POST['estado'])), trim($_POST['cidade'])]);
                $idAnuncio = (int)$db->lastInsertId();
                $pasta = __DIR__ . '/uploads';
                if (!is_dir($pasta) && !mkdir($pasta, 0755, true)) throw new RuntimeException('Não foi possível criar a pasta de uploads.');
                $fotoStmt = $db->prepare('INSERT INTO foto (IdAnuncio, NomeArquivo) VALUES (?, ?)');
                $permitidos = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
                foreach ($_FILES['fotos']['tmp_name'] as $i => $temporario) {
                    if ($_FILES['fotos']['error'][$i] !== UPLOAD_ERR_OK) throw new RuntimeException('Falha no upload de uma foto.');
                    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($temporario);
                    if (!isset($permitidos[$mime])) throw new RuntimeException('Formato de imagem não permitido.');
                    $nome = bin2hex(random_bytes(16)) . '.' . $permitidos[$mime];
                    if (!move_uploaded_file($temporario, $pasta . '/' . $nome)) throw new RuntimeException('Não foi possível salvar uma foto.');
                    $fotoStmt->execute([$idAnuncio, $nome]);
                }
                $db->commit();
                responder(['sucesso' => true, 'id' => $idAnuncio], 201);
            } catch (Throwable $erro) { $db->rollBack(); responder(['sucesso' => false, 'mensagem' => $erro->getMessage()], 422); }

        case 'cadastro':
            $nome = trim((string)($dados['nome'] ?? ''));
            $cpf = preg_replace('/\D/', '', (string)($dados['cpf'] ?? ''));
            $email = strtolower(trim((string)($dados['email'] ?? '')));
            $senha = (string)($dados['senha'] ?? '');
            $telefone = trim((string)($dados['telefone'] ?? ''));
            if (strlen($nome) < 3) responder(['sucesso' => false, 'campo' => 'nome', 'mensagem' => 'Informe um nome com pelo menos 3 caracteres.'], 422);
            if (!cpfValido($cpf)) responder(['sucesso' => false, 'campo' => 'cpf', 'mensagem' => 'Informe um CPF válido.'], 422);
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) responder(['sucesso' => false, 'campo' => 'email', 'mensagem' => 'Informe um e-mail válido.'], 422);
            if (strlen($senha) < 6) responder(['sucesso' => false, 'campo' => 'senha', 'mensagem' => 'A senha deve possuir pelo menos 6 caracteres.'], 422);
            if (strlen(preg_replace('/\D/', '', $telefone)) < 10) responder(['sucesso' => false, 'campo' => 'telefone', 'mensagem' => 'Informe um telefone com DDD.'], 422);
            $duplicado = $db->prepare('SELECT CPF, Email FROM anunciante WHERE CPF = ? OR Email = ? LIMIT 1');
            $duplicado->execute([$cpf, $email]);
            if ($existente = $duplicado->fetch()) {
                if ($existente['CPF'] === $cpf) responder(['sucesso' => false, 'campo' => 'cpf', 'mensagem' => 'Este CPF já está cadastrado.'], 409);
                responder(['sucesso' => false, 'campo' => 'email', 'mensagem' => 'Este e-mail já está cadastrado.'], 409);
            }
            $stmt = $db->prepare('INSERT INTO anunciante (Nome, CPF, Email, SenhaHash, Telefone) VALUES (?, ?, ?, ?, ?)');
            $stmt->execute([$nome, $cpf, $email, password_hash($senha, PASSWORD_DEFAULT), $telefone]);
            responder(['sucesso' => true, 'mensagem' => 'Cadastro realizado.'], 201);

        case 'login':
            $email = strtolower(trim((string)($dados['email'] ?? '')));
            $stmt = $db->prepare('SELECT IdAnunciante, Nome, Email, SenhaHash FROM anunciante WHERE Email = ?');
            $stmt->execute([$email]);
            $usuario = $stmt->fetch();
            if (!$usuario || !password_verify((string)($dados['senha'] ?? ''), $usuario['SenhaHash'])) responder(['sucesso' => false, 'mensagem' => 'E-mail ou senha inválidos.'], 401);
            session_regenerate_id(true);
            $_SESSION['usuario'] = ['id' => (int)$usuario['IdAnunciante'], 'nome' => $usuario['Nome'], 'email' => $usuario['Email']];
            responder(['sucesso' => true, 'usuario' => $_SESSION['usuario']]);

        case 'logout':
            $_SESSION = [];
            session_destroy();
            responder(['sucesso' => true]);

        case 'sessao':
            responder(['autenticado' => isset($_SESSION['usuario']), 'usuario' => $_SESSION['usuario'] ?? null]);

        default:
            responder(['sucesso' => false, 'mensagem' => 'Ação não encontrada.'], 404);
    }
} catch (PDOException $erro) {
    if ((int)$erro->errorInfo[1] === 1062) responder(['sucesso' => false, 'mensagem' => 'CPF ou e-mail já cadastrado.'], 409);
    responder(['sucesso' => false, 'mensagem' => 'Erro interno no banco de dados.'], 500);
}
