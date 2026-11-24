# MANUAL BOOK
## Aplikasi MAK IG SmartCost

### Identitas Karya

| Informasi | Keterangan |
|---|---|
| Nama ciptaan | MAK IG SmartCost |
| Jenis ciptaan | Program komputer / aplikasi berbasis website |
| Pencipta | `[Isi nama pencipta sesuai dokumen pengajuan]` |
| Pemegang hak cipta | `[Isi nama pemegang hak cipta]` |
| Tahun pembuatan | `[Isi tahun pembuatan]` |
| Versi aplikasi | `[Isi nomor versi, contoh: 1.0]` |
| Bahasa antarmuka | Bahasa Indonesia |
| Platform | Website yang dijalankan melalui browser |

> **Catatan pengisian:** lengkapi bagian di dalam tanda kurung siku berdasarkan data pencipta dan dokumen pengajuan. Pastikan nama pencipta, pemegang hak cipta, dan tahun sama dengan data yang digunakan pada berkas pengajuan HKI.

### Ringkasan Karya

MAK IG SmartCost merupakan aplikasi website untuk membantu pencatatan dan analisis sederhana pada usaha MAK IGA. Aplikasi mengelola data produk, bahan baku, produksi, penjualan, dan informasi usaha. Berdasarkan data tersebut, aplikasi menampilkan perhitungan biaya, simulasi harga jual, ringkasan keuntungan, dan laporan. Aplikasi juga menyediakan fitur AI Business Advisor yang dapat digunakan apabila koneksi dan konfigurasi layanan AI tersedia.

### Teknologi yang Digunakan

| Bagian | Teknologi / fungsi |
|---|---|
| Antarmuka | HTML, CSS, dan JavaScript |
| Backend | PHP |
| Database | MySQL |
| Komunikasi data | API berbasis JSON melalui PHP |
| Grafik | Chart.js |
| Layanan tambahan | OpenAI API untuk fitur AI Business Advisor, jika dikonfigurasi |

### Susunan Berkas Utama

| Berkas/folder | Kegunaan |
|---|---|
| `login.php` | Halaman login, validasi akun, dan pembuatan sesi pengguna. |
| `index.php` | Kerangka aplikasi utama dan navigasi setelah login. |
| `logout.php` | Mengakhiri sesi pengguna. |
| `assets/css/styles.css` | Mengatur tampilan dan tata letak halaman. |
| `assets/js/app.js` | Mengatur navigasi, interaksi halaman, pengiriman request, dan tampilan data. |
| `backend/api.php` | Memproses permintaan data, memvalidasi input, dan berkomunikasi dengan database. |
| `backend/upload.php` | Memproses unggahan foto produk. |
| `backend/bootstrap.php` | Menyiapkan koneksi MySQL untuk proses backend/CLI. |
| `backend/setup-user.php` | Membuat akun pengguna awal melalui terminal. |
| `database/schema.sql` | Membuat struktur database dan tabel aplikasi. |
| `docs/manual-book.md` | Panduan penggunaan dan ringkasan bagian penting dari program. |

### Ruang Lingkup Manual

Manual ini menjelaskan tujuan aplikasi, persiapan, cara menggunakan menu, dan bagian kode utama. Potongan kode pada lampiran dipakai untuk menerangkan cara kerja program. Untuk pemeriksaan teknis atau pengembangan, gunakan kode sumber lengkap pada berkas proyek.

### 1. Pendahuluan

MAK IG SmartCost adalah aplikasi berbasis website untuk membantu pemilik usaha MAK IGA mengelola data usaha. Aplikasi ini menyediakan fitur untuk mencatat produk dan bahan baku, menghitung biaya produksi, mencoba harga jual, mencatat penjualan, serta melihat keuntungan dan laporan.

Manual book ini berisi panduan dasar untuk menggunakan aplikasi. Penjelasannya dibuat sederhana agar pengguna dapat mengikuti langkah-langkahnya dengan mudah.

