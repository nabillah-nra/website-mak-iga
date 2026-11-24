# MAK IG SmartCost

Aplikasi PHP/MySQL dengan dashboard HTML, CSS, dan JavaScript. Untuk melihat demo lokal tanpa PHP, buka `demo.html`; aplikasi server memakai `index.php` dan sesi login.

## Susunan folder

```text
├── assets/
│   ├── css/styles.css       # gaya dashboard dan login
│   └── js/app.js            # navigasi, tampilan, dan interaksi
├── backend/
│   ├── api.php              # endpoint PHP untuk data dan AI
│   ├── bootstrap.php        # koneksi database untuk setup CLI
│   ├── config.example.php   # contoh konfigurasi lokal
│   └── setup-user.php       # membuat akun pemilik pertama
├── database/schema.sql     # tabel dan relasi MySQL
├── index.php                # dashboard dengan autentikasi
├── login.php                # halaman masuk
└── demo.html                # preview tanpa backend
```

File halaman utama sengaja berada di root agar path deployment XAMPP tetap sederhana; aset dan backend dikelompokkan agar Explorer lebih mudah dinavigasi.

## Menjalankan backend lokal (XAMPP)

1. Salin folder proyek ke `htdocs`.
2. Jalankan Apache dan MySQL.
3. Impor `database/schema.sql` lewat phpMyAdmin.
4. Salin `backend/config.example.php` menjadi `backend/config.php`, lalu atur kredensial database. File rahasia ini sudah masuk `.gitignore`.
5. Dari terminal di folder proyek jalankan `php backend/setup-user.php admin@makiga.id "Mak Iga Admin"`. Simpan password sementara yang dicetak.
6. Buka `http://localhost/<nama-folder>/login.php` dan masuk dengan akun tadi.

Untuk OpenAI, atur `OPENAI_API_KEY` pada environment PHP server, dan opsional `OPENAI_MODEL`. Ekstensi PHP PDO MySQL dan cURL harus aktif. Jangan menaruh API key pada JavaScript atau repository.

## Backend tersedia

- Login berbasis session PHP dan password hash. `index.php` serta `backend/api.php` mewajibkan session aktif.
- CRUD produk dan bahan baku lewat API, termasuk riwayat perubahan harga bahan baku.
- Foto produk JPG, PNG, dan WebP dapat diunggah (maks. 5 MB); validasi jenis file dan ukuran dilakukan di backend.
- Simulasi produksi dihitung server dan memperbarui biaya per unit produk.
- Pencatatan penjualan menyimpan snapshot harga jual dan biaya pada saat transaksi; ringkasan laba memakai transaksi tersebut.
- Simulasi harga tersimpan di MySQL, laporan penjualan dan pemakaian bahan dapat difilter tanggal dan dicetak/disimpan sebagai PDF melalui dialog cetak browser.
- Profil akun dan perubahan password memakai endpoint terautentikasi. Informasi nama usaha disimpan pada browser.
- AI Business Advisor mengirim ringkasan angka dari MySQL ke OpenAI dari server dan menampilkan riwayat percakapan.
- Skema database relasional tersedia di `database/schema.sql`.

Saat dibuka lewat XAMPP, frontend mencoba API PHP otomatis. Produk, bahan, penjualan, serta simulasi biaya memakai MySQL. Jika API belum tersedia, frontend memakai data demo lokal. Chart.js dan font dimuat dari CDN.

## Catatan cakupan

PDF dibuat lewat fitur cetak browser (pilih “Save as PDF”), bukan generator PDF server. Jika memakai database dari versi lama, jalankan `001_product_photo.sql` bila kolom foto belum ada, lalu jalankan `002_business_settings.sql`. Database baru cukup diimpor dari `database/schema.sql`. AI memerlukan API key aktif dan konfigurasi layanan. Data contoh lokal ditandai sebagai demo. Gambar logo asli MAK IGA tidak ditemukan di folder proyek, sehingga mark sementara masih berupa huruf “MI”.
