$ErrorActionPreference = "Stop"

if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
    Write-Error "PHP belum ditemukan. Pastikan PHP masuk ke PATH, lalu buka ulang terminal."
    exit 1
}

$apiKey = $env:OPENAI_API_KEY
if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Error "OPENAI_API_KEY belum diatur. Tambahkan di User environment variables Windows, lalu buka ulang VS Code."
    exit 1
}

$apiKey = $apiKey.Trim()
if ($apiKey -notmatch '^sk-[A-Za-z0-9_-]+$') {
    Write-Error "Format OPENAI_API_KEY tidak valid. Periksa nilai variabel di Windows; jangan sertakan tanda kutip atau spasi."
    exit 1
}

try {
    $env:OPENAI_API_KEY = $apiKey
    $env:OPENAI_MODEL = "gpt-5.4-mini"
    Write-Host "Menjalankan MAK IG SmartCost di http://127.0.0.1:8001"
    Write-Host "Biarkan jendela ini terbuka. Tekan Ctrl+C untuk menghentikan server."
    & php -S 127.0.0.1:8001 -t $PSScriptRoot
} finally {
    $env:OPENAI_MODEL = $null
    $apiKey = $null
}
