// =====================================================
// SIPRAS-NT — Auth Routes
// =====================================================
const router = require('express').Router();
const c = require('../controllers/authController');
const { wajibLogin } = require('../middleware/auth');

router.get('/', (req, res) => res.redirect(req.userLogin ? '/dashboard' : '/login'));
router.get('/login', c.tampilFormLogin);
router.post('/login', c.prosesLogin);
router.post('/logout', wajibLogin, c.prosesLogout);
router.get('/ganti-password', wajibLogin, c.tampilGantiPassword);
router.post('/ganti-password', wajibLogin, c.prosesGantiPassword);

module.exports = router;
