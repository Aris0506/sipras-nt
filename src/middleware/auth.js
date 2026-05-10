// =====================================================
// SIPRAS-NT — Auth Middleware
// User data di-cache di session, refresh hanya saat perlu.
// =====================================================
const prisma = require('../config/database');

// Berapa lama cache user di session valid (5 menit)
const TTL_CACHE_USER_MS = 5 * 60 * 1000;

/**
 * Attach user yang sedang login ke req & res.locals.
 * Strategi:
 *  - Kalau session.user ada DAN belum expired → pakai dari session (no DB hit)
 *  - Kalau expired ATAU belum ada → query DB, simpan ke session
 *  - Kalau session.userId nggak ada → user belum login
 */
async function attachUser(req, res, next) {
  res.locals.userLogin = null;
  if (!req.session?.userId) return next();

  const sekarang = Date.now();
  const cache = req.session.user;
  const cacheValid =
    cache &&
    cache.id === req.session.userId &&
    cache.cachedAt &&
    sekarang - cache.cachedAt < TTL_CACHE_USER_MS;

  if (cacheValid) {
    // Pakai dari cache, NO DB hit
    req.userLogin = cache;
    res.locals.userLogin = cache;
    return next();
  }

  // Cache miss / expired → fetch dari DB
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

    if (!user || !user.aktif) {
      // User di-nonaktifkan — hancurkan session
      return req.session.destroy(() => next());
    }

    // Simpan ke session sebagai cache
    const userCache = { ...user, cachedAt: sekarang };
    req.session.user = userCache;
    req.userLogin = userCache;
    res.locals.userLogin = userCache;
  } catch (err) {
    console.error('attachUser error:', err);
  }
  next();
}

/**
 * Force refresh cache user di session (panggil setelah update profil/password)
 */
function invalidasiCacheUser(req) {
  if (req.session) {
    delete req.session.user;
  }
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

module.exports = { attachUser, wajibLogin, invalidasiCacheUser };