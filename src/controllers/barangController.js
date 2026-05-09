// =====================================================
// SIPRAS-NT — Barang Controller
// Use Case:
//   UC8  Input Barang             (PJ)
//   UC9  Edit Barang              (PJ)
//   UC10 Lapor Kondisi Barang     (PJ)
//   UC11 Lihat Barang Ruangan     (PJ)
//   UC12 Lihat Semua Barang       (Waka)
// =====================================================
const prisma = require('../config/database');

// GET /barang
// Waka: semua barang. PJ: hanya barang ruangan yang dipegang.
exports.daftarBarang = async (req, res) => {
  res.render('barang/index', { title: 'Daftar Barang' });
};

// GET /barang/baru (PJ)
exports.formTambah = (req, res) => {
  res.render('barang/form', { title: 'Input Barang', mode: 'create' });
};

// POST /barang (PJ)
// Audit: dibuat_oleh = req.userLogin.id
exports.simpanBarang = async (req, res) => {
  res.redirect('/barang');
};

// GET /barang/:id (detail)
exports.detailBarang = async (req, res) => {
  res.render('barang/detail', { title: 'Detail Barang' });
};

// GET /barang/:id/edit (PJ ruangan tsb saja)
exports.formEdit = async (req, res) => {
  res.render('barang/form', { title: 'Edit Barang', mode: 'edit' });
};

// PUT /barang/:id (PJ)
// Audit: diperbarui_oleh = req.userLogin.id
exports.perbaruiBarang = async (req, res) => {
  res.redirect('/barang');
};

// POST /barang/:id/lapor-rusak (PJ)
// Aksi: kondisi -> 'rusak', buat LogPerbaikan baru (tanggal_lapor = now)
exports.laporRusak = async (req, res) => {
  res.redirect('/barang');
};

// POST /barang/:id/nonaktifkan (PJ untuk barang ruangannya)
exports.nonaktifkan = async (req, res) => {
  res.redirect('/barang');
};
