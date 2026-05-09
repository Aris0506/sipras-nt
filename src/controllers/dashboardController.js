// =====================================================
// SIPRAS-NT — Dashboard Controller
// Use Case: UC15 Lihat Dashboard
// =====================================================
const prisma = require('../config/database');

// GET /dashboard
exports.tampilDashboard = async (req, res) => {
  // TODO: cabang berdasarkan role
  // - waka_sarpras: total ruangan, total barang, jumlah barang rusak, dll
  // - pj: ruangan yang dipegang, daftar barang ruangan tsb
  res.render('dashboard/index', { title: 'Dashboard' });
};
