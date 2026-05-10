// =====================================================
// SIPRAS-NT — Barang Controller
// Use Case:
//   UC8  Input Barang             (PJ)
//   UC9  Edit Barang              (PJ)
//   UC10 Lapor Kondisi Barang     (PJ)
//   UC11 Lihat Barang Ruangan     (PJ)
//   UC12 Lihat Semua Barang       (Waka)
// =====================================================
const prisma = require('../config/database');
const { wajibAda, panjangMinMax, angkaPositif, generateKodeBarang } = require('../utils/validator');

// ---------- Helpers ----------

// Ambil daftar ruangan yang dipegang PJ tertentu (untuk dropdown)
async function ambilRuanganPJ(pjId) {
  return prisma.ruangan.findMany({
    where: { pjId, aktif: true },
    select: { id: true, namaRuangan: true, kodeRuangan: true },
    orderBy: { namaRuangan: 'asc' },
  });
}

// Ambil semua ruangan aktif (untuk Waka — tapi sekarang Waka belum input barang)
async function ambilSemuaRuanganAktif() {
  return prisma.ruangan.findMany({
    where: { aktif: true },
    select: { id: true, namaRuangan: true, kodeRuangan: true },
    orderBy: { namaRuangan: 'asc' },
  });
}

// Cek apakah PJ punya akses ke barang tertentu (barang harus di ruangan miliknya)
async function pjPunyaAksesKeBarang(pjId, barangId) {
  const barang = await prisma.barang.findUnique({
    where: { id: barangId },
    select: { ruangan: { select: { pjId: true } } },
  });
  return barang && barang.ruangan.pjId === pjId;
}

// ---------- GET /barang ----------
// Waka  : semua barang lintas ruangan (dengan filter)
// PJ    : hanya barang di ruangan miliknya
exports.daftarBarang = async (req, res, next) => {
  try {
    const user = req.userLogin;
    const { q, ruangan, kondisi, status } = req.query;

    const where = {};

    // Scope berdasarkan role
    if (user.role === 'pj') {
      where.ruangan = { pjId: user.id };
    }

    // Filter ruangan
    if (ruangan) {
      where.ruanganId = String(ruangan);
      // Tetap pertahankan scope PJ kalau ada
      if (user.role === 'pj') {
        where.AND = [
          { ruanganId: String(ruangan) },
          { ruangan: { pjId: user.id } },
        ];
        delete where.ruanganId;
        delete where.ruangan;
      }
    }

    // Filter pencarian
    if (q) {
      where.OR = [
        { namaBarang: { contains: String(q), mode: 'insensitive' } },
        { kodeBarang: { contains: String(q), mode: 'insensitive' } },
        { kategori: { contains: String(q), mode: 'insensitive' } },
      ];
    }

    // Filter kondisi
    if (kondisi === 'baik' || kondisi === 'rusak') {
      where.kondisi = kondisi;
    }

    // Filter status aktif
    if (status === 'aktif') where.aktif = true;
    else if (status === 'nonaktif') where.aktif = false;
    else where.aktif = true; // default: cuma aktif

    const daftarBarang = await prisma.barang.findMany({
      where,
      select: {
        id: true,
        kodeBarang: true,
        namaBarang: true,
        kategori: true,
        jumlah: true,
        kondisi: true,
        keterangan: true,
        aktif: true,
        createdAt: true,
        ruangan: { select: { id: true, namaRuangan: true, kodeRuangan: true } },
        pembuat: { select: { id: true, nama: true } },
      },
      orderBy: [{ kondisi: 'desc' }, { createdAt: 'desc' }],
    });

    // Daftar ruangan untuk filter dropdown
    let daftarRuanganFilter = [];
    if (user.role === 'waka_sarpras') {
      daftarRuanganFilter = await ambilSemuaRuanganAktif();
    } else {
      daftarRuanganFilter = await ambilRuanganPJ(user.id);
    }

    res.render('barang/index', {
      title: user.role === 'waka_sarpras' ? 'Semua Barang' : 'Daftar Barang',
      daftarBarang,
      daftarRuanganFilter,
      filter: {
        q: q || '',
        ruangan: ruangan || '',
        kondisi: kondisi || '',
        status: status || '',
      },
    });
  } catch (err) {
    next(err);
  }
};


