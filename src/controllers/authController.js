// =====================================================
// SIPRAS-NT — Auth Controller
// Use Case: UC1 Login, UC2 Logout, UC3 Reset Password PJ
// =====================================================
const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { wajibAda, panjangMinMax } = require('../utils/validator');
const { invalidasiCacheUser } = require('../middleware/auth');

// ---------- GET /login ----------
exports.tampilFormLogin = (req, res) => {
  if (req.userLogin) return res.redirect('/dashboard');
  res.render('auth/login', {
    title: 'Login',
    layout: 'layouts/auth',
    username: '',
  });
};

// ---------- POST /login ----------
exports.prosesLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      req.flash('error', 'Username dan password wajib diisi.');
      return res.redirect('/login');
    }

    // Cari user
    const user = await prisma.pengguna.findUnique({
      where: { username: String(username).trim().toLowerCase() },
    });

    // User tidak ditemukan ATAU sudah dinonaktifkan
    if (!user || !user.aktif) {
      req.flash('error', 'Username atau password salah.');
      return res.redirect('/login');
    }

    // Cocokkan password
    const cocok = await bcrypt.compare(password, user.passwordHash);
    if (!cocok) {
      req.flash('error', 'Username atau password salah.');
      return res.redirect('/login');
    }

    // Sukses — set session
    // Sukses — set session + langsung cache user data
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.user = {
      id: user.id,
      nama: user.nama,
      username: user.username,
      role: user.role,
      aktif: user.aktif,
      cachedAt: Date.now(),
    };

    req.flash('sukses', `Selamat datang, ${user.nama}!`);
    res.redirect('/dashboard');

  } catch (err) {
    next(err);
  }
};

// ---------- POST /logout ----------
exports.prosesLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout error:', err);
    res.clearCookie(process.env.SESSION_NAME || 'sipras_nt_sid');
    res.redirect('/login');
  });
};

// ---------- GET /ganti-password ----------
exports.tampilGantiPassword = (req, res) => {
  res.render('auth/ganti-password', { title: 'Ganti Password' });
};

// ---------- POST /ganti-password ----------
exports.prosesGantiPassword = async (req, res, next) => {
  try {
    const { passwordLama, passwordBaru, passwordBaruKonfirmasi } = req.body;

    // Validasi
    const errors = [
      wajibAda(passwordLama, 'Password lama'),
      wajibAda(passwordBaru, 'Password baru'),
      panjangMinMax(passwordBaru, 8, 100, 'Password baru'),
    ].filter(Boolean);

    if (passwordBaru !== passwordBaruKonfirmasi) {
      errors.push('Konfirmasi password tidak cocok.');
    }

    if (errors.length) {
      errors.forEach((e) => req.flash('error', e));
      return res.redirect('/ganti-password');
    }

    // Ambil user terbaru dari DB (req.userLogin tidak punya passwordHash)
    const user = await prisma.pengguna.findUnique({
      where: { id: req.userLogin.id },
    });

    // Cek password lama
    const cocok = await bcrypt.compare(passwordLama, user.passwordHash);
    if (!cocok) {
      req.flash('error', 'Password lama salah.');
      return res.redirect('/ganti-password');
    }

    // Hash & simpan
    // Hash & simpan
    const passwordHashBaru = await bcrypt.hash(passwordBaru, 10);
    await prisma.pengguna.update({
      where: { id: user.id },
      data: {
        passwordHash: passwordHashBaru,
        diperbaruiOleh: req.userLogin.id,
      },
    });

    // Invalidate cache supaya request berikutnya fetch fresh data
    invalidasiCacheUser(req);

    req.flash('sukses', 'Password berhasil diganti.');
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
};