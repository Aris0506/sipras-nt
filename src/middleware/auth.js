// =====================================================
// SIPRAS-NT — Auth Middleware
// =====================================================
const prisma = require('../config/database');

/**
 * Attach user yang sedang login ke req & res.locals
 * Dipasang global di app.js
 */
async function attachUser(req, res, next) {
  res.locals.userLogin = null;
  if (!req.session?.userId) return next();

  try {
    const user = await prisma.pengguna.findUnique({
      where: { id: req.session.userId },
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        aktif: true,
      },
    });

    if (user && user.aktif) {
      req.userLogin = user;
      res.locals.userLogin = user;
    } else {
      req.session.destroy(() => {});
    }
  } catch (err) {
    console.error('attachUser error:', err);
  }
  next();
}

/**
 * Wajib login — kalau tidak, redirect ke /login
 */
function wajibLogin(req, res, next) {
  if (!req.userLogin) {
    req.flash('error', 'Anda harus login terlebih dahulu.');
    return res.redirect('/login');
  }
  next();
}

module.exports = { attachUser, wajibLogin };
