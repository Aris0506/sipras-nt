// =====================================================
// SIPRAS-NT — LogPerbaikan Controller (Khusus Waka Sarpras)
// Use Case:
//   UC13 Lihat Daftar Barang Rusak
//   UC14 Tandai Sudah Diperbaiki
// =====================================================
const prisma = require('../config/database');

// ---------- GET /log-perbaikan ----------
exports.daftarBarangRusak = async (req, res, next) => {
  try {
    const { q, ruangan } = req.query;

    const where = { tanggalSelesai: null };

    if (q) {
      where.barang = {
        OR: [
          { namaBarang: { contains: String(q), mode: 'insensitive' } },
          { kodeBarang: { contains: String(q), mode: 'insensitive' } },
        ],
      };
    }

    if (ruangan) {
      where.barang = where.barang || {};
      where.barang.ruanganId = String(ruangan);
    }

    const daftarLog = await prisma.logPerbaikan.findMany({
      where,
      include: {
        barang: {
          include: {
            ruangan: { select: { id: true, namaRuangan: true, kodeRuangan: true, pj: { select: { nama: true } } } },
          },
        },
      },
      orderBy: { tanggalLapor: 'desc' },
    });

    const daftarRuanganFilter = await prisma.ruangan.findMany({
      where: { aktif: true },
      select: { id: true, namaRuangan: true, kodeRuangan: true },
      orderBy: { namaRuangan: 'asc' },
    });

    res.render('log-perbaikan/index', {
      title: 'Barang Rusak',
      daftarLog,
      daftarRuanganFilter,
      filter: { q: q || '', ruangan: ruangan || '' },
    });
  } catch (err) {
    next(err);
  }
};

// ---------- POST /log-perbaikan/:logId/tandai-selesai ----------
exports.tandaiSelesai = async (req, res, next) => {
  try {
    const log = await prisma.logPerbaikan.findUnique({
      where: { id: req.params.logId },
      include: { barang: true },
    });

    if (!log) {
      req.flash('error', 'Log perbaikan tidak ditemukan.');
      return res.redirect('/log-perbaikan');
    }

    if (log.tanggalSelesai) {
      req.flash('info', 'Log perbaikan sudah selesai sebelumnya.');
      return res.redirect('/log-perbaikan');
    }

    const catatan = String(req.body.catatan || '').trim() || null;

    await prisma.$transaction([
      prisma.logPerbaikan.update({
        where: { id: log.id },
        data: {
          tanggalSelesai: new Date(),
          ditanganiOleh: req.userLogin.id,
          catatan: catatan || log.catatan,
        },
      }),
      prisma.barang.update({
        where: { id: log.barangId },
        data: {
          kondisi: 'baik',
          diperbaruiOleh: req.userLogin.id,
        },
      }),
    ]);

    req.flash(
      'sukses',
      `Barang "${log.barang.namaBarang}" berhasil ditandai sebagai sudah diperbaiki.`
    );
    res.redirect('/log-perbaikan');
  } catch (err) {
    next(err);
  }
};

// ---------- GET /log-perbaikan/riwayat ----------
exports.riwayat = async (req, res, next) => {
  try {
    const { q, ruangan, dariTanggal, sampaiTanggal } = req.query;

    const where = { tanggalSelesai: { not: null } };

    if (q) {
      where.barang = {
        OR: [
          { namaBarang: { contains: String(q), mode: 'insensitive' } },
          { kodeBarang: { contains: String(q), mode: 'insensitive' } },
        ],
      };
    }

    if (ruangan) {
      where.barang = where.barang || {};
      where.barang.ruanganId = String(ruangan);
    }

    if (dariTanggal || sampaiTanggal) {
      where.tanggalSelesai = {
        not: null,
        ...(dariTanggal && { gte: new Date(dariTanggal) }),
        ...(sampaiTanggal && (() => {
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

    const daftarRuanganFilter = await prisma.ruangan.findMany({
      where: { aktif: true },
      select: { id: true, namaRuangan: true, kodeRuangan: true },
      orderBy: { namaRuangan: 'asc' },
    });

    res.render('log-perbaikan/riwayat', {
      title: 'Riwayat Perbaikan',
      daftarLog,
      daftarRuanganFilter,
      filter: {
        q: q || '',
        ruangan: ruangan || '',
        dariTanggal: dariTanggal || '',
        sampaiTanggal: sampaiTanggal || '',
      },
    });
  } catch (err) {
    next(err);
  }
};