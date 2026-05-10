// =====================================================
// SIPRAS-NT — Dashboard Controller
// Use Case: UC15 Lihat Dashboard
// =====================================================
const prisma = require('../config/database');

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

      return res.render('dashboard/index', {
        title: 'Dashboard',
        statistik: { totalRuangan, totalBarang, totalRusak, totalPjAktif },
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