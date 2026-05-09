// =====================================================
// SIPRAS-NT — LogPerbaikan Controller (Khusus Waka Sarpras)
// Use Case:
//   UC13 Lihat Daftar Barang Rusak
//   UC14 Tandai Sudah Diperbaiki
// =====================================================
const prisma = require('../config/database');

// GET /log-perbaikan
// Daftar barang dengan kondisi='rusak' + log terbuka (tanggal_selesai null)
exports.daftarBarangRusak = async (req, res) => {
  res.render('log-perbaikan/index', { title: 'Daftar Barang Rusak' });
};

// POST /log-perbaikan/:logId/tandai-selesai
// Aksi: kondisi barang -> 'baik', isi tanggal_selesai + ditangani_oleh + catatan
exports.tandaiSelesai = async (req, res) => {
  res.redirect('/log-perbaikan');
};

// GET /log-perbaikan/riwayat
exports.riwayat = async (req, res) => {
  res.render('log-perbaikan/riwayat', { title: 'Riwayat Perbaikan' });
};
