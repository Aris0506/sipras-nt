// =====================================================
// SIPRAS-NT — Laporan Routes (Khusus Waka Sarpras)
// =====================================================
const router = require('express').Router();
const c = require('../controllers/laporanController');
const { wajibLogin } = require('../middleware/auth');
const { hanyaWaka } = require('../middleware/role');

router.use(wajibLogin, hanyaWaka);

router.get('/', c.indexLaporan);
router.get('/per-ruangan/:ruanganId', c.laporanPerRuangan);
router.get('/rekap', c.laporanRekap);

module.exports = router;