### 2. Tujuan Aplikasi

Aplikasi MAK IG SmartCost dibuat untuk membantu pengguna agar:

- Data produk dan bahan baku tersimpan lebih teratur.
- Biaya produksi dan harga jual dapat dihitung dengan lebih mudah.
- Penjualan dapat dicatat dan digunakan untuk menghitung keuntungan.
- Kondisi usaha dapat dilihat melalui dashboard dan laporan.
- Pengguna bisa mendapatkan saran usaha melalui fitur AI Business Advisor.

### 3. Persiapan Sebelum Menggunakan Aplikasi

Untuk menggunakan aplikasi versi backend, siapkan:

1. Komputer atau laptop yang memiliki PHP dan MySQL, misalnya melalui XAMPP.
2. Browser seperti Google Chrome atau Microsoft Edge.
3. Database aplikasi yang sudah dibuat dari file `database/schema.sql`.
4. Pengaturan koneksi database pada `backend/config.php`.
5. Akun pengguna yang sudah dibuat oleh pengelola aplikasi.

Jika aplikasi dijalankan di komputer sendiri dengan PHP development server, alamatnya biasanya `http://127.0.0.1:8000/login.php`. Jika menggunakan XAMPP, alamat mengikuti nama folder proyek di dalam `htdocs`, misalnya `http://localhost/nama-folder/login.php`.

File `demo.html` dapat dibuka untuk melihat tampilan demo. Demo dapat menggunakan data contoh di browser, sehingga data demo tidak selalu sama dengan data yang tersimpan di MySQL.

### 4. Cara Login

1. Buka halaman login melalui browser.
2. Masukkan email akun yang sudah dibuat.
3. Masukkan kata sandi akun.
4. Jika ingin memeriksa kata sandi yang diketik, tekan tombol **Tampilkan** pada kolom password. Tekan kembali tombol tersebut untuk menyembunyikan kata sandi.
5. Tekan tombol **Masuk**.
6. Jika email dan kata sandi benar, aplikasi akan membuka halaman Dashboard.

Jika muncul pesan bahwa email atau password tidak cocok, periksa kembali penulisan email dan kata sandi. Jika muncul pesan database tidak dapat dihubungi, minta pengelola memeriksa apakah MySQL aktif dan konfigurasi database sudah benar.

> Aplikasi tidak menyediakan password admin bawaan. Akun dibuat oleh pengelola melalui proses setup, dan password yang terlupa perlu diubah atau direset oleh pengelola.

### 5. Bagian-Bagian Tampilan

Setelah berhasil login, pengguna akan melihat beberapa bagian berikut:

- **Sidebar/menu samping:** berisi menu Dashboard, Data Produk, Data Bahan Baku, simulasi, analisis, laporan, dan pengaturan.
- **Bagian atas halaman:** menampilkan nama menu yang sedang dibuka serta tanggal.
- **Bagian isi:** menampilkan tabel, formulir, grafik, atau hasil sesuai menu yang dipilih.
- **Tombol menu di perangkat mobile:** digunakan untuk membuka atau menutup sidebar jika layar kecil.

### 6. Cara Menggunakan Menu

#### 6.1 Dashboard

Dashboard menampilkan ringkasan informasi usaha, seperti jumlah produk, pendapatan, biaya produksi, keuntungan, dan kerugian berdasarkan data yang tersedia. Dashboard juga menampilkan grafik pendapatan dan biaya serta produk yang memiliki keuntungan paling tinggi.

Cara melihat dashboard:

1. Pilih menu **Dashboard** di sidebar.
2. Periksa kartu ringkasan pada bagian atas.
3. Gunakan pilihan rentang waktu pada grafik untuk melihat data harian atau bulanan jika tersedia.
4. Jika data masih kosong, isi data produk dan catat penjualan terlebih dahulu.

