// =====================================================
// SIPRAS-NT — LogPerbaikan Routes (Khusus Waka Sarpras)
// =====================================================
const router = require('express').Router();
const c = require('../controllers/logPerbaikanController');
const { wajibLogin } = require('../middleware/auth');
const { hanyaWaka } = require('../middleware/role');

router.use(wajibLogin, hanyaWaka);

router.get('/', c.daftarBarangRusak);
router.get('/riwayat', c.riwayat);
router.post('/:logId/tandai-selesai', c.tandaiSelesai);

module.exports = router;
