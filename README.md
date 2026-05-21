# SIPRAS-NT

**Sistem Informasi Inventaris Sarana dan Prasarana Berbasis Web**  
SMKS Nahdlatuth Thalabah

SIPRAS-NT adalah aplikasi web untuk membantu pengelolaan inventaris sarana dan prasarana sekolah secara terpusat. Sistem ini menggantikan proses pencatatan manual berbasis spreadsheet yang rentan error, tidak seragam, dan sulit dimonitor oleh Waka Sarpras.

Aplikasi ini dikembangkan sebagai produk Capstone Project Kelompok B Program Studi Sistem Informasi, Fakultas Sains dan Teknologi, Universitas Terbuka.

---

## Tim Pengembang

| Nama | NIM | Peran |
|---|---|---|
| Aris Sinopa | 049388557 | Technical Lead / Developer |
| Melinda Elsa Kessek | 049852091 | Dokumentasi |
| Rahma Ardhana Sukma | 044713044 | Penyusunan Dokumen |
| Safira Afifatul Mu’arrofah | 048160453 | Pengumpulan Data |

---

## Fitur Utama

### Autentikasi dan Hak Akses

- Login dan logout pengguna.
- Session login menggunakan `express-session`.
- Password disimpan dalam bentuk hash menggunakan `bcryptjs`.
- Role-based access control:
  - Waka Sarpras
  - Guru PJ Ruangan

### Fitur Waka Sarpras

- Melihat dashboard monitoring inventaris.
- Mengelola akun PJ Ruangan.
- Mengelola data ruangan.
- Menetapkan PJ pada masing-masing ruangan.
- Melihat seluruh data barang inventaris.
- Melihat daftar barang rusak.
- Menandai barang rusak sebagai sudah diperbaiki.
- Mengatur periode pengisian inventaris.
- Membuka akses khusus atau unlock sementara untuk ruangan tertentu.
- Membatalkan unlock khusus.
- Mencetak laporan PDF.

### Fitur PJ Ruangan

- Melihat dashboard khusus PJ.
- Menginput data barang pada ruangan yang menjadi tanggung jawabnya.
- Mengedit data barang milik ruangannya sendiri.
- Melaporkan barang rusak.
- Mengisi kondisi barang:
  - Baik
  - Rusak Ringan
  - Rusak Berat

### Fitur Periode Pengisian

- Waka Sarpras dapat mengatur tanggal mulai dan durasi periode pengisian.
- Default periode pengisian adalah 1 minggu di awal bulan.
- Di luar periode, form input/edit barang PJ dikunci.
- Waka dapat memberikan unlock khusus untuk ruangan tertentu.
- Unlock khusus otomatis berlaku sementara.
- Dashboard Waka menampilkan status kepatuhan PJ.

### Fitur Laporan

Sistem menyediakan laporan dalam format PDF:

- Laporan inventaris per ruangan.
- Laporan rekap seluruh inventaris.
- Laporan barang rusak.

---

## Stack Teknologi

| Komponen | Teknologi |
|---|---|
| Runtime | Node.js |
| Framework Backend | Express.js |
| Template Engine | EJS |
| Layout Engine | express-ejs-layouts |
| ORM | Prisma |
| Database | PostgreSQL via Supabase |
| Session Store | connect-pg-simple |
| Authentication | bcryptjs |
| Scheduler | node-cron |
| PDF Generator | PDFKit |
| Frontend | Bootstrap 5.3 CDN + Bootstrap Icons |
| Deployment | Railway |

---

## Struktur Folder

