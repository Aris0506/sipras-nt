// =====================================================
// SIPRAS-NT — Dashboard Controller
// Use Case: UC15 Lihat Dashboard
// =====================================================
const prisma = require('../config/database');
const { statusKepatuhanPj, hitungPeriodeBulanIni } = require('../utils/periodeChecker');

// ---------- GET /dashboard ----------
exports.tampilDashboard = async (req, res, next) => {
  try {
    const user = req.userLogin;

    if (user.role === 'waka_sarpras') {
      // Statistik untuk Waka Sarpras
      const [totalRuangan, totalBarang, totalRusak, totalPjAktif] = await Promise.all([
        prisma.ruangan.count({ where: { aktif: true } }),
        prisma.barang.count({ where: { aktif: true } }),
        prisma.barang.count({ where: { aktif: true, kondisi: 'rusak' } }),
        prisma.pengguna.count({ where: { aktif: true, role: 'pj' } }),
      ]);


      // Hitung periode SEKALI di awal (bukan tiap iterasi)
      const periode = await hitungPeriodeBulanIni();
      const sekarang = new Date();

      // Ambil semua ruangan + cek aktivitas barang dalam periode (1 query saja)
      const ruanganDenganAktivitas = await prisma.ruangan.findMany({
        where: { aktif: true, pjId: { not: null } },
        select: {
          id: true,
          barang: {
            where: {
              OR: [
                { createdAt: { gte: periode.tanggalMulai, lte: periode.tanggalSelesai } },
                { updatedAt: { gte: periode.tanggalMulai, lte: periode.tanggalSelesai } },
              ],
            },
            select: { id: true },
            take: 1,
          },
        },
      });

      // Hitung "PJ Belum Mengisi" dari hasil query di atas
      let totalBelumMengisi = 0;
      for (const r of ruanganDenganAktivitas) {
        const adaAktivitas = r.barang.length > 0;
        if (adaAktivitas) continue; // patuh, skip

        // Belum ada aktivitas — kalau periode udah mulai, dia belum mengisi
        if (sekarang >= periode.tanggalMulai) {
          totalBelumMengisi++;
        }
      }



      return res.render('dashboard/index', {
        title: 'Dashboard',
        statistik: { totalRuangan, totalBarang, totalRusak, totalPjAktif, totalBelumMengisi },
        periode,
      });
    }

    // PJ Ruangan: lihat ruangan yang dipegang + ringkasan barang
    const ruanganDipegang = await prisma.ruangan.findMany({
      where: { aktif: true, pjId: user.id },
      include: {
        _count: {
          select: { barang: { where: { aktif: true } } },
        },
      },
      orderBy: { namaRuangan: 'asc' },
    });

    // Hitung barang rusak di ruangan PJ
    const barangRusakPJ = await prisma.barang.count({
      where: {
        aktif: true,
        kondisi: 'rusak',
        ruangan: { pjId: user.id, aktif: true },
      },
    });

    res.render('dashboard/index', {
      title: 'Dashboard',
      ruanganDipegang,
      barangRusakPJ,
    });
  } catch (err) {
    next(err);
  }
};