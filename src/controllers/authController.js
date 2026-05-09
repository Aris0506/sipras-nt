// =====================================================
// SIPRAS-NT — Auth Controller
// Use Case: UC1 Login, UC2 Logout, UC3 Reset Password PJ
// =====================================================
const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

// GET /login
exports.tampilFormLogin = (req, res) => {
  if (req.userLogin) return res.redirect('/dashboard');
  res.render('auth/login', { title: 'Login', layout: 'layouts/auth' });
};

// POST /login
exports.prosesLogin = async (req, res) => {
  // TODO: validasi username + password, set req.session.userId
  res.redirect('/dashboard');
};

// POST /logout
exports.prosesLogout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};

// GET /ganti-password (untuk semua user yang login)
exports.tampilGantiPassword = (req, res) => {
  res.render('auth/ganti-password', { title: 'Ganti Password' });
};

// POST /ganti-password
exports.prosesGantiPassword = async (req, res) => {
  // TODO
  res.redirect('/dashboard');
};
