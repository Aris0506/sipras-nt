// =====================================================
// SIPRAS-NT — Pengguna Controller (Khusus Waka Sarpras)
// Use Case: UC4 Kelola Akun PJ, UC5 Nonaktifkan Akun PJ,
//           UC3 Reset Password PJ
// =====================================================
const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { wajibAda, panjangMinMax } = require('../utils/validator');

const PASSWORD_DEFAULT_PJ = 'sipras2026';

// ---------- GET /pengguna ----------
exports.daftarPengguna = async (req, res, next) => {
  try {
    const { q, status } = req.query;

    const where = { role: 'pj' };
    if (q) {
      where.OR = [
        { nama: { contains: String(q), mode: 'insensitive' } },
        { username: { contains: String(q), mode: 'insensitive' } },
      ];
    }
    if (status === 'aktif') where.aktif = true;
    if (status === 'nonaktif') where.aktif = false;

    const daftarPj = await prisma.pengguna.findMany({
      where,
      select: {
        id: true,
        nama: true,
        username: true,
        aktif: true,
        createdAt: true,
        ruanganDipegang: {
          where: { aktif: true },
          select: { namaRuangan: true, kodeRuangan: true },
        },
      },
      orderBy: [{ aktif: 'desc' }, { nama: 'asc' }],
    });

    res.render('pengguna/index', {
      title: 'Akun PJ',
      daftarPj,
      filter: { q: q || '', status: status || '' },
    });
  } catch (err) {
    next(err);
  }
};

// ---------- GET /pengguna/baru ----------
exports.formTambah = (req, res) => {
  res.render('pengguna/form', {
    title: 'Tambah Akun PJ',
    mode: 'create',
    data: { nama: '', username: '' },
  });
};

// ---------- POST /pengguna ----------
exports.simpanPengguna = async (req, res, next) => {
  try {
    const nama = String(req.body.nama || '').trim();
    const username = String(req.body.username || '').trim().toLowerCase();

    const errors = [
      wajibAda(nama, 'Nama'),
      panjangMinMax(nama, 3, 100, 'Nama'),
      wajibAda(username, 'Username'),
      panjangMinMax(username, 3, 50, 'Username'),
    ].filter(Boolean);

    if (!/^[a-z0-9._-]+$/.test(username)) {
      errors.push('Username hanya boleh huruf kecil, angka, titik, underscore, dan strip.');
    }

    if (errors.length) {
      return res.render('pengguna/form', {
        title: 'Tambah Akun PJ',
        mode: 'create',
        data: { nama, username },
        errorsLokal: errors,
      });
    }

    // Cek duplikat username
    const sudahAda = await prisma.pengguna.findUnique({ where: { username } });
    if (sudahAda) {
      return res.render('pengguna/form', {
        title: 'Tambah Akun PJ',
        mode: 'create',
        data: { nama, username },
        errorsLokal: [`Username "${username}" sudah dipakai.`],
      });
    }

    const passwordHash = await bcrypt.hash(PASSWORD_DEFAULT_PJ, 10);
    await prisma.pengguna.create({
      data: {
        nama,
        username,
        passwordHash,
        role: 'pj',
        aktif: true,
        dibuatOleh: req.userLogin.id,
      },
    });

    req.flash(
      'sukses',
      `Akun PJ "${nama}" berhasil dibuat. Password awal: ${PASSWORD_DEFAULT_PJ} (minta PJ untuk segera mengganti).`
    );
    res.redirect('/pengguna');
  } catch (err) {
    next(err);
  }
};

// ---------- GET /pengguna/:id/edit ----------
exports.formEdit = async (req, res, next) => {
  try {
    const pj = await prisma.pengguna.findFirst({
      where: { id: req.params.id, role: 'pj' },
      select: { id: true, nama: true, username: true, aktif: true },
    });
    if (!pj) {
      req.flash('error', 'Akun PJ tidak ditemukan.');
      return res.redirect('/pengguna');
    }
    res.render('pengguna/form', {
      title: 'Edit Akun PJ',
      mode: 'edit',
      data: pj,
    });
  } catch (err) {
    next(err);
  }
};

// ---------- PUT /pengguna/:id ----------
exports.perbaruiPengguna = async (req, res, next) => {
  try {
    const pj = await prisma.pengguna.findFirst({
      where: { id: req.params.id, role: 'pj' },
    });
    if (!pj) {
      req.flash('error', 'Akun PJ tidak ditemukan.');
      return res.redirect('/pengguna');
    }

    const nama = String(req.body.nama || '').trim();
    const username = String(req.body.username || '').trim().toLowerCase();

    const errors = [
      wajibAda(nama, 'Nama'),
      panjangMinMax(nama, 3, 100, 'Nama'),
      wajibAda(username, 'Username'),
      panjangMinMax(username, 3, 50, 'Username'),
    ].filter(Boolean);

    if (!/^[a-z0-9._-]+$/.test(username)) {
      errors.push('Username hanya boleh huruf kecil, angka, titik, underscore, dan strip.');
    }

    if (errors.length) {
      errors.forEach((e) => req.flash('error', e));
      return res.redirect(`/pengguna/${pj.id}/edit`);
    }

    // Cek username dipakai user lain
    if (username !== pj.username) {
      const beneran = await prisma.pengguna.findUnique({ where: { username } });
      if (beneran && beneran.id !== pj.id) {
        req.flash('error', `Username "${username}" sudah dipakai user lain.`);
        return res.redirect(`/pengguna/${pj.id}/edit`);
      }
    }

    await prisma.pengguna.update({
      where: { id: pj.id },
      data: {
        nama,
        username,
        diperbaruiOleh: req.userLogin.id,
      },
    });

    req.flash('sukses', `Akun PJ "${nama}" berhasil diperbarui.`);
    res.redirect('/pengguna');
  } catch (err) {
    next(err);
  }
};

// ---------- POST /pengguna/:id/nonaktifkan ----------
exports.nonaktifkan = async (req, res, next) => {
  try {
    const pj = await prisma.pengguna.findFirst({
      where: { id: req.params.id, role: 'pj' },
    });
    if (!pj) {
      req.flash('error', 'Akun PJ tidak ditemukan.');
      return res.redirect('/pengguna');
    }

    const statusBaru = !pj.aktif;
    await prisma.pengguna.update({
      where: { id: pj.id },
      data: {
        aktif: statusBaru,
        diperbaruiOleh: req.userLogin.id,
      },
    });

    req.flash(
      'sukses',
      `Akun PJ "${pj.nama}" ${statusBaru ? 'diaktifkan kembali' : 'dinonaktifkan'}.`
    );
    res.redirect('/pengguna');
  } catch (err) {
    next(err);
  }
};

// ---------- POST /pengguna/:id/reset-password ----------
exports.resetPassword = async (req, res, next) => {
  try {
    const pj = await prisma.pengguna.findFirst({
      where: { id: req.params.id, role: 'pj' },
    });
    if (!pj) {
      req.flash('error', 'Akun PJ tidak ditemukan.');
      return res.redirect('/pengguna');
    }

    const passwordHash = await bcrypt.hash(PASSWORD_DEFAULT_PJ, 10);
    await prisma.pengguna.update({
      where: { id: pj.id },
      data: {
        passwordHash,
        diperbaruiOleh: req.userLogin.id,
      },
    });

    req.flash(
      'sukses',
      `Password PJ "${pj.nama}" berhasil di-reset ke "${PASSWORD_DEFAULT_PJ}". Minta PJ segera login dan ganti password.`
    );
    res.redirect('/pengguna');
  } catch (err) {
    next(err);
  }
};