// =====================================================
// SIPRAS-NT — Laporan Controller (Khusus Waka Sarpras)
// Use Case:
//   UC16 Cetak Laporan Per Ruangan
//   UC17 Cetak Laporan Rekap
// =====================================================
const prisma = require('../config/database');
const { buatLaporanPerRuangan, buatLaporanRekap } = require('../utils/pdfGenerator');

// GET /laporan
exports.indexLaporan = async (req, res) => {
  res.render('laporan/index', { title: 'Cetak Laporan' });
};

// GET /laporan/per-ruangan/:ruanganId
exports.laporanPerRuangan = async (req, res, next) => {
  try {
    // TODO: ambil data ruangan + barang
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="laporan-ruangan.pdf"');
    buatLaporanPerRuangan(res, { ruangan: null, barang: [] });
  } catch (err) {
    next(err);
  }
};

// GET /laporan/rekap
exports.laporanRekap = async (req, res, next) => {
  try {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="laporan-rekap.pdf"');
    buatLaporanRekap(res, { ruangan: [], totalBarang: 0, totalRusak: 0 });
  } catch (err) {
    next(err);
  }
};
