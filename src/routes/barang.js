// =====================================================
// SIPRAS-NT — Barang Routes
// Akses: Waka (semua) & PJ (ruangan sendiri) — diatur per controller
// =====================================================
const router = require('express').Router();
const c = require('../controllers/barangController');
const { wajibLogin } = require('../middleware/auth');
const { cekPeriodeAktif } = require('../middleware/periodeAktif');
const { hanyaPJ } = require('../middleware/role');
router.use(wajibLogin);

// API endpoint (harus di atas route dengan :id biar nggak ke-treat sebagai param)
router.get('/api/kode-otomatis', c.apiKodeOtomatis);


// CRUD
router.get('/', c.daftarBarang);
router.get('/baru', hanyaPJ, cekPeriodeAktif, c.formTambah);
router.post('/', hanyaPJ, cekPeriodeAktif, c.simpanBarang);
router.get('/:id', c.detailBarang);
router.get('/:id/edit', hanyaPJ, cekPeriodeAktif, c.formEdit);
router.put('/:id', hanyaPJ, cekPeriodeAktif, c.perbaruiBarang);
router.post('/:id/lapor-rusak', hanyaPJ, c.laporRusak);
router.post('/:id/nonaktifkan', hanyaPJ, cekPeriodeAktif, c.nonaktifkan);

module.exports = router;