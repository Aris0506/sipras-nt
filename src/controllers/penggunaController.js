// =====================================================
// SIPRAS-NT — Pengguna Controller (Khusus Waka Sarpras)
// Use Case: UC4 Kelola Akun PJ, UC5 Nonaktifkan Akun PJ,
//           UC3 Reset Password PJ
// =====================================================
const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

// GET /pengguna
exports.daftarPengguna = async (req, res) => {
  // TODO: list semua PJ
  res.render('pengguna/index', { title: 'Kelola Akun PJ' });
};

// GET /pengguna/baru
exports.formTambah = (req, res) => {
  res.render('pengguna/form', { title: 'Tambah PJ', mode: 'create' });
};

// POST /pengguna
exports.simpanPengguna = async (req, res) => {
  // TODO
  res.redirect('/pengguna');
};

// GET /pengguna/:id/edit
exports.formEdit = async (req, res) => {
  // TODO
  res.render('pengguna/form', { title: 'Edit PJ', mode: 'edit' });
};

// PUT /pengguna/:id
exports.perbaruiPengguna = async (req, res) => {
  // TODO
  res.redirect('/pengguna');
};

// POST /pengguna/:id/nonaktifkan (soft-delete via aktif=false)
exports.nonaktifkan = async (req, res) => {
  // TODO
  res.redirect('/pengguna');
};

// POST /pengguna/:id/reset-password
exports.resetPassword = async (req, res) => {
  // TODO
  res.redirect('/pengguna');
};
