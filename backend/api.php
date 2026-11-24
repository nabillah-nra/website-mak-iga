<?php
declare(strict_types=1);
session_start();
header("Content-Type: application/json; charset=utf-8");
header("X-Content-Type-Options: nosniff");

function respond(array $data, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}
if (empty($_SESSION["user_id"])) {
    respond(["error" => "Silakan masuk terlebih dahulu."], 401);
}
$cfgFile = __DIR__ . "/config.php";
if (!is_file($cfgFile)) {
    respond(
        [
            "error" =>
                "Konfigurasi belum dibuat. Salin backend/config.example.php menjadi backend/config.php.",
        ],
        503,
    );
}
$cfg = require $cfgFile;
try {
    $pdo = new PDO(
        "mysql:host={$cfg["db_host"]};dbname={$cfg["db_name"]};charset=utf8mb4",
        $cfg["db_user"],
        $cfg["db_pass"],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ],
    );
} catch (Throwable $e) {
    respond(
        [
            "error" =>
                "Database tidak dapat dihubungi. Periksa konfigurasi MySQL.",
        ],
        503,
    );
}
$method = $_SERVER["REQUEST_METHOD"];
$path = trim((string) ($_GET["resource"] ?? ""), "/");
$body = json_decode(file_get_contents("php://input"), true) ?? [];
function requiredString(array $data, string $key): string
{
    $v = trim((string) ($data[$key] ?? ""));
    if ($v === "") {
        respond(["error" => "Kolom {$key} wajib diisi."], 422);
    }
    return $v;
}
function nonNegative(array $data, string $key): float
{
    if (
        !isset($data[$key]) ||
        !is_numeric($data[$key]) ||
        (float) $data[$key] < 0
    ) {
        respond(["error" => "Nilai {$key} harus angka nol atau lebih."], 422);
    }
    return (float) $data[$key];
}
try {
    if ($path === "products") {
        if ($method === "GET") {
            respond(
                $pdo
                    ->query(
                        "SELECT id,name,category,description,photo_path AS photo,selling_price AS price,production_cost AS cost,status FROM products ORDER BY name",
                    )
                    ->fetchAll(),
            );
        }
        if ($method === "POST" || $method === "PUT") {
            $id = (int) ($body["id"] ?? 0);
            $v = [
                requiredString($body, "name"),
                requiredString($body, "category"),
                (string) ($body["description"] ?? ""),
                null,
                nonNegative($body, "price"),
                nonNegative($body, "cost"),
                in_array(
                    $body["status"] ?? "Aktif",
                    ["Aktif", "Nonaktif"],
                    true,
                )
                    ? $body["status"]
                    : "Aktif",
            ];
            $photoPath = (string) ($body["photo"] ?? "");
            if (
                $photoPath !== "" &&
                !preg_match(
                    "~^assets/uploads/[a-f0-9]{32}\\.(jpg|png|webp)$~",
                    $photoPath,
                )
            ) {
                respond(["error" => "Path foto produk tidak valid."], 422);
            }
            $v[3] = $photoPath !== "" ? $photoPath : null;
            if ($id) {
                $v[] = $id;
                $q = $pdo->prepare(
                    "UPDATE products SET name=?,category=?,description=?,photo_path=?,selling_price=?,production_cost=?,status=? WHERE id=?",
                );
                $q->execute($v);
            } else {
                $q = $pdo->prepare(
                    "INSERT INTO products(name,category,description,photo_path,selling_price,production_cost,status) VALUES(?,?,?,?,?,?,?)",
                );
                $q->execute($v);
                $id = (int) $pdo->lastInsertId();
            }
            respond(["id" => $id, "message" => "Produk disimpan."]);
        }
        if ($method === "DELETE") {
            $q = $pdo->prepare("DELETE FROM products WHERE id=?");
            $q->execute([(int) ($_GET["id"] ?? 0)]);
            respond(["message" => "Produk dihapus."]);
        }
    }
    if ($path === "materials") {
        if ($method === "GET") {
            respond(
                $pdo
                    ->query(
                        "SELECT id,name,purchase_quantity AS qty,unit,unit_price AS price,note FROM raw_materials ORDER BY name",
                    )
                    ->fetchAll(),
            );
        }
        if ($method === "POST" || $method === "PUT") {
            $id = (int) ($body["id"] ?? 0);
            $v = [
                requiredString($body, "name"),
                nonNegative($body, "qty"),
                requiredString($body, "unit"),
                nonNegative($body, "price"),
                (string) ($body["note"] ?? ""),
            ];
            $pdo->beginTransaction();
            if ($id) {
                $old = $pdo->prepare(
                    "SELECT unit_price FROM raw_materials WHERE id=? FOR UPDATE",
                );
                $old->execute([$id]);
                $oldPrice = $old->fetchColumn();
                $q = $pdo->prepare(
                    "UPDATE raw_materials SET name=?,purchase_quantity=?,unit=?,unit_price=?,note=? WHERE id=?",
                );
                $q->execute([...$v, $id]);
                if ($oldPrice !== false && (float) $oldPrice !== $v[3]) {
                    $h = $pdo->prepare(
                        "INSERT INTO material_price_history(material_id,old_price,new_price) VALUES(?,?,?)",
                    );
                    $h->execute([$id, $oldPrice, $v[3]]);
                }
            } else {
                $q = $pdo->prepare(
                    "INSERT INTO raw_materials(name,purchase_quantity,unit,unit_price,note) VALUES(?,?,?,?,?)",
                );
                $q->execute($v);
                $id = (int) $pdo->lastInsertId();
            }
            $pdo->commit();
            respond(["id" => $id, "message" => "Bahan baku disimpan."]);
        }
        if ($method === "DELETE") {
            $q = $pdo->prepare("DELETE FROM raw_materials WHERE id=?");
            $q->execute([(int) ($_GET["id"] ?? 0)]);
            respond(["message" => "Bahan baku dihapus."]);
        }
    }
    if ($path === "materials/history" && $method === "GET") {
        $materialId = (int) ($_GET["id"] ?? 0);
        $q = $pdo->prepare(
            "SELECT h.id,m.name,h.old_price AS oldPrice,h.new_price AS newPrice,h.changed_at AS changedAt FROM material_price_history h JOIN raw_materials m ON m.id=h.material_id WHERE h.material_id=? ORDER BY h.changed_at DESC",
        );
        $q->execute([$materialId]);
        respond($q->fetchAll());
    }
    if ($path === "sales" && $method === "GET") {
        $q = $pdo->query(
            "SELECT s.sale_date AS date,p.id AS productId,p.name AS product,d.quantity AS qty,d.unit_price AS price,d.unit_cost AS cost,(d.unit_price-d.unit_cost)*d.quantity AS profit FROM sales s JOIN sale_details d ON d.sale_id=s.id JOIN products p ON p.id=d.product_id ORDER BY s.sale_date DESC",
        );
        respond($q->fetchAll());
    }
    if ($path === "reports/material-usage" && $method === "GET") {
        $from = (string) ($_GET["from"] ?? "");
        $to = (string) ($_GET["to"] ?? "");
        $fromDate = $from !== "" ? $from : "1000-01-01";
        $toDate = $to !== "" ? $to : "9999-12-31";
        $q = $pdo->prepare(
            "SELECT m.id,m.name,m.unit,SUM(pc.quantity) AS used_quantity,SUM(pc.total_cost) AS total_cost FROM production_costs pc JOIN production_records pr ON pr.id=pc.production_record_id LEFT JOIN raw_materials m ON m.id=pc.material_id WHERE pr.produced_at BETWEEN ? AND ? GROUP BY m.id,m.name,m.unit ORDER BY total_cost DESC",
        );
        $q->execute([$fromDate, $toDate]);
        respond($q->fetchAll());
    }
    if ($path === "sales" && $method === "POST") {
        $date = requiredString($body, "date");
        $items = $body["items"] ?? [];
        if (!$items) {
            respond(
                ["error" => "Tambahkan setidaknya satu produk terjual."],
                422,
            );
        }
        $pdo->beginTransaction();
        $s = $pdo->prepare(
            "INSERT INTO sales(sale_date,reference_no,note) VALUES(?,?,?)",
        );
        $s->execute([
            $date,
            $body["reference_no"] ?? null,
            $body["note"] ?? null,
        ]);
        $saleId = (int) $pdo->lastInsertId();
        $p = $pdo->prepare(
            "SELECT selling_price,production_cost FROM products WHERE id=?",
        );
        $d = $pdo->prepare(
            "INSERT INTO sale_details(sale_id,product_id,quantity,unit_price,unit_cost) VALUES(?,?,?,?,?)",
        );
        foreach ($items as $item) {
            $p->execute([(int) ($item["product_id"] ?? 0)]);
            $product = $p->fetch();
            $qty = (float) ($item["quantity"] ?? 0);
            if (!$product || $qty <= 0) {
                $pdo->rollBack();
                respond(
                    ["error" => "Produk atau jumlah penjualan tidak valid."],
                    422,
                );
            }
            $d->execute([
                $saleId,
                (int) $item["product_id"],
                $qty,
                $product["selling_price"],
                $product["production_cost"],
            ]);
        }
        $pdo->commit();
        respond(["id" => $saleId, "message" => "Penjualan tersimpan."], 201);
    }
    if ($path === "dashboard" && $method === "GET") {
        $totals = $pdo
            ->query(
                "SELECT COALESCE(SUM(d.quantity*d.unit_price),0) revenue,COALESCE(SUM(d.quantity*d.unit_cost),0) cost,COALESCE(SUM(d.quantity*(d.unit_price-d.unit_cost)),0) profit FROM sale_details d",
            )
            ->fetch();
        $count = (int) $pdo
            ->query("SELECT COUNT(*) FROM products WHERE status='Aktif'")
            ->fetchColumn();
        $rank = $pdo
            ->query(
                "SELECT p.id,p.name,COALESCE(SUM(d.quantity),0) qty,COALESCE(SUM(d.quantity*(d.unit_price-d.unit_cost)),0) profit FROM products p LEFT JOIN sale_details d ON d.product_id=p.id GROUP BY p.id ORDER BY profit DESC",
            )
            ->fetchAll();
        respond([
            "totals" => $totals,
            "product_count" => $count,
            "ranking" => $rank,
        ]);
    }
    if ($path === "pricing" && $method === "GET") {
        $q = $pdo->query(
            "SELECT s.id,s.product_id AS productId,p.name,s.unit_cost AS unitCost,s.target_margin AS targetMargin,s.recommended_price AS recommendedPrice,s.manual_price AS manualPrice,s.created_at FROM price_simulations s JOIN products p ON p.id=s.product_id ORDER BY s.created_at DESC",
        );
        respond($q->fetchAll());
    }
    if ($path === "pricing" && $method === "POST") {
        $id = (int) ($body["product_id"] ?? 0);
        $cost = nonNegative($body, "unit_cost");
        $margin = nonNegative($body, "target_margin");
        $manual =
            isset($body["manual_price"]) && $body["manual_price"] !== ""
                ? nonNegative($body, "manual_price")
                : null;
        $q = $pdo->prepare("SELECT id FROM products WHERE id=?");
        $q->execute([$id]);
        if (!$q->fetch()) {
            respond(["error" => "Produk tidak ditemukan."], 422);
        }
        $recommended = $cost * (1 + $margin / 100);
        $q = $pdo->prepare(
            "INSERT INTO price_simulations(product_id,unit_cost,target_margin,recommended_price,manual_price) VALUES(?,?,?,?,?)",
        );
        $q->execute([$id, $cost, $margin, $recommended, $manual]);
        respond(
            [
                "id" => (int) $pdo->lastInsertId(),
                "unit_cost" => $cost,
                "recommended_price" => $recommended,
                "manual_price" => $manual,
            ],
            201,
        );
    }
    if ($path === "settings" && $method === "GET") {
        $q = $pdo->prepare(
            "SELECT u.id,u.name,u.email,u.role,b.business_name,b.tagline,b.address FROM users u CROSS JOIN business_settings b WHERE u.id=? AND b.id=1",
        );
        $q->execute([(int) $_SESSION["user_id"]]);
        respond($q->fetch() ?: []);
    }
    if ($path === "settings" && $method === "PUT") {
        $name = requiredString($body, "name");
        $email = requiredString($body, "email");
        $businessName = requiredString($body, "business_name");
        $tagline = trim((string) ($body["tagline"] ?? ""));
        $address = trim((string) ($body["address"] ?? ""));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            respond(["error" => "Format email tidak valid."], 422);
        }
        try {
            $pdo->beginTransaction();
            $q = $pdo->prepare("UPDATE users SET name=?,email=? WHERE id=?");
            $q->execute([$name, $email, (int) $_SESSION["user_id"]]);
            $q = $pdo->prepare(
                "INSERT INTO business_settings(id,business_name,tagline,address) VALUES(1,?,?,?) ON DUPLICATE KEY UPDATE business_name=VALUES(business_name),tagline=VALUES(tagline),address=VALUES(address)",
            );
            $q->execute([$businessName, $tagline, $address]);
            $pdo->commit();
            $_SESSION["user_name"] = $name;
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            respond(["error" => "Email tersebut sudah digunakan."], 409);
        }
        respond(["message" => "Profil disimpan."]);
    }
    if ($path === "password" && $method === "PUT") {
        $current = (string) ($body["current_password"] ?? "");
        $new = (string) ($body["new_password"] ?? "");
        if (strlen($new) < 10) {
            respond(["error" => "Password baru minimal 10 karakter."], 422);
        }
        $q = $pdo->prepare("SELECT password_hash FROM users WHERE id=?");
        $q->execute([(int) $_SESSION["user_id"]]);
        $hash = $q->fetchColumn();
        if (!$hash || !password_verify($current, $hash)) {
            respond(["error" => "Password saat ini tidak cocok."], 422);
        }
        $q = $pdo->prepare("UPDATE users SET password_hash=? WHERE id=?");
        $q->execute([
            password_hash($new, PASSWORD_DEFAULT),
            (int) $_SESSION["user_id"],
        ]);
        respond(["message" => "Password berhasil diubah."]);
    }
    if ($path === "production" && $method === "POST") {
        $productId = (int) ($body["product_id"] ?? 0);
        $output = nonNegative($body, "output_quantity");
        if ($output <= 0) {
            respond(["error" => "Hasil produksi harus lebih dari nol."], 422);
        }
        $over = nonNegative($body, "operational_cost");
        $items = $body["materials"] ?? [];
        $raw = 0;
        foreach ($items as $it) {
            $id = (int) ($it["material_id"] ?? 0);
            $qty = (float) ($it["quantity"] ?? 0);
            if ($qty < 0) {
                respond(["error" => "Jumlah bahan tidak valid."], 422);
            }
            $q = $pdo->prepare(
                "SELECT unit_price FROM raw_materials WHERE id=?",
            );
            $q->execute([$id]);
            $price = $q->fetchColumn();
            if ($price === false) {
                respond(["error" => "Bahan baku tidak ditemukan."], 422);
            }
            $raw += $qty * (float) $price;
        }
        $total = $raw + $over;
        $unit = $total / $output;
        $pdo->beginTransaction();
        $q = $pdo->prepare(
            "INSERT INTO production_records(product_id,output_quantity,raw_material_cost,operational_cost,total_cost,unit_cost,produced_at) VALUES(?,?,?,?,?,?,?)",
        );
        $q->execute([
            $productId,
            $output,
            $raw,
            $over,
            $total,
            $unit,
            $body["date"] ?? date("Y-m-d"),
        ]);
        $recordId = (int) $pdo->lastInsertId();
        $c = $pdo->prepare(
            "INSERT INTO production_costs(production_record_id,material_id,description,quantity,unit_cost,total_cost) SELECT ?,id,name,?,?,? FROM raw_materials WHERE id=?",
        );
        foreach ($items as $it) {
            $id = (int) $it["material_id"];
            $q = $pdo->prepare(
                "SELECT name,unit_price FROM raw_materials WHERE id=?",
            );
            $q->execute([$id]);
            $m = $q->fetch();
            $c->execute([
                $recordId,
                (float) $it["quantity"],
                $m["unit_price"],
                (float) $it["quantity"] * (float) $m["unit_price"],
                $id,
            ]);
        }
        $u = $pdo->prepare("UPDATE products SET production_cost=? WHERE id=?");
        $u->execute([$unit, $productId]);
        $pdo->commit();
        respond([
            "id" => $recordId,
            "raw_material_cost" => $raw,
            "total_cost" => $total,
            "unit_cost" => $unit,
        ]);
    }
    if ($path === "ai" && $method === "POST") {
        if (empty($cfg["openai_api_key"])) {
            respond(["error" => "OPENAI_API_KEY belum dikonfigurasi."], 503);
        }
        $question = requiredString($body, "message");
        $userId = (int) $_SESSION["user_id"];
        $conversationId = (int) ($body["conversation_id"] ?? 0);

        if ($conversationId) {
            $q = $pdo->prepare(
                "SELECT id FROM ai_conversations WHERE id=? AND user_id=?",
            );
            $q->execute([$conversationId, $userId]);
            if (!$q->fetch()) {
                respond(["error" => "Percakapan tidak ditemukan."], 404);
            }
        } else {
            $q = $pdo->prepare(
                "INSERT INTO ai_conversations(user_id,title) VALUES(?,?)",
            );
            $q->execute([$userId, mb_substr($question, 0, 170)]);
            $conversationId = (int) $pdo->lastInsertId();
        }

        $products = $pdo
            ->query(
                "SELECT p.name,p.selling_price,p.production_cost,COALESCE(SUM(d.quantity),0) sold,COALESCE(SUM(d.quantity*d.unit_price),0) revenue,COALESCE(SUM(d.quantity*d.unit_cost),0) production_cost_sold,COALESCE(SUM(d.quantity*(d.unit_price-d.unit_cost)),0) profit FROM products p LEFT JOIN sale_details d ON d.product_id=p.id GROUP BY p.id",
            )
            ->fetchAll();
        $materials = $pdo
            ->query(
                "SELECT m.name,m.purchase_quantity,m.unit,m.unit_price,COALESCE(SUM(pc.quantity),0) used_quantity,COALESCE(SUM(pc.total_cost),0) production_spend FROM raw_materials m LEFT JOIN production_costs pc ON pc.material_id=m.id GROUP BY m.id",
            )
            ->fetchAll();
        $historyQuery = $pdo->prepare(
            "SELECT role,content FROM ai_messages WHERE conversation_id=? ORDER BY id DESC LIMIT 12",
        );
        $historyQuery->execute([$conversationId]);
        $history = array_reverse($historyQuery->fetchAll());
        $input = array_map(
            fn($message) => [
                "role" => $message["role"],
                "content" => $message["content"],
            ],
            $history,
        );
        $input[] = ["role" => "user", "content" => $question];
        $businessData = json_encode(
            ["products" => $products, "raw_materials" => $materials],
            JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE,
        );
        $payload = [
            "model" => $cfg["openai_model"],
            "instructions" =>
                "Anda adalah analis usaha MAK IGA. Jawab dalam bahasa Indonesia. Gunakan hanya angka pada data yang diberikan; jangan mengarang biaya, harga, atau keuntungan. Jika data kurang, sebutkan data yang perlu dilengkapi. Angka keuangan dihitung oleh backend. Konteks usaha: " .
                $businessData,
            "input" => $input,
        ];
        $encodedPayload = json_encode(
            $payload,
            JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE,
        );
        if ($encodedPayload === false) {
            respond(
                ["error" => "Data percakapan tidak dapat disiapkan untuk AI."],
                500,
            );
        }
        $openAiRequestId = "";
        $ch = curl_init("https://api.openai.com/v1/responses");
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                "Content-Type: application/json",
                "Authorization: Bearer " . $cfg["openai_api_key"],
            ],
            CURLOPT_POSTFIELDS => $encodedPayload,
            CURLOPT_TIMEOUT => 45,
            CURLOPT_HEADERFUNCTION => static function ($curl, string $header) use (&$openAiRequestId): int {
                if (stripos($header, "x-request-id:") === 0) {
                    $openAiRequestId = trim(substr($header, strlen("x-request-id:")));
                }
                return strlen($header);
            },
        ]);
        $raw = curl_exec($ch);
        $curlError = curl_error($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = (string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        curl_close($ch);
        if ($raw === false) {
            respond(
                [
                    "error" =>
                        "Server tidak dapat terhubung ke OpenAI. Periksa internet atau pengaturan proxy/firewall. " .
                        ($curlError !== "" ? "Detail: {$curlError}" : ""),
                ],
                502,
            );
        }
        if ($status >= 400) {
            $apiResponse = json_decode($raw, true);
            $apiError = is_array($apiResponse["error"] ?? null)
                ? $apiResponse["error"]
                : [];
            $apiCode = (string) ($apiError["code"] ?? "");
            $apiType = (string) ($apiError["type"] ?? "");
            $apiDetail = trim(
                preg_replace(
                    "/\\s+/u",
                    " ",
                    (string) ($apiError["message"] ?? ""),
                ) ?? "",
            );
            if ($apiDetail === "") {
                $apiDetail = trim(
                    preg_replace("/\\s+/u", " ", strip_tags($raw)) ?? "",
                );
            }
            if ($apiDetail === "" && $status === 400) {
                $apiDetail = sprintf(
                    "HTTP 400; model=%s; response_bytes=%d; content_type=%s; request_id=%s",
                    $cfg["openai_model"],
                    strlen($raw),
                    $contentType !== "" ? $contentType : "none",
                    $openAiRequestId !== "" ? $openAiRequestId : "none",
                );
            }
            if (strlen($apiDetail) > 320) {
                $apiDetail = substr($apiDetail, 0, 320) . "…";
            }

            if ($status === 401) {
                $message =
                    "API key ditolak OpenAI. Buat key baru, simpan dengan benar, lalu jalankan ulang server menggunakan key tersebut.";
            } elseif ($status === 403) {
                $message =
                    "API key tidak memiliki izin untuk permintaan ini. Buat key dengan izin All atau periksa akses project.";
            } elseif (
                $status === 429 ||
                $apiCode === "insufficient_quota" ||
                $apiType === "insufficient_quota"
            ) {
                $message =
                    "Kuota API OpenAI tidak tersedia atau batas penggunaan tercapai. Periksa Billing dan Usage pada platform API.";
            } elseif ($status === 400) {
                $message =
                    "Permintaan AI ditolak OpenAI." .
                    ($apiDetail !== ""
                        ? " Detail: {$apiDetail}"
                        : " HTTP 400. Periksa model dan format permintaan pada konfigurasi aplikasi.");
            } else {
                $message =
                    "Layanan OpenAI mengembalikan error (HTTP {$status}). Coba lagi beberapa saat.";
            }

            respond(["error" => $message], 502);
        }
        $response = json_decode($raw, true);
        $answer = "";
        foreach ($response["output"] ?? [] as $item) {
            foreach ($item["content"] ?? [] as $part) {
                if (($part["type"] ?? "") === "output_text") {
                    $answer .= $part["text"];
                }
            }
        }
        if ($answer === "") {
            respond(["error" => "Respons AI kosong."], 502);
        }
        $messageQuery = $pdo->prepare(
            "INSERT INTO ai_messages(conversation_id,role,content) VALUES(?,?,?)",
        );
        $messageQuery->execute([$conversationId, "user", $question]);
        $messageQuery->execute([$conversationId, "assistant", $answer]);
        respond([
            "conversation_id" => $conversationId,
            "answer" => $answer,
        ]);
    }
    if ($path === "ai/history" && $method === "GET") {
        $q = $pdo->prepare(
            "SELECT c.id,c.title,c.created_at,m.role,m.content,m.created_at AS message_at FROM ai_conversations c LEFT JOIN ai_messages m ON m.conversation_id=c.id WHERE c.user_id=? ORDER BY c.created_at DESC,m.id",
        );
        $q->execute([(int) $_SESSION["user_id"]]);
        respond($q->fetchAll());
    }
    respond(["error" => "Resource tidak ditemukan."], 404);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    respond(["error" => "Permintaan gagal diproses."], 500);
}