#### 6.2 Data Produk

Menu **Data Produk** digunakan untuk mengatur produk yang dijual.

Untuk menambahkan produk:

1. Pilih **Data Produk**.
2. Tekan tombol **Tambah produk**.
3. Isi informasi produk pada formulir, seperti nama, kategori, harga jual, dan informasi lain yang diminta.
4. Jika tersedia, tambahkan foto produk.
5. Tekan tombol simpan.

Untuk mengubah atau menghapus produk, cari produk pada tabel lalu tekan tombol **Edit** atau **Hapus** pada kolom aksi. Gunakan kolom pencarian atau pilihan kategori untuk menemukan produk lebih cepat.

Harga jual dan biaya per unit pada tabel membantu pengguna membandingkan harga produk dengan biaya produksinya. Pastikan data yang dimasukkan benar agar hasil analisis lebih sesuai.

#### 6.3 Data Bahan Baku

Menu **Data Bahan Baku** digunakan untuk mencatat bahan yang dipakai dalam proses produksi.

Untuk  menambahkan bahan baku:

1. Pilih **Data Bahan Baku**.
2. Tekan **Tambah bahan**.
3. Isi nama bahan, jumlah pembelian, satuan, harga, dan keterangan jika diperlukan.
4. Tekan tombol simpan.

Pada tabel bahan, pengguna dapat mencari bahan, mengubah data, melihat riwayat perubahan harga, atau menghapus bahan. Catat harga terbaru agar perhitungan biaya produksi menjadi lebih tepat.

#### 6.4 Simulasi Biaya Produksi

Menu **Simulasi Biaya Produksi** digunakan untuk memperkirakan biaya yang diperlukan untuk membuat produk.

Langkah penggunaannya:

1. Pilih menu **Simulasi Biaya Produksi**.
2. Pilih nama produk.
3. Isi jumlah hasil produksi yang ingin dibuat.
4. Pilih bahan baku yang digunakan dan masukkan jumlah pemakaiannya.
5. Tambahkan bahan lain jika diperlukan.
6. Isi biaya operasional tambahan, misalnya biaya gas atau kemasan, sesuai kebutuhan.
7. Periksa ringkasan biaya dan biaya per unit yang dihitung oleh aplikasi.
8. Tekan tombol simpan jika ingin menyimpan hasil simulasi atau memperbarui biaya produk.

Hasil perhitungan bergantung pada harga bahan dan jumlah pemakaian yang dimasukkan. Periksa satuan bahan agar tidak terjadi kesalahan perhitungan.

#### 6.5 Simulasi Harga Jual

Menu **Simulasi Harga Jual** membantu pengguna mencoba harga jual dan melihat perkiraan hasilnya.

1. Pilih menu **Simulasi Harga Jual**.
2. Pilih produk yang ingin dihitung.
3. Masukkan informasi simulasi yang diminta, seperti biaya atau target keuntungan.
4. Tekan tombol hitung atau simpan sesuai tampilan.
5. Periksa saran harga jual dan perkiraan keuntungan.

Gunakan hasil simulasi sebagai bahan pertimbangan. Pastikan biaya produk sudah diperbarui sebelum melakukan simulasi.

#### 6.6 Keuntungan

Menu **Keuntungan** menampilkan penjualan, biaya produk, dan hasil laba atau rugi berdasarkan transaksi yang tercatat.

Untuk mencatat penjualan, tekan tombol **Catat penjualan** pada halaman Keuntungan, lalu pilih produk dan isi jumlah yang terjual. Periksa total transaksi dan simpan. Setelah penjualan tercatat, ringkasan keuntungan dan dashboard dapat ikut berubah.

Jika belum ada penjualan, nilai pendapatan atau keuntungan bisa masih nol. Aplikasi menghitung pendapatan berdasarkan transaksi yang benar-benar dicatat.

#### 6.7 Perbandingan Produk