// ---------- GET /barang/baru (PJ only) ----------
// Pre-fill kode barang otomatis berdasarkan ruangan default
// ---------- GET /barang/baru (PJ only) ----------
exports.formTambah = async (req, res, next) => {
  try {
    const user = req.userLogin;

    if (user.role !== 'pj') {
      req.flash('error', 'Hanya PJ Ruangan yang dapat menginput barang.');
      return res.redirect('/barang');
    }

    const ruanganPJ = await ambilRuanganPJ(user.id);
    if (ruanganPJ.length === 0) {
      req.flash(
        'error',
        'Anda belum ditetapkan sebagai PJ untuk ruangan manapun. Hubungi Waka Sarpras.'
      );
      return res.redirect('/barang');
    }

    // Pre-fill kode barang otomatis berdasarkan ruangan default
    const ruanganTerpilih = req.query.ruangan
      ? ruanganPJ.find((r) => r.id === req.query.ruangan) || ruanganPJ[0]
      : ruanganPJ[0];
    const kodeOtomatis = await generateKodeBarang(prisma, ruanganTerpilih.kodeRuangan);

    res.render('barang/form', {
      title: 'Input Barang',
      mode: 'create',
      data: {
        kodeBarang: kodeOtomatis,
        namaBarang: '',
        kategori: '',
        jumlah: 1,
        kondisi: 'baik',
        keterangan: '',
        ruanganId: ruanganTerpilih.id,
      },
      daftarRuangan: ruanganPJ,
    });
  } catch (err) {
    next(err);
  }
};


// ---------- POST /barang (PJ only) ----------
exports.simpanBarang = async (req, res, next) => {
  try {
    const user = req.userLogin;
    if (user.role !== 'pj') {
      req.flash('error', 'Hanya PJ Ruangan yang dapat menginput barang.');
      return res.redirect('/barang');
    }

    const namaBarang = String(req.body.namaBarang || '').trim();
    const kodeBarang = String(req.body.kodeBarang || '').trim().toUpperCase();
    const kategori = String(req.body.kategori || '').trim();
    const jumlah = parseInt(req.body.jumlah, 10);
    const kondisi = req.body.kondisi === 'rusak' ? 'rusak' : 'baik';
    const keterangan = String(req.body.keterangan || '').trim() || null;
    const ruanganId = String(req.body.ruanganId || '');

    const errors = [
      wajibAda(namaBarang, 'Nama Barang'),
      panjangMinMax(namaBarang, 2, 150, 'Nama Barang'),
      wajibAda(kodeBarang, 'Kode Barang'),
      panjangMinMax(kodeBarang, 2, 50, 'Kode Barang'),
      wajibAda(kategori, 'Kategori'),
      panjangMinMax(kategori, 2, 50, 'Kategori'),
      angkaPositif(jumlah, 'Jumlah'),
      wajibAda(ruanganId, 'Ruangan'),
    ].filter(Boolean);

    if (kodeBarang && !/^[A-Z0-9.\-]+$/.test(kodeBarang)) {
      errors.push('Kode Barang hanya boleh huruf kapital, angka, titik, atau strip.');
    }
    if (Number.isFinite(jumlah) && jumlah < 1) {
      errors.push('Jumlah minimal 1.');
    }

   if (errors.length) {
      const ruanganPJ = await ambilRuanganPJ(user.id);
      return res.render('barang/form', {
        title: 'Input Barang',
        mode: 'create',
        data: { kodeBarang, namaBarang, kategori, jumlah, kondisi, keterangan, ruanganId },
        daftarRuangan: ruanganPJ,
        errorsLokal: errors,
      });
    }

    // Validasi: ruangan harus milik PJ ini
    const ruangan = await prisma.ruangan.findFirst({
      where: { id: ruanganId, pjId: user.id, aktif: true },
    });
    if (!ruangan) {
      req.flash('error', 'Anda tidak memiliki akses ke ruangan tersebut.');
      return res.redirect('/barang/baru');
    }

    // Cek duplikat kode barang
    const sudahAda = await prisma.barang.findUnique({ where: { kodeBarang } });
    if (sudahAda) {
      const ruanganPJ = await ambilRuanganPJ(user.id);
      return res.render('barang/form', {
        title: 'Input Barang',
        mode: 'create',
        data: { kodeBarang, namaBarang, kategori, jumlah, kondisi, keterangan, ruanganId },
        daftarRuangan: ruanganPJ,
        errorsLokal: [`Kode Barang "${kodeBarang}" sudah dipakai.`],
      });
    }

    // Simpan barang. Kalau kondisi awal langsung 'rusak', otomatis bikin LogPerbaikan.
    const barangBaru = await prisma.barang.create({
      data: {
        ruanganId,
        kodeBarang,
        namaBarang,
        kategori,
        jumlah,
        kondisi,
        keterangan,
        aktif: true,
        dibuatOleh: user.id,
      },
    });

    if (kondisi === 'rusak') {
      await prisma.logPerbaikan.create({
        data: {
          barangId: barangBaru.id,
          catatan: 'Dilaporkan rusak saat input awal oleh PJ.',
        },
      });
    }

    req.flash('sukses', `Barang "${namaBarang}" berhasil ditambahkan.`);
    res.redirect('/barang');
  } catch (err) {
    next(err);
  }
};

