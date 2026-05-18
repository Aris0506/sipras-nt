// =====================================================
// SIPRAS-NT — Settings Routes (Khusus Waka Sarpras)
// =====================================================
const router = require('express').Router();
const c = require('../controllers/settingsController');
const { wajibLogin } = require('../middleware/auth');
const { hanyaWaka } = require('../middleware/role');

router.use(wajibLogin, hanyaWaka);

router.get('/', c.tampilSettings);
router.post('/', c.simpanSettings);

module.exports = router;