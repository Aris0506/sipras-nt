// =====================================================
// SIPRAS-NT — Role-Based Access Control Middleware
// =====================================================

/**
 * Hanya boleh diakses role tertentu.
 * Contoh: hanyaRole('waka_sarpras') | hanyaRole('waka_sarpras', 'pj')
 */
function hanyaRole(...rolesIzin) {
  return (req, res, next) => {
    if (!req.userLogin) {
      req.flash('error', 'Anda harus login terlebih dahulu.');
      return res.redirect('/login');
    }
    if (!rolesIzin.includes(req.userLogin.role)) {
      req.flash('error', 'Anda tidak memiliki akses ke halaman ini.');
      return res.redirect('/dashboard');
    }
    next();
  };
}

const hanyaWaka = hanyaRole('waka_sarpras');
const hanyaPJ = hanyaRole('pj');

module.exports = { hanyaRole, hanyaWaka, hanyaPJ };