// ---------- GET /barang/:id ----------
exports.detailBarang = async (req, res, next) => {
  try {
    const user = req.userLogin;
    const barang = await prisma.barang.findUnique({
      where: { id: req.params.id },
      include: {
        ruangan: { select: { id: true, namaRuangan: true, kodeRuangan: true, pjId: true } },
        pembuat: { select: { nama: true } },
        pemerbarui: { select: { nama: true } },
        logPerbaikan: {
          orderBy: { tanggalLapor: 'desc' },
          include: { penindak: { select: { nama: true } } },
        },
      },
    });
    if (!barang) {
      req.flash('error', 'Barang tidak ditemukan.');
      return res.redirect('/barang');
    }

    // PJ hanya boleh lihat barang ruangan miliknya
    if (user.role === 'pj' && barang.ruangan.pjId !== user.id) {
      req.flash('error', 'Anda tidak memiliki akses ke barang tersebut.');
      return res.redirect('/barang');
    }

    res.render('barang/detail', { title: 'Detail Barang', barang });
  } catch (err) {
    next(err);
  }
};

// ---------- GET /barang/:id/edit (PJ only, ruangan milik PJ) ----------
exports.formEdit = async (req, res, next) => {
  try {
    const user = req.userLogin;
    if (user.role !== 'pj') {
      req.flash('error', 'Hanya PJ Ruangan yang dapat mengedit barang.');
      return res.redirect('/barang');
    }

    if (!(await pjPunyaAksesKeBarang(user.id, req.params.id))) {
      req.flash('error', 'Anda tidak memiliki akses ke barang tersebut.');
      return res.redirect('/barang');
    }

    const barang = await prisma.barang.findUnique({
      where: { id: req.params.id },
    });
    const ruanganPJ = await ambilRuanganPJ(user.id);

    res.render('barang/form', {
      title: 'Edit Barang',
      mode: 'edit',
      data: barang,
      daftarRuangan: ruanganPJ,
    });
  } catch (err) {
    next(err);
  }
};

// ---------- PUT /barang/:id (PJ only) ----------
exports.perbaruiBarang = async (req, res, next) => {
  try {
    const user = req.userLogin;
    if (user.role !== 'pj') {
      req.flash('error', 'Hanya PJ Ruangan yang dapat mengedit barang.');
      return res.redirect('/barang');
    }
    if (!(await pjPunyaAksesKeBarang(user.id, req.params.id))) {
      req.flash('error', 'Anda tidak memiliki akses ke barang tersebut.');
      return res.redirect('/barang');
    }

    const barangLama = await prisma.barang.findUnique({ where: { id: req.params.id } });

    const namaBarang = String(req.body.namaBarang || '').trim();
    const kodeBarang = String(req.body.kodeBarang || '').trim().toUpperCase();
    const kategori = String(req.body.kategori || '').trim();
    const jumlah = parseInt(req.body.jumlah, 10);
    const kondisi = req.body.kondisi === 'rusak' ? 'rusak' : 'baik';
    const keterangan = String(req.body.keterangan || '').trim() || null;
    const ruanganId = String(req.body.ruanganId || '');

    const errors = [
      wajibAda(namaBarang, 'Nama Barang'),
      panjangMinMax(namaBarang, 2, 150, 'Nama Barang'),
      wajibAda(kodeBarang, 'Kode Barang'),
      panjangMinMax(kodeBarang, 2, 50, 'Kode Barang'),
      wajibAda(kategori, 'Kategori'),
      angkaPositif(jumlah, 'Jumlah'),
    ].filter(Boolean);

    if (Number.isFinite(jumlah) && jumlah < 1) {
      errors.push('Jumlah minimal 1.');
    }

    if (errors.length) {
      errors.forEach((e) => req.flash('error', e));
      return res.redirect(`/barang/${barangLama.id}/edit`);
    }

    // Validasi ruangan tujuan harus milik PJ
    const ruangan = await prisma.ruangan.findFirst({
      where: { id: ruanganId, pjId: user.id, aktif: true },
    });
    if (!ruangan) {
      req.flash('error', 'Anda tidak memiliki akses ke ruangan tersebut.');
      return res.redirect(`/barang/${barangLama.id}/edit`);
    }

    // Cek duplikat kode (selain dirinya)
    if (kodeBarang !== barangLama.kodeBarang) {
      const beneran = await prisma.barang.findUnique({ where: { kodeBarang } });
      if (beneran && beneran.id !== barangLama.id) {
        req.flash('error', `Kode Barang "${kodeBarang}" sudah dipakai barang lain.`);
        return res.redirect(`/barang/${barangLama.id}/edit`);
      }
    }

    // Update barang
    await prisma.barang.update({
      where: { id: barangLama.id },
      data: {
        ruanganId,
        kodeBarang,
        namaBarang,
        kategori,
        jumlah,
        kondisi,
        keterangan,
        diperbaruiOleh: user.id,
      },
    });

    // Kalau dari baik → rusak via edit, otomatis bikin LogPerbaikan
    if (barangLama.kondisi === 'baik' && kondisi === 'rusak') {
      await prisma.logPerbaikan.create({
        data: {
          barangId: barangLama.id,
          catatan: 'Dilaporkan rusak melalui edit barang.',
        },
      });
    }

    req.flash('sukses', `Barang "${namaBarang}" berhasil diperbarui.`);
    res.redirect('/barang');
  } catch (err) {
    next(err);
  }
};

