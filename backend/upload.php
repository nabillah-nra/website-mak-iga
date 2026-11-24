<?php
declare(strict_types=1);
session_start();
header("Content-Type: application/json; charset=utf-8");

function uploadResponse(array $body, int $status): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit();
}

if (empty($_SESSION["user_id"])) {
    uploadResponse(["error" => "Silakan masuk terlebih dahulu."], 401);
}
if (empty($_FILES["photo"]) || $_FILES["photo"]["error"] !== UPLOAD_ERR_OK) {
    uploadResponse(["error" => "Pilih foto produk yang valid."], 422);
}
$file = $_FILES["photo"];
if ($file["size"] > 5 * 1024 * 1024) {
    uploadResponse(["error" => "Ukuran foto maksimal 5 MB."], 422);
}
$mime = new finfo(FILEINFO_MIME_TYPE)->file($file["tmp_name"]);
$extensions = [
    "image/jpeg" => "jpg",
    "image/png" => "png",
    "image/webp" => "webp",
];
if (!isset($extensions[$mime])) {
    uploadResponse(["error" => "Gunakan foto JPG, PNG, atau WebP."], 422);
}
$uploadDirectory = dirname(__DIR__) . "/assets/uploads";
if (!is_dir($uploadDirectory) && !mkdir($uploadDirectory, 0755, true)) {
    uploadResponse(["error" => "Folder unggahan tidak dapat dibuat."], 500);
}
$filename = bin2hex(random_bytes(16)) . "." . $extensions[$mime];
if (
    !move_uploaded_file($file["tmp_name"], $uploadDirectory . "/" . $filename)
) {
    uploadResponse(["error" => "Foto gagal disimpan."], 500);
}
uploadResponse(["photo" => "assets/uploads/" . $filename], 201);
