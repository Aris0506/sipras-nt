// =====================================================
// SIPRAS-NT — Laporan Controller (Khusus Waka Sarpras)
// Use Case:
//   UC16 Cetak Laporan Per Ruangan
//   UC17 Cetak Laporan Rekap
// =====================================================
const prisma = require('../config/database');
const {
  buatLaporanPerRuangan,
  buatLaporanRekap,
  buatLaporanRiwayatPerbaikan,
} = require('../utils/pdfGenerator');

// ---------- GET /laporan ----------
exports.indexLaporan = async (req, res, next) => {
  try {
    // Ambil daftar ruangan untuk pilihan laporan per ruangan
    const daftarRuangan = await prisma.ruangan.findMany({
      where: { aktif: true },
      select: {
        id: true,
        namaRuangan: true,
        kodeRuangan: true,
        pj: { select: { nama: true } },
        _count: { select: { barang: { where: { aktif: true } } } },
      },
      orderBy: { namaRuangan: 'asc' },
    });

    res.render('laporan/index', {
      title: 'Cetak Laporan',
      daftarRuangan,
    });
  } catch (err) {
    next(err);
  }
};

// ---------- GET /laporan/per-ruangan/:ruanganId ----------
exports.laporanPerRuangan = async (req, res, next) => {
  try {
    const ruangan = await prisma.ruangan.findUnique({
      where: { id: req.params.ruanganId },
      include: {
        pj: { select: { nama: true } },
      },
    });

    if (!ruangan) {
      req.flash('error', 'Ruangan tidak ditemukan.');
      return res.redirect('/laporan');
    }

    const daftarBarang = await prisma.barang.findMany({
      where: { ruanganId: ruangan.id, aktif: true },
      orderBy: [{ kategori: 'asc' }, { kodeBarang: 'asc' }],
    });

    const filename = `laporan-ruangan-${ruangan.kodeRuangan}-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    buatLaporanPerRuangan(res, {
      ruangan,
      daftarBarang,
      namaWaka: req.userLogin.nama,
    });
  } catch (err) {
    next(err);
  }
};

// ---------- GET /laporan/rekap ----------
exports.laporanRekap = async (req, res, next) => {
  try {
    // Ambil rekap per ruangan
    const semuaRuangan = await prisma.ruangan.findMany({
      where: { aktif: true },
      include: {
        pj: { select: { nama: true } },
        barang: {
          where: { aktif: true },
          select: { kondisi: true },
        },
      },
      orderBy: { namaRuangan: 'asc' },
    });

    const rekapPerRuangan = semuaRuangan.map((r) => ({
      kodeRuangan: r.kodeRuangan,
      namaRuangan: r.namaRuangan,
      pj: r.pj,
      jumlahBarang: r.barang.length,
      // jumlahRusak: r.barang.filter((b) => b.kondisi === 'rusak').length,
      jumlahRusak: r.barang.filter((b) => ['rusak_ringan', 'rusak_berat'].includes(b.kondisi)).length,
    }));

    const totalBarang = rekapPerRuangan.reduce((sum, r) => sum + r.jumlahBarang, 0);
    const totalRusak = rekapPerRuangan.reduce((sum, r) => sum + r.jumlahRusak, 0);

    const filename = `laporan-rekap-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    buatLaporanRekap(res, {
      rekapPerRuangan,
      totalRuangan: rekapPerRuangan.length,
      totalBarang,
      totalRusak,
      namaWaka: req.userLogin.nama,
    });
  } catch (err) {
    next(err);
  }
};

// ---------- GET /laporan/riwayat-perbaikan ----------
exports.laporanRiwayatPerbaikan = async (req, res, next) => {
  try {
    const { dariTanggal, sampaiTanggal } = req.query;

    const where = { tanggalSelesai: { not: null } };

    if (dariTanggal || sampaiTanggal) {
      where.tanggalSelesai = {
        not: null,
        ...(dariTanggal && { gte: new Date(dariTanggal) }),
        ...(sampaiTanggal &&
          (() => {
            const akhirHari = new Date(sampaiTanggal);
            akhirHari.setHours(23, 59, 59, 999);
            return { lte: akhirHari };
          })()),
      };
    }

    const daftarLog = await prisma.logPerbaikan.findMany({
      where,
      include: {
        barang: {
          include: {
            ruangan: { select: { namaRuangan: true, kodeRuangan: true } },
          },
        },
        penindak: { select: { nama: true } },
      },
      orderBy: { tanggalSelesai: 'desc' },
    });

    let periode = 'Semua Periode';
    if (dariTanggal && sampaiTanggal) {
      const fmt = (s) =>
        new Date(s).toLocaleDateString('id-ID', {
          day: 'numeric', month: 'long', year: 'numeric',
        });
      periode = `${fmt(dariTanggal)} s/d ${fmt(sampaiTanggal)}`;
    } else if (dariTanggal) {
      periode = `Sejak ${new Date(dariTanggal).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
      })}`;
    } else if (sampaiTanggal) {
      periode = `Hingga ${new Date(sampaiTanggal).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
      })}`;
    }

    const filename = `laporan-riwayat-perbaikan-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    buatLaporanRiwayatPerbaikan(res, {
      daftarLog,
      namaWaka: req.userLogin.nama,
      periode,
    });
  } catch (err) {
    next(err);
  }
};