<?php
declare(strict_types=1);
session_start();
if (!empty($_SESSION["user_id"])) {
    header("Location: index.php");
    exit();
}
$error = "";
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $cfgFile = __DIR__ . "/backend/config.php";
    if (!is_file($cfgFile)) {
        $error = "Konfigurasi belum siap. Ikuti petunjuk setup pada README.";
    } else {
        $cfg = require $cfgFile;
        try {
            $pdo = new PDO(
                "mysql:host={$cfg["db_host"]};dbname={$cfg["db_name"]};charset=utf8mb4",
                $cfg["db_user"],
                $cfg["db_pass"],
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION],
            );
            $q = $pdo->prepare(
                "SELECT id,name,password_hash FROM users WHERE email=?",
            );
            $q->execute([trim((string) ($_POST["email"] ?? ""))]);
            $u = $q->fetch(PDO::FETCH_ASSOC);
            if (
                $u &&
                password_verify(
                    (string) ($_POST["password"] ?? ""),
                    $u["password_hash"],
                )
            ) {
                session_regenerate_id(true);
                $_SESSION["user_id"] = (int) $u["id"];
                $_SESSION["user_name"] = $u["name"];
                header("Location: index.php");
                exit();
            }
            $error = "Email atau password tidak cocok.";
        } catch (Throwable $e) {
            $error = "Database belum dapat dihubungi.";
        }
    }
}
?>
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Masuk · MAK IG SmartCost</title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body style="min-height:100vh;display:grid;place-items:center;padding:20px">
    <form method="post" class="card" style="width:min(410px,100%);padding:32px">
        <div class="brand" style="border:0;padding:0 0 22px;color:var(--brown)">
            <div class="brand-mark" style="color:var(--brown)">MI</div>
            <div><strong>MAK IGA</strong><span>SMARTCOST</span></div>
        </div>
        <div class="eyebrow">BUSINESS MANAGEMENT</div>
        <h1 style="font:600 27px 'Playfair Display';color:var(--brown);margin:0">Selamat datang</h1>
        <p style="font-size:12px;color:var(--muted);margin:8px 0 22px">Masuk untuk mengelola usaha Anda.</p>
        <?php if ($error): ?>
            <div class="demo-note" style="color:#9b514b;border-color:#efd9d7;background:#fbefee">
                <?= htmlspecialchars($error, ENT_QUOTES, "UTF-8") ?>
            </div>
        <?php endif; ?>
        <div class="field" style="margin-bottom:13px">
            <label for="login-email">Email</label>
            <input id="login-email" type="email" name="email" autocomplete="username" required>
        </div>
        <div class="field">
            <label for="login-password">Password</label>
            <div class="password-input">
                <input id="login-password" type="password" name="password" autocomplete="current-password" required>
                <button class="password-toggle" type="button" aria-label="Tampilkan kata sandi" aria-pressed="false">Tampilkan</button>
            </div>
        </div>
        <button class="primary" style="width:100%;margin-top:19px">Masuk</button>
    </form>
    <script>
        const passwordInput = document.getElementById("login-password");
        const passwordToggle = document.querySelector(".password-toggle");

        passwordToggle.addEventListener("click", () => {
            const shouldShow = passwordInput.type === "password";
            passwordInput.type = shouldShow ? "text" : "password";
            passwordToggle.textContent = shouldShow ? "Sembunyikan" : "Tampilkan";
            passwordToggle.setAttribute(
                "aria-label",
                shouldShow ? "Sembunyikan kata sandi" : "Tampilkan kata sandi",
            );
            passwordToggle.setAttribute("aria-pressed", String(shouldShow));
        });
    </script>
</body>
</html>
