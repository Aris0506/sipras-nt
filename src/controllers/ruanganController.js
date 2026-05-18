// =====================================================
// SIPRAS-NT — Ruangan Controller (Khusus Waka Sarpras)
// Use Case: UC6 Kelola Data Ruangan, UC7 Tetapkan PJ Ruangan
// =====================================================
const prisma = require('../config/database');
const { wajibAda, panjangMinMax } = require('../utils/validator');

// ---------- GET /ruangan ----------
exports.daftarRuangan = async (req, res, next) => {
  try {
    const { q, status } = req.query;

    const where = {};
    if (q) {
      where.OR = [
        { namaRuangan: { contains: String(q), mode: 'insensitive' } },
        { kodeRuangan: { contains: String(q), mode: 'insensitive' } },
      ];
    }
    if (status === 'aktif') where.aktif = true;
    if (status === 'nonaktif') where.aktif = false;

    const sekarang = new Date();
    const daftarRuangan = await prisma.ruangan.findMany({
      where,
      select: {
        id: true,
        namaRuangan: true,
        kodeRuangan: true,
        aktif: true,
        pj: { select: { id: true, nama: true, aktif: true } },
        _count: {
          select: { barang: { where: { aktif: true } } },
        },
        unlocks: {
          where: { berlakuSampai: { gte: sekarang } },
          select: { berlakuSampai: true, alasan: true },
          take: 1,
        },
      },
      orderBy: [{ aktif: 'desc' }, { namaRuangan: 'asc' }],
    });

    res.render('ruangan/index', {
      title: 'Ruangan',
      daftarRuangan,
      filter: { q: q || '', status: status || '' },
    });
  } catch (err) {
    next(err);
  }
};

// Ambil daftar PJ aktif untuk dropdown — dipakai di form
async function ambilDaftarPjAktif() {
  return prisma.pengguna.findMany({
    where: { role: 'pj', aktif: true },
    select: { id: true, nama: true, username: true },
    orderBy: { nama: 'asc' },
  });
}

// ---------- GET /ruangan/baru ----------
exports.formTambah = async (req, res, next) => {
  try {
    const daftarPj = await ambilDaftarPjAktif();
    res.render('ruangan/form', {
      title: 'Tambah Ruangan',
      mode: 'create',
      data: { namaRuangan: '', kodeRuangan: '', pjId: '' },
      daftarPj,
    });
  } catch (err) {
    next(err);
  }
};

// ---------- POST /ruangan ----------
exports.simpanRuangan = async (req, res, next) => {
  try {
    const namaRuangan = String(req.body.namaRuangan || '').trim();
    const kodeRuangan = String(req.body.kodeRuangan || '').trim().toUpperCase();
    const pjId = req.body.pjId ? String(req.body.pjId) : null;

    const errors = [
      wajibAda(namaRuangan, 'Nama Ruangan'),
      panjangMinMax(namaRuangan, 2, 100, 'Nama Ruangan'),
      wajibAda(kodeRuangan, 'Kode Ruangan'),
      panjangMinMax(kodeRuangan, 2, 20, 'Kode Ruangan'),
    ].filter(Boolean);

    if (kodeRuangan && !/^[A-Z0-9-]+$/.test(kodeRuangan)) {
      errors.push('Kode Ruangan hanya boleh huruf kapital, angka, dan strip.');
    }

    if (errors.length) {
      const daftarPj = await ambilDaftarPjAktif();
      return res.render('ruangan/form', {
        title: 'Tambah Ruangan',
        mode: 'create',
        data: { namaRuangan, kodeRuangan, pjId: pjId || '' },
        daftarPj,
        errorsLokal: errors,
      });
    }

    // Cek duplikat kode
    const sudahAda = await prisma.ruangan.findUnique({ where: { kodeRuangan } });
    if (sudahAda) {
      const daftarPj = await ambilDaftarPjAktif();
      return res.render('ruangan/form', {
        title: 'Tambah Ruangan',
        mode: 'create',
        data: { namaRuangan, kodeRuangan, pjId: pjId || '' },
        daftarPj,
        errorsLokal: [`Kode Ruangan "${kodeRuangan}" sudah dipakai.`],
      });
    }

    // Validasi PJ kalau di-set
    if (pjId) {
      const pj = await prisma.pengguna.findFirst({
        where: { id: pjId, role: 'pj', aktif: true },
      });
      if (!pj) {
        req.flash('error', 'PJ yang dipilih tidak valid.');
        return res.redirect('/ruangan/baru');
      }
    }

    await prisma.ruangan.create({
      data: {
        namaRuangan,
        kodeRuangan,
        pjId,
        aktif: true,
        dibuatOleh: req.userLogin.id,
      },
    });

    req.flash('sukses', `Ruangan "${namaRuangan}" berhasil dibuat.`);
    res.redirect('/ruangan');
  } catch (err) {
    next(err);
  }
};

