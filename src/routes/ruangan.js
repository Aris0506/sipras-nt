// =====================================================
// SIPRAS-NT — Ruangan Routes (Khusus Waka Sarpras)
// =====================================================
const router = require('express').Router();
const c = require('../controllers/ruanganController');
const { wajibLogin } = require('../middleware/auth');
const { hanyaWaka } = require('../middleware/role');

router.use(wajibLogin, hanyaWaka);

router.get('/', c.daftarRuangan);
router.get('/baru', c.formTambah);
router.post('/', c.simpanRuangan);
router.get('/:id/edit', c.formEdit);
router.put('/:id', c.perbaruiRuangan);
router.post('/:id/tetapkan-pj', c.tetapkanPJ);
router.post('/:id/unlock', c.unlockRuangan);
router.post('/:id/cancel-unlock', c.cancelUnlock);
router.post('/:id/nonaktifkan', c.nonaktifkan);

module.exports = router;
