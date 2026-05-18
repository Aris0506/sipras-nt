// =====================================================
// SIPRAS-NT — Settings Controller (Khusus Waka Sarpras)
// Use Case: Atur tanggal mulai & durasi periode pengisian
// =====================================================
const prisma = require('../config/database');

// Helper: ambil settings (kalau belum ada, bikin default)
async function ambilSettings() {
  let settings = await prisma.settings.findFirst();
  
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        tanggalMulaiPeriode: 1,
        durasiPeriodeHari: 7,
      },
    });
  }
  
  return settings;
}

// ---------- GET /settings ----------
exports.tampilSettings = async (req, res, next) => {
  try {
    const settings = await ambilSettings();
    res.render('settings/index', {
      title: 'Pengaturan Sistem',
      settings,
    });
  } catch (err) {
    next(err);
  }
};

// ---------- POST /settings ----------
exports.simpanSettings = async (req, res, next) => {
  try {
    const tanggalMulai = parseInt(req.body.tanggalMulaiPeriode, 10);
    const durasi = parseInt(req.body.durasiPeriodeHari, 10);

    // Validasi sederhana
    if (isNaN(tanggalMulai) || tanggalMulai < 1 || tanggalMulai > 28) {
      req.flash('error', 'Tanggal mulai harus antara 1-28.');
      return res.redirect('/settings');
    }

    if (isNaN(durasi) || durasi < 1 || durasi > 28) {
      req.flash('error', 'Durasi harus antara 1-28 hari.');
      return res.redirect('/settings');
    }

    const settings = await ambilSettings();

    await prisma.settings.update({
      where: { id: settings.id },
      data: {
        tanggalMulaiPeriode: tanggalMulai,
        durasiPeriodeHari: durasi,
        diperbaruiOleh: req.userLogin.id,
      },
    });

    req.flash('sukses', 'Pengaturan berhasil disimpan.');
    res.redirect('/settings');
  } catch (err) {
    next(err);
  }
};