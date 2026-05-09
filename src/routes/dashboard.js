// =====================================================
// SIPRAS-NT — Dashboard Routes
// =====================================================
const router = require('express').Router();
const c = require('../controllers/dashboardController');
const { wajibLogin } = require('../middleware/auth');

router.use(wajibLogin);
router.get('/', c.tampilDashboard);

module.exports = router;
