// =====================================================
// SIPRAS-NT — Middleware Periode Aktif
// Tugas: Cek apakah PJ boleh input/edit barang sekarang
//        (berdasarkan periode pengisian + unlock khusus)
// =====================================================
const { bolehInputBarang } = require('../utils/periodeChecker');

/**
 * Middleware: cek periode untuk PJ
 * - Waka: selalu lolos (Waka bebas input kapan aja)
 * - PJ: cek periode + unlock khusus per ruangan
 */
exports.cekPeriodeAktif = async (req, res, next) => {
  try {
    // Waka selalu lolos
    if (req.userLogin.role === 'waka_sarpras') {
      return next();
    }

    // PJ: ambil ruanganId
    // Bisa dari body (form submit), params (URL), atau query
    const ruanganId =
      req.body.ruanganId ||
      req.params.ruanganId ||
      req.query.ruanganId;

    // Kalau gak ada ruanganId, kita ambil dari ruangan yang PJ pegang
    // (karena 1 PJ bisa pegang beberapa ruangan)
    let idsRuanganPj = [];
    if (!ruanganId) {
      const prisma = require('../config/database');
      const ruangans = await prisma.ruangan.findMany({
        where: { pjId: req.userLogin.id, aktif: true },
        select: { id: true },
      });
      idsRuanganPj = ruangans.map((r) => r.id);
    }

    // Kalau dari form ada ruanganId spesifik, cek itu doang
    const idsToCheck = ruanganId ? [ruanganId] : idsRuanganPj;

    if (idsToCheck.length === 0) {
      req.flash('error', 'Anda tidak memegang ruangan manapun.');
      return res.redirect('/dashboard');
    }

    // Cek setiap ruangan
    for (const id of idsToCheck) {
      const hasil = await bolehInputBarang(id);
      if (!hasil.boleh) {
        req.flash(
          'error',
          'Periode pengisian sudah berakhir. Hubungi Waka Sarpras jika ada kebutuhan mendesak.'
        );
        return res.redirect('/barang');
      }
    }

    // Semua lolos, lanjut
    next();
  } catch (err) {
    next(err);
  }
};