```txt
sipras-nt/
├── prisma/
│   ├── schema.prisma
│   ├── seed.js
│   └── migrations/
├── public/
│   └── assets/
├── src/
│   ├── app.js
│   ├── config/
│   │   ├── database.js
│   │   └── session.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── penggunaController.js
│   │   ├── ruanganController.js
│   │   ├── barangController.js
│   │   ├── logPerbaikanController.js
│   │   ├── laporanController.js
│   │   └── settingsController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── role.js
│   │   ├── periodeAktif.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── pengguna.js
│   │   ├── ruangan.js
│   │   ├── barang.js
│   │   ├── logPerbaikan.js
│   │   ├── laporan.js
│   │   └── settings.js
│   ├── utils/
│   │   ├── periodeChecker.js
│   │   ├── scheduler.js
│   │   ├── pdfGenerator.js
│   │   └── validator.js
│   └── views/
│       ├── layouts/
│       ├── partials/
│       ├── auth/
│       ├── dashboard/
│       ├── pengguna/
│       ├── ruangan/
│       ├── barang/
│       ├── log-perbaikan/
│       ├── laporan/
│       ├── settings/
│       └── landing/
├── server.js
├── package.json
├── package-lock.json
├── .env.example
└── README.md
```

## Persyaratan Sistem
- Node.js versi 18 atau lebih baru.
- PostgreSQL database.
- Supabase project untuk cloud database.
- Railway atau layanan hosting Node.js lain untuk deployment.

## Setup Lokal

1. Clone Repository
``` bash
git clone https://github.com/Aris0506/sipras-nt.git
cd sipras-nt
```
2. Install Dependency
``` bash
npm install
```
3. Buat File Environment
Salin file .env.example menjadi .env.
```bash
cp .env.example .env
```
```bash
Isi variabel berikut sesuai database Supabase masing-masing:
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?pgbouncer=true&statement_cache_size=0"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
SESSION_SECRET="isi_dengan_secret_random"
NODE_ENV="development"
TZ="Asia/Jakarta"
```
Catatan:
- DATABASE_URL digunakan oleh aplikasi.
- DIRECT_URL digunakan oleh Prisma migration.
- Pada Supabase pooler, gunakan parameter pgbouncer=true&statement_cache_size=0.
- TZ=Asia/Jakarta penting agar periode pengisian mengikuti WIB.

## 4. Generate Prisma Client
``` bash
npm run prisma:migrate
```
## 5. Jalankan Migration
```bash
npm run prisma:migrate
```
Atau untuk production:
```bash
npm run prisma:deploy
```
## 6. Jalankan Seed Data
```bash
npm run seed
```
## 7. Jalankan Aplikasi
Mode development:
```bash
npm run dev
```
Mode production:
```bash
npm start

Aplikasi berjalan pada: http://localhost:3000
```
## Akun Default Setelah Seed
1. Waka Sarpras
- Username: widiawati
- Password: sipras2026
2. PJ Ruangan
- Username: sesuai data seed
- Password: sipras2026
**Disarankan mengganti password setelah login pertama.**

## Script NPM
| Script                    | Fungsi                              |
| ------------------------- | ----------------------------------- |
| `npm start`               | Menjalankan aplikasi production     |
| `npm run dev`             | Menjalankan aplikasi dengan nodemon |
| `npm run prisma:generate` | Generate Prisma Client              |
| `npm run prisma:migrate`  | Menjalankan migration development   |
| `npm run prisma:deploy`   | Menjalankan migration production    |
| `npm run prisma:studio`   | Membuka Prisma Studio               |
| `npm run seed`            | Mengisi data awal                   |


## Alur Penggunaan Singkat
1. Waka Sarpras
- Login sebagai Waka Sarpras.
- Tambahkan akun PJ jika diperlukan.
- Tambahkan data ruangan.
- Tetapkan PJ pada ruangan.
- Atur periode pengisian.
- Pantau dashboard kepatuhan PJ.
- Tindak lanjuti barang rusak.
- Cetak laporan PDF.
2. PJ Ruangan
- Login sebagai PJ.
- Masuk ke menu barang.
- Input barang sesuai ruangan yang ditanggung.
**Pilih kondisi barang:**
    - Baik
    - Rusak Ringan
    - Rusak Berat
- Simpan data.
- Laporkan barang rusak jika diperlukan.


