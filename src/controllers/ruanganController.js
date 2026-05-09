// =====================================================
// SIPRAS-NT — Ruangan Controller (Khusus Waka Sarpras)
// Use Case: UC6 Kelola Data Ruangan, UC7 Tetapkan PJ Ruangan
// =====================================================
const prisma = require('../config/database');

// GET /ruangan
exports.daftarRuangan = async (req, res) => {
  res.render('ruangan/index', { title: 'Kelola Ruangan' });
};

// GET /ruangan/baru
exports.formTambah = (req, res) => {
  res.render('ruangan/form', { title: 'Tambah Ruangan', mode: 'create' });
};

// POST /ruangan
exports.simpanRuangan = async (req, res) => {
  res.redirect('/ruangan');
};

// GET /ruangan/:id/edit
exports.formEdit = async (req, res) => {
  res.render('ruangan/form', { title: 'Edit Ruangan', mode: 'edit' });
};

// PUT /ruangan/:id
exports.perbaruiRuangan = async (req, res) => {
  res.redirect('/ruangan');
};

// POST /ruangan/:id/tetapkan-pj
exports.tetapkanPJ = async (req, res) => {
  res.redirect('/ruangan');
};

// POST /ruangan/:id/nonaktifkan
exports.nonaktifkan = async (req, res) => {
  res.redirect('/ruangan');
};
