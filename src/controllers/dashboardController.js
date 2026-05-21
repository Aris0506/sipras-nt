// =====================================================
// SIPRAS-NT — Dashboard Controller
// Use Case: UC15 Lihat Dashboard
// =====================================================
const prisma = require('../config/database');
const { hitungPeriodeBulanIni } = require('../utils/periodeChecker');

// ---------- GET /dashboard ----------
exports.tampilDashboard = async (req, res, next) => {
  try {
    const user = req.userLogin;

    if (user.role === 'waka_sarpras') {
      // Statistik untuk Waka Sarpras
      const [totalRuangan, totalBarang, totalRusak, totalPjAktif] = await Promise.all([
        prisma.ruangan.count({ where: { aktif: true } }),
        prisma.barang.count({ where: { aktif: true } }),
        prisma.barang.count({
          where: {
            aktif: true,
            kondisi: { in: ['rusak_ringan', 'rusak_berat'] },
          },
        }),
        prisma.pengguna.count({ where: { aktif: true, role: 'pj' } }),
      ]);

      // Hitung periode sekali di awal
      const periode = await hitungPeriodeBulanIni();
      const sekarang = new Date();

      // Ambil semua ruangan yang punya PJ + cek aktivitas barang dalam periode
      const ruanganDenganAktivitas = await prisma.ruangan.findMany({
        where: {
          aktif: true,
          pjId: { not: null },
        },
        select: {
          id: true,
          namaRuangan: true,
          kodeRuangan: true,
          pj: {
            select: {
              nama: true,
              username: true,
            },
          },
          barang: {
            where: {
              OR: [
                {
                  createdAt: {
                    gte: periode.tanggalMulai,
                    lte: periode.tanggalSelesai,
                  },
                },
                {
                  updatedAt: {
                    gte: periode.tanggalMulai,
                    lte: periode.tanggalSelesai,
                  },
                },
              ],
            },
            select: { id: true },
            take: 1,
          },
        },
        orderBy: {
          namaRuangan: 'asc',
        },
      });

      // Hitung PJ/ruangan yang belum mengisi
      let totalBelumMengisi = 0;
      const daftarBelumMengisi = [];

      for (const r of ruanganDenganAktivitas) {
        const adaAktivitas = r.barang.length > 0;

        if (adaAktivitas) {
          continue;
        }

        // Kalau periode sudah mulai dan belum ada aktivitas, berarti belum mengisi
        if (sekarang >= periode.tanggalMulai) {
          totalBelumMengisi++;

          daftarBelumMengisi.push({
            id: r.id,
            namaRuangan: r.namaRuangan,
            kodeRuangan: r.kodeRuangan,
            namaPj: r.pj?.nama || '-',
            usernamePj: r.pj?.username || '-',
          });
        }
      }

      return res.render('dashboard/index', {
        title: 'Dashboard',
        statistik: {
          totalRuangan,
          totalBarang,
          totalRusak,
          totalPjAktif,
          totalBelumMengisi,
        },
        periode,
        daftarBelumMengisi,
      });
    }

    // PJ Ruangan: lihat ruangan yang dipegang + ringkasan barang
    const ruanganDipegang = await prisma.ruangan.findMany({
      where: {
        aktif: true,
        pjId: user.id,
      },
      include: {
        _count: {
          select: {
            barang: {
              where: { aktif: true },
            },
          },
        },
      },
      orderBy: {
        namaRuangan: 'asc',
      },
    });

    // Hitung barang rusak di ruangan PJ
    const barangRusakPJ = await prisma.barang.count({
      where: {
        aktif: true,
        kondisi: { in: ['rusak_ringan', 'rusak_berat'] },
        ruangan: {
          pjId: user.id,
          aktif: true,
        },
      },
    });

    return res.render('dashboard/index', {
      title: 'Dashboard',
      ruanganDipegang,
      barangRusakPJ,
    });
  } catch (err) {
    next(err);
  }
};