// ---------- GET /ruangan/:id/edit ----------
exports.formEdit = async (req, res, next) => {
  try {
    const ruangan = await prisma.ruangan.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        namaRuangan: true,
        kodeRuangan: true,
        pjId: true,
        aktif: true,
      },
    });
    if (!ruangan) {
      req.flash('error', 'Ruangan tidak ditemukan.');
      return res.redirect('/ruangan');
    }
    const daftarPj = await ambilDaftarPjAktif();
    res.render('ruangan/form', {
      title: 'Edit Ruangan',
      mode: 'edit',
      data: { ...ruangan, pjId: ruangan.pjId || '' },
      daftarPj,
    });
  } catch (err) {
    next(err);
  }
};

// ---------- PUT /ruangan/:id ----------
exports.perbaruiRuangan = async (req, res, next) => {
  try {
    const ruangan = await prisma.ruangan.findUnique({
      where: { id: req.params.id },
    });
    if (!ruangan) {
      req.flash('error', 'Ruangan tidak ditemukan.');
      return res.redirect('/ruangan');
    }

    const namaRuangan = String(req.body.namaRuangan || '').trim();
    const kodeRuangan = String(req.body.kodeRuangan || '').trim().toUpperCase();
    const pjId = req.body.pjId ? String(req.body.pjId) : null;

    const errors = [
      wajibAda(namaRuangan, 'Nama Ruangan'),
      panjangMinMax(namaRuangan, 2, 100, 'Nama Ruangan'),
      wajibAda(kodeRuangan, 'Kode Ruangan'),
      panjangMinMax(kodeRuangan, 2, 20, 'Kode Ruangan'),
    ].filter(Boolean);

    if (kodeRuangan && !/^[A-Z0-9-]+$/.test(kodeRuangan)) {
      errors.push('Kode Ruangan hanya boleh huruf kapital, angka, dan strip.');
    }

    if (errors.length) {
      errors.forEach((e) => req.flash('error', e));
      return res.redirect(`/ruangan/${ruangan.id}/edit`);
    }

    // Cek duplikat kode (selain dirinya sendiri)
    if (kodeRuangan !== ruangan.kodeRuangan) {
      const beneran = await prisma.ruangan.findUnique({ where: { kodeRuangan } });
      if (beneran && beneran.id !== ruangan.id) {
        req.flash('error', `Kode Ruangan "${kodeRuangan}" sudah dipakai ruangan lain.`);
        return res.redirect(`/ruangan/${ruangan.id}/edit`);
      }
    }

    // Validasi PJ kalau di-set
    if (pjId) {
      const pj = await prisma.pengguna.findFirst({
        where: { id: pjId, role: 'pj', aktif: true },
      });
      if (!pj) {
        req.flash('error', 'PJ yang dipilih tidak valid.');
        return res.redirect(`/ruangan/${ruangan.id}/edit`);
      }
    }

    await prisma.ruangan.update({
      where: { id: ruangan.id },
      data: {
        namaRuangan,
        kodeRuangan,
        pjId,
        diperbaruiOleh: req.userLogin.id,
      },
    });

    req.flash('sukses', `Ruangan "${namaRuangan}" berhasil diperbarui.`);
    res.redirect('/ruangan');
  } catch (err) {
    next(err);
  }
};

// ---------- POST /ruangan/:id/tetapkan-pj ----------
// Quick action dari index — tetapkan/ganti PJ tanpa buka form edit
exports.tetapkanPJ = async (req, res, next) => {
  try {
    const ruangan = await prisma.ruangan.findUnique({
      where: { id: req.params.id },
    });
    if (!ruangan) {
      req.flash('error', 'Ruangan tidak ditemukan.');
      return res.redirect('/ruangan');
    }

    const pjId = req.body.pjId ? String(req.body.pjId) : null;

    if (pjId) {
      const pj = await prisma.pengguna.findFirst({
        where: { id: pjId, role: 'pj', aktif: true },
      });
      if (!pj) {
        req.flash('error', 'PJ yang dipilih tidak valid.');
        return res.redirect('/ruangan');
      }
    }

    await prisma.ruangan.update({
      where: { id: ruangan.id },
      data: {
        pjId,
        diperbaruiOleh: req.userLogin.id,
      },
    });

    req.flash(
      'sukses',
      pjId
        ? `PJ untuk ruangan "${ruangan.namaRuangan}" berhasil diperbarui.`
        : `PJ untuk ruangan "${ruangan.namaRuangan}" dilepas.`
    );
    res.redirect('/ruangan');
  } catch (err) {
    next(err);
  }
};

// ---------- POST /ruangan/:id/nonaktifkan ----------
exports.nonaktifkan = async (req, res, next) => {
  try {
    const ruangan = await prisma.ruangan.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { barang: { where: { aktif: true } } } },
      },
    });
    if (!ruangan) {
      req.flash('error', 'Ruangan tidak ditemukan.');
      return res.redirect('/ruangan');
    }

    // Kalau mau nonaktifkan ruangan yang masih punya barang aktif → tolak
    if (ruangan.aktif && ruangan._count.barang > 0) {
      req.flash(
        'error',
        `Tidak bisa menonaktifkan ruangan "${ruangan.namaRuangan}" karena masih memiliki ${ruangan._count.barang} barang aktif. Pindahkan atau nonaktifkan barangnya terlebih dahulu.`
      );
      return res.redirect('/ruangan');
    }

    const statusBaru = !ruangan.aktif;
    await prisma.ruangan.update({
      where: { id: ruangan.id },
      data: {
        aktif: statusBaru,
        diperbaruiOleh: req.userLogin.id,
      },
    });

    req.flash(
      'sukses',
      `Ruangan "${ruangan.namaRuangan}" ${statusBaru ? 'diaktifkan kembali' : 'dinonaktifkan'}.`
    );
    res.redirect('/ruangan');
  } catch (err) {
    next(err);
  }
};


// ---------- POST /ruangan/:id/unlock ----------
// Quick action: Bu Widya buka akses ruangan tertentu di luar periode
exports.unlockRuangan = async (req, res, next) => {
  try {
    const ruangan = await prisma.ruangan.findUnique({
      where: { id: req.params.id },
    });
    if (!ruangan) {
      req.flash('error', 'Ruangan tidak ditemukan.');
      return res.redirect('/ruangan');
    }

    const alasan = String(req.body.alasan || '').trim();

    if (!alasan || alasan.length < 5) {
      req.flash('error', 'Alasan unlock wajib diisi (minimal 5 karakter).');
      return res.redirect('/ruangan');
    }

    // Default: berlaku sampai jam 23:59:59 hari ini (WIB)
    const sekarang = new Date();
    const tahun = sekarang.getFullYear();
    const bulan = String(sekarang.getMonth() + 1).padStart(2, '0');
    const tanggal = String(sekarang.getDate()).padStart(2, '0');
    const berlakuSampai = new Date(`${tahun}-${bulan}-${tanggal}T23:59:59+07:00`);

    await prisma.unlockKhusus.create({
      data: {
        ruanganId: ruangan.id,
        berlakuSampai,
        alasan,
        diberikanOleh: req.userLogin.id,
      },
    });

    req.flash(
      'sukses',
      `Ruangan "${ruangan.namaRuangan}" diberi akses khusus sampai pukul 23:59 hari ini.`
    );
    res.redirect('/ruangan');
  } catch (err) {
    next(err);
  }
};


// ---------- POST /ruangan/:id/cancel-unlock ----------
// Bu Widya batalkan unlock yang masih aktif (hapus row dari unlock_khusus)
exports.cancelUnlock = async (req, res, next) => {
  try {
    const ruangan = await prisma.ruangan.findUnique({
      where: { id: req.params.id },
    });
    if (!ruangan) {
      req.flash('error', 'Ruangan tidak ditemukan.');
      return res.redirect('/ruangan');
    }

    const sekarang = new Date();

    // Hapus semua unlock yang masih aktif untuk ruangan ini
    const dihapus = await prisma.unlockKhusus.deleteMany({
      where: {
        ruanganId: ruangan.id,
        berlakuSampai: { gte: sekarang },
      },
    });

    if (dihapus.count === 0) {
      req.flash('error', `Tidak ada unlock aktif untuk ruangan "${ruangan.namaRuangan}".`);
      return res.redirect('/ruangan');
    }

    req.flash(
      'sukses',
      `Akses khusus untuk ruangan "${ruangan.namaRuangan}" berhasil ditutup.`
    );
    res.redirect('/ruangan');
  } catch (err) {
    next(err);
  }
};