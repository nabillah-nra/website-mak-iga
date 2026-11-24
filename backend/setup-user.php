<?php
// One-time CLI utility: php backend/setup-user.php email@example.com "Nama Pemilik"
if (PHP_SAPI !== "cli") {
    http_response_code(404);
    exit();
}
require __DIR__ . "/bootstrap.php";
$email = $argv[1] ?? "";
$name = $argv[2] ?? "Pemilik MAK IGA";
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "Usage: php setup-user.php email@example.com \"Nama\"\n");
    exit(1);
}
$password = bin2hex(random_bytes(8));
$q = $pdo->prepare("INSERT INTO users(name,email,password_hash) VALUES(?,?,?)");
$q->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);
echo "Email: {$email}\nPassword sementara: {$password}\nSimpan password ini dan ubah setelah login.\n";
