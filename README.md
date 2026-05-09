# SIPRAS-NT

**Sistem Informasi Inventaris Sarana dan Prasarana Berbasis Web**
SMKS Nahdlatuth Thalabah

Tim: Aris Sinopa · Melinda Elsa Kessek · Rahma Ardhana Sukma · Safira Afifatul Mu'arrofah

---

## Stack

- **Runtime**: Node.js (≥18)
- **Framework**: Express.js
- **Template**: EJS + express-ejs-layouts
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Auth**: bcryptjs + express-session
- **Session Store**: connect-pg-simple
- **PDF**: PDFKit
- **Frontend**: Bootstrap 5 (CDN) + Bootstrap Icons
- **Hosting**: Railway

## Setup Lokal

```bash
# 1. Install dependency
npm install

# 2. Salin env template & isi DATABASE_URL dari Supabase
cp .env.example .env
# edit .env

# 3. Jalankan migration ke database Supabase
npx prisma migrate dev --name init

# 4. Seed akun Waka Sarpras awal
npm run seed

# 5. Run dev server
npm run dev
```

Default login Waka Sarpras setelah seeding:
- Username: `waka.sarpras`
- Password: `sipras2026` (wajib ganti setelah login pertama)

## Struktur

```
sipras-nt/
├── prisma/                  Prisma schema + seed
├── src/
│   ├── config/              Database & session config
│   ├── middleware/          Auth, RBAC, error handler
│   ├── controllers/         Logic per fitur
│   ├── routes/              Routing per fitur
│   ├── views/               EJS templates
│   ├── utils/               PDF generator, validator
│   └── app.js               Express setup
├── public/                  Static assets
├── server.js                Entry point
└── .env.example             Env template
```

## Peran & Akses

| Fitur                          | Waka Sarpras | PJ Ruangan |
|--------------------------------|:---:|:---:|
| Login / Logout                 | ✓ | ✓ |
| Kelola Akun PJ                 | ✓ | — |
| Kelola Ruangan & Tetapkan PJ   | ✓ | — |
| Input & Edit Barang            | — | ✓ (ruangan sendiri) |
| Lapor Barang Rusak             | — | ✓ |
| Tandai Sudah Diperbaiki        | ✓ | — |
| Cetak Laporan PDF              | ✓ | — |

## Status Iterasi

- [x] Setup struktur folder + boilerplate
- [x] Prisma schema sesuai ERD
- [x] Routing & controller skeleton
- [x] Layout + sidebar + navbar
- [ ] Implementasi controller auth
- [ ] Implementasi CRUD pengguna
- [ ] Implementasi CRUD ruangan
- [ ] Implementasi CRUD barang
- [ ] Implementasi alur barang rusak
- [ ] Implementasi laporan PDF
- [ ] Deploy ke Railway
- [ ] Uji coba pengguna (Google Form)