Menu **Perbandingan Produk** digunakan untuk membandingkan hasil beberapa produk, misalnya dari sisi harga, biaya, penjualan, atau keuntungan sesuai informasi yang ditampilkan.

1. Buka menu **Perbandingan Produk**.
2. Pilih atau lihat produk yang ingin dibandingkan.
3. Periksa grafik atau tabel yang tersedia.
4. Gunakan hasil perbandingan untuk mengetahui produk yang perlu dipertahankan atau dievaluasi.

Hasil perbandingan akan lebih bermanfaat jika biaya dan data penjualan setiap produk sudah diisi.

#### 6.8 Analisis Keuangan

Menu **Analisis Keuangan** menampilkan ringkasan keuangan dari data penjualan dan biaya yang tercatat. Pengguna dapat memilih rentang waktu yang tersedia, seperti harian, mingguan, bulanan, atau tahunan.

Pilih rentang waktu pada menu, kemudian amati grafik dan ringkasan keuntungan per produk. Data yang belum dicatat tidak dapat ikut dihitung.

#### 6.9 AI Business Advisor

AI Business Advisor dapat membantu menjawab pertanyaan mengenai usaha berdasarkan informasi yang tersedia. Contoh pertanyaan yang dapat ditanyakan antara lain produk yang paling menguntungkan atau cara mengurangi biaya produksi.

1. Pilih menu **AI Business Advisor**.
2. Pilih salah satu pertanyaan singkat yang tersedia atau ketik pertanyaan sendiri.
3. Tekan **Kirim**.
4. Tunggu jawaban muncul pada halaman percakapan.

Fitur ini membutuhkan koneksi internet dan konfigurasi layanan AI di server. Jika muncul pesan bahwa layanan AI tidak dapat menjawab, coba lagi nanti atau minta pengelola memeriksa koneksi dan konfigurasi. Jangan membagikan API key kepada pengguna lain.

#### 6.10 Laporan

Menu **Laporan** menampilkan ringkasan penjualan, laba rugi, dan pemakaian bahan baku.

1. Pilih menu **Laporan**.
2. Isi tanggal **Dari** dan **Sampai** jika ingin membatasi periode laporan.
3. Periksa tabel penjualan, pendapatan, biaya produk, keuntungan, dan pemakaian bahan.
4. Tekan **Cetak / Simpan PDF** untuk membuka dialog cetak browser.
5. Pilih printer atau opsi **Save as PDF / Simpan sebagai PDF** pada dialog tersebut.

Nama pilihan pada dialog dapat berbeda tergantung browser dan sistem operasi yang digunakan.

#### 6.11 Pengaturan

Menu **Pengaturan** digunakan untuk mengelola informasi pengguna/usaha dan keamanan akun yang tersedia pada aplikasi.

Untuk menyimpan profil:

1. Buka menu **Pengaturan**.
2. Ubah data yang ingin diperbarui, seperti nama pengguna, email, nama usaha, tagline, atau alamat.
3. Tekan **Simpan profil**.

Untuk mengganti password:

1. Isi password saat ini.
2. Isi password baru sesuai ketentuan yang ditampilkan (minimal 10 karakter).
3. Tekan **Perbarui password**.
4. Jika berhasil, gunakan password baru pada login berikutnya.

### 7. Cara Keluar dari Aplikasi

1. Tekan tombol menu/titik tiga di bagian bawah sidebar.
2. Konfirmasi keluar jika diminta.
3. Aplikasi mengakhiri sesi dan kembali ke halaman login.

Jika menggunakan komputer bersama, selalu lakukan logout setelah selesai.

### 8. Tips Penggunaan

- Masukkan data produk dan bahan baku dengan teliti.
- Gunakan satuan yang konsisten, misalnya gram, kilogram, atau liter.
- Perbarui harga bahan baku ketika ada perubahan harga.
- Catat setiap penjualan agar laporan dan perhitungan keuntungan lebih sesuai.
- Periksa kembali biaya produksi sebelum menentukan harga jual.
- Gunakan tanggal laporan yang sesuai dengan kebutuhan.
- Jangan membagikan akun dan kata sandi kepada orang lain.