// ---------- POST /barang/:id/lapor-rusak (PJ only) ----------
// Quick action — set kondisi 'rusak' tanpa buka form edit
exports.laporRusak = async (req, res, next) => {
  try {
    const user = req.userLogin;
    if (user.role !== 'pj') {
      req.flash('error', 'Hanya PJ Ruangan yang dapat melaporkan barang rusak.');
      return res.redirect('/barang');
    }
    if (!(await pjPunyaAksesKeBarang(user.id, req.params.id))) {
      req.flash('error', 'Anda tidak memiliki akses ke barang tersebut.');
      return res.redirect('/barang');
    }

    const barang = await prisma.barang.findUnique({ where: { id: req.params.id } });
    if (!barang) {
      req.flash('error', 'Barang tidak ditemukan.');
      return res.redirect('/barang');
    }

    if (barang.kondisi === 'rusak') {
      req.flash('info', `Barang "${barang.namaBarang}" sudah berstatus rusak.`);
      return res.redirect('/barang');
    }

    const catatan = String(req.body.catatan || '').trim() || null;

    // Update + bikin log dalam 1 transaksi
    await prisma.$transaction([
      prisma.barang.update({
        where: { id: barang.id },
        data: { kondisi: 'rusak', diperbaruiOleh: user.id },
      }),
      prisma.logPerbaikan.create({
        data: {
          barangId: barang.id,
          catatan: catatan || 'Dilaporkan rusak oleh PJ.',
        },
      }),
    ]);

    req.flash(
      'sukses',
      `Barang "${barang.namaBarang}" berhasil dilaporkan rusak. Menunggu tindak lanjut Waka Sarpras.`
    );
    res.redirect('/barang');
  } catch (err) {
    next(err);
  }
};

// ---------- POST /barang/:id/nonaktifkan (PJ only) ----------
exports.nonaktifkan = async (req, res, next) => {
  try {
    const user = req.userLogin;
    if (user.role !== 'pj') {
      req.flash('error', 'Hanya PJ Ruangan yang dapat menonaktifkan barang.');
      return res.redirect('/barang');
    }
    if (!(await pjPunyaAksesKeBarang(user.id, req.params.id))) {
      req.flash('error', 'Anda tidak memiliki akses ke barang tersebut.');
      return res.redirect('/barang');
    }

    const barang = await prisma.barang.findUnique({ where: { id: req.params.id } });
    if (!barang) {
      req.flash('error', 'Barang tidak ditemukan.');
      return res.redirect('/barang');
    }

    const statusBaru = !barang.aktif;
    await prisma.barang.update({
      where: { id: barang.id },
      data: { aktif: statusBaru, diperbaruiOleh: user.id },
    });

    req.flash(
      'sukses',
      `Barang "${barang.namaBarang}" ${statusBaru ? 'diaktifkan kembali' : 'dinonaktifkan'}.`
    );
    res.redirect('/barang?status=' + (statusBaru ? 'aktif' : 'nonaktif'));
  } catch (err) {
    next(err);
  }
};


// ---------- GET /barang/api/kode-otomatis?ruanganId=xxx (PJ only) ----------
// API endpoint untuk dapat kode barang otomatis (dipanggil dari JS form)
exports.apiKodeOtomatis = async (req, res, next) => {
  try {
    const user = req.userLogin;
    if (user.role !== 'pj') {
      return res.status(403).json({ error: 'Akses ditolak' });
    }
    const ruanganId = String(req.query.ruanganId || '');
    const ruangan = await prisma.ruangan.findFirst({
      where: { id: ruanganId, pjId: user.id, aktif: true },
      select: { kodeRuangan: true },
    });
    if (!ruangan) {
      return res.status(404).json({ error: 'Ruangan tidak ditemukan' });
    }
    const kode = await generateKodeBarang(prisma, ruangan.kodeRuangan);
    res.json({ kodeBarang: kode });
  } catch (err) {
    next(err);
  }
};