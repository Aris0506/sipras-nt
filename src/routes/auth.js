// =====================================================
// SIPRAS-NT — Auth Routes
// =====================================================
const router = require('express').Router();
const c = require('../controllers/authController');
const { wajibLogin } = require('../middleware/auth');

// Root: kalau udah login → dashboard, kalau belum → landing page
router.get('/', (req, res) => {
  if (req.userLogin) return res.redirect('/dashboard');
  res.render('landing/index', { title: 'Beranda', appName: process.env.APP_NAME || 'SIPRAS-NT' });
});

router.get('/login', c.tampilFormLogin);
router.post('/login', c.prosesLogin);
router.post('/logout', wajibLogin, c.prosesLogout);
router.get('/ganti-password', wajibLogin, c.tampilGantiPassword);
router.post('/ganti-password', wajibLogin, c.prosesGantiPassword);

module.exports = router;