### 9. Kendala yang Mungkin Terjadi

| Kendala | Kemungkinan penyebab | Yang dapat dilakukan |
|---|---|---|
| Halaman login menampilkan database tidak dapat dihubungi | MySQL mati, nama database atau kredensial salah, atau file konfigurasi belum tersedia | Minta pengelola menyalakan MySQL dan memeriksa `backend/config.php`. |
| Email atau password tidak cocok | Data login salah atau akun belum dibuat | Periksa kembali email dan password, atau hubungi pengelola untuk membuat/reset akun. |
| Dashboard kosong atau nilainya nol | Data produk atau transaksi belum dimasukkan | Tambahkan data produk/bahan dan catat transaksi yang diperlukan. |
| Data tidak tersimpan | Koneksi database bermasalah atau masukan tidak lolos validasi | Periksa pesan yang muncul, pastikan kolom wajib terisi, lalu coba kembali. |
| Business Advisor gagal menjawab | Internet atau konfigurasi AI bermasalah, atau layanan sedang tidak tersedia | Coba lagi nanti dan minta pengelola memeriksa konfigurasi server. |
| Foto produk gagal diunggah | Jenis atau ukuran foto tidak sesuai | Gunakan file JPG, PNG, atau WebP dengan ukuran maksimal 5 MB. |

### 10. Penutup

Manual book ini menjelaskan penggunaan dasar MAK IG SmartCost. Pengguna dapat memulai dari pengisian produk dan bahan baku, kemudian melakukan simulasi produksi, mencatat penjualan, dan melihat laporan. Data yang dimasukkan dengan benar akan membantu aplikasi menampilkan perhitungan yang lebih berguna bagi usaha.

## Lampiran: Bagian Coding yang Penting

Bagian ini menjelaskan beberapa potongan kode utama yang menjalankan aplikasi. Potongan kode dibuat singkat agar lebih mudah dipahami. Untuk melihat kode lengkap, buka file yang disebutkan pada setiap bagian.

### A. Pemeriksaan Login dan Password

File: `login.php`

Saat pengguna menekan tombol Masuk, PHP mencari akun berdasarkan email. Password yang dimasukkan diperiksa menggunakan `password_verify()` terhadap hash yang tersimpan di database.

```php
$q = $pdo->prepare(
    "SELECT id, name, password_hash FROM users WHERE email = ?"
);
$q->execute([trim((string) ($_POST["email"] ?? ""))]);
$user = $q->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($_POST["password"], $user["password_hash"])) {
    session_regenerate_id(true);
    $_SESSION["user_id"] = (int) $user["id"];
    $_SESSION["user_name"] = $user["name"];
}
```

Tanda `?` pada query menjadi tempat untuk nilai email. Cara ini membantu mencegah input pengguna dianggap sebagai bagian dari perintah SQL. Password tidak dibandingkan sebagai teks biasa, tetapi diperiksa dengan fungsi khusus PHP.

### B. Melindungi Halaman Setelah Login

File: `index.php`

Potongan berikut memastikan halaman utama hanya dapat dibuka jika sesi login tersedia.

```php
session_start();

if (empty($_SESSION["user_id"])) {
    header("Location: login.php");
    exit();
}
```

Sesi dibuat saat login berhasil. Jika belum ada `user_id` di sesi, pengguna diarahkan kembali ke halaman login.

### C. Koneksi ke Database MySQL

File: `backend/bootstrap.php` dan `backend/config.php`

Koneksi database dibuat menggunakan PDO. Nilai host, nama database, username, dan password database dibaca dari file konfigurasi lokal.

