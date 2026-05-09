// =====================================================
// SIPRAS-NT — Pengguna Routes (Khusus Waka Sarpras)
// =====================================================
const router = require('express').Router();
const c = require('../controllers/penggunaController');
const { wajibLogin } = require('../middleware/auth');
const { hanyaWaka } = require('../middleware/role');

router.use(wajibLogin, hanyaWaka);

router.get('/', c.daftarPengguna);
router.get('/baru', c.formTambah);
router.post('/', c.simpanPengguna);
router.get('/:id/edit', c.formEdit);
router.put('/:id', c.perbaruiPengguna);
router.post('/:id/nonaktifkan', c.nonaktifkan);
router.post('/:id/reset-password', c.resetPassword);

module.exports = router;
