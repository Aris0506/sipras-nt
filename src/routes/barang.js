// =====================================================
// SIPRAS-NT — Barang Routes
// Akses: Waka (semua) & PJ (ruangan sendiri) — diatur per controller
// =====================================================
const router = require('express').Router();
const c = require('../controllers/barangController');
const { wajibLogin } = require('../middleware/auth');

router.use(wajibLogin);

// API endpoint (harus di atas route dengan :id biar nggak ke-treat sebagai param)
router.get('/api/kode-otomatis', c.apiKodeOtomatis);

// CRUD
router.get('/', c.daftarBarang);
router.get('/baru', c.formTambah);
router.post('/', c.simpanBarang);
router.get('/:id', c.detailBarang);
router.get('/:id/edit', c.formEdit);
router.put('/:id', c.perbaruiBarang);
router.post('/:id/lapor-rusak', c.laporRusak);
router.post('/:id/nonaktifkan', c.nonaktifkan);

module.exports = router;