## Aturan Periode Pengisian
Sistem menerapkan periode pengisian agar pendataan inventaris berjalan disiplin.
- PJ hanya dapat input/edit barang saat periode aktif.
- Jika periode sudah berakhir, form input/edit barang dikunci.
- Waka Sarpras dapat membuka unlock khusus untuk ruangan tertentu.
- Unlock khusus hanya membuka akses input, tidak mengubah fakta bahwa pengisian dilakukan di luar periode reguler.
- Dashboard Waka tetap dapat menampilkan status PJ yang belum mengisi sesuai aturan periode.

## Pengujian Manual
Pengujian dasar yang disarankan sebelum demo:
1. Login sebagai Waka Sarpras.
2. Login sebagai PJ Ruangan.
3. Tambah barang dengan kondisi Baik.
4. Tambah barang dengan kondisi Rusak Ringan.
5. Tambah barang dengan kondisi Rusak Berat.
6. Pastikan dashboard Waka menampilkan perubahan total barang.
7. Pastikan barang rusak muncul pada menu Barang Rusak.
8. Tandai barang rusak sebagai sudah diperbaiki.
9. Cetak laporan PDF.
10. Uji kondisi di luar periode pengisian.
11. Uji unlock khusus untuk salah satu ruangan.


## Black Box Testing
Contoh skenario pengujian:
| No | Skenario                                | Hasil yang Diharapkan                        | Status |
| -- | --------------------------------------- | -------------------------------------------- | ------ |
| 1  | Login Waka dengan akun valid            | Masuk ke dashboard Waka                      | Lulus  |
| 2  | Login PJ dengan akun valid              | Masuk ke dashboard PJ                        | Lulus  |
| 3  | Login dengan password salah             | Sistem menolak login                         | Lulus  |
| 4  | Waka mengakses menu input barang        | Akses ditolak / menu tidak tersedia          | Lulus  |
| 5  | PJ menambah barang kondisi Baik         | Data tersimpan                               | Lulus  |
| 6  | PJ menambah barang kondisi Rusak Ringan | Data tersimpan dan masuk daftar barang rusak | Lulus  |
| 7  | PJ menambah barang kondisi Rusak Berat  | Data tersimpan dan masuk daftar barang rusak | Lulus  |
| 8  | Waka menandai barang sudah diperbaiki   | Status barang berubah menjadi Baik           | Lulus  |
| 9  | PJ input di luar periode                | Form terkunci                                | Lulus  |
| 10 | Waka memberi unlock khusus              | PJ tertentu dapat input sementara            | Lulus  |
| 11 | Waka mencetak laporan PDF               | File PDF berhasil dibuat                     | Lulus  |


## Deployment Railway
Pastikan environment variable berikut sudah diatur di Railway:
```bash
DATABASE_URL="..."
DIRECT_URL="..."
SESSION_SECRET="..."
NODE_ENV="production"
TZ="Asia/Jakarta"

Perintah start Railway:
npm start

Build/deploy akan menjalankan:
npm install
npm run prisma:generate
npm start
```

## Catatan Keamanan
File berikut tidak boleh dikirim atau diunggah ke repository publik:
```bash
.env
node_modules/
.git/ dalam ZIP pengumpulan
```
**Gunakan .env.example untuk contoh konfigurasi tanpa membocorkan credential asli.**

## Status Fitur

| Fitur                                        | Status  |
| -------------------------------------------- | ------- |
| Login dan logout                             | Selesai |
| Role Waka dan PJ                             | Selesai |
| CRUD akun PJ                                 | Selesai |
| CRUD ruangan                                 | Selesai |
| Penetapan PJ ruangan                         | Selesai |
| CRUD barang                                  | Selesai |
| Kondisi barang Baik/Rusak Ringan/Rusak Berat | Selesai |
| Barang rusak dan log perbaikan               | Selesai |
| Periode pengisian                            | Selesai |
| Unlock khusus                                | Selesai |
| Dashboard kepatuhan PJ                       | Selesai |
| Laporan PDF                                  | Selesai |
| Deployment Railway                           | Selesai |

## Lisensi
**Proyek ini dibuat untuk keperluan akademik Capstone Project Universitas Terbuka.**