```php
$cfg = require __DIR__ . "/config.php";

$pdo = new PDO(
    "mysql:host={$cfg["db_host"]};dbname={$cfg["db_name"]};charset=utf8mb4",
    $cfg["db_user"],
    $cfg["db_pass"],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);
```

File konfigurasi berisi informasi rahasia database sehingga tidak boleh dibagikan atau diunggah ke tempat publik. File contoh yang dapat dijadikan acuan adalah `backend/config.example.php`.

### D. API untuk Menghubungkan Halaman dengan Backend

File: `assets/js/app.js` dan `backend/api.php`

JavaScript mengirim request ke `backend/api.php`. Contoh berikut adalah bentuk sederhana fungsi `api()` yang dipakai halaman untuk meminta atau mengirim data.

```javascript
async function api(resource, method = "GET", payload = null) {
  const response = await fetch(
    `backend/api.php?resource=${encodeURIComponent(resource)}`,
    {
      method,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: payload ? JSON.stringify(payload) : undefined,
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Permintaan gagal");
  return data;
}
```

Contohnya, halaman meminta daftar produk dengan resource `products`. Backend memeriksa sesi, membaca atau mengubah data MySQL, lalu mengirim hasil dalam format JSON.

### E. Pemeriksaan Sesi pada API

File: `backend/api.php`

API juga memeriksa sesi login. Jadi, request data tidak hanya dilindungi pada halaman tampilan.

```php
session_start();

if (empty($_SESSION["user_id"])) {
    respond(["error" => "Silakan masuk terlebih dahulu."], 401);
}
```

Kode status `401` berarti request belum memiliki sesi login yang sah. Fungsi `respond()` mengirim jawaban API dalam format JSON.

### F. Penyimpanan Password yang Aman

File: `backend/setup-user.php` dan `backend/api.php`

Ketika akun dibuat atau password diganti, sistem menyimpan hasil hash, bukan password asli.

```php
$hash = password_hash($password, PASSWORD_DEFAULT);
```

Karena database hanya menyimpan hash, password lama tidak dapat dibaca kembali dari database. Jika pengguna lupa password, pengelola perlu melakukan proses reset.

### G. Tabel Database Utama

File: `database/schema.sql`

Database menyimpan data aplikasi dalam beberapa tabel. Contoh tabel pengguna dan produk:

```sql
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('owner','staff') NOT NULL DEFAULT 'owner'
);

CREATE TABLE products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(100) NOT NULL,
  selling_price DECIMAL(14,2) NOT NULL DEFAULT 0,
  production_cost DECIMAL(14,2) NOT NULL DEFAULT 0
);
```

Tabel lain menyimpan bahan baku, riwayat harga, resep produksi, catatan produksi, transaksi penjualan, simulasi harga, pengaturan usaha, dan percakapan AI. Hubungan antar tabel membantu menjaga data tetap terhubung, contohnya detail penjualan menunjuk ke produk yang dijual.

### H. Membuat Akun Pengguna Pertama

File: `backend/setup-user.php`

Script ini dijalankan satu kali lewat terminal. Script membuat password sementara secara acak dan menyimpannya dalam bentuk hash.

```powershell
php backend/setup-user.php admin@makiga.id "Admin MAK IGA"
```

Password sementara ditampilkan di terminal setelah proses berhasil. Simpan password tersebut dan ubah setelah login. Jangan menaruh password asli di source code.

### I. Alur Singkat Data Aplikasi

```text
Pengguna mengisi form di browser
        ↓
JavaScript mengirim request ke backend/api.php
        ↓
Backend memeriksa sesi dan memvalidasi data
        ↓
Backend membaca atau menyimpan data ke MySQL
        ↓
Backend mengirim hasil JSON ke browser
        ↓
Halaman menampilkan data atau pesan
```

Dengan alur ini, browser bertugas menampilkan halaman, JavaScript mengirim request, PHP memproses aturan aplikasi, dan MySQL menyimpan data.
