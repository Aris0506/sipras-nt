// =====================================================
// SIPRAS-NT — Scheduler (Auto-Create Periode Pengisian)
// =====================================================
const cron = require('node-cron');
const prisma = require('../config/database');
const { hitungPeriodeBulanIni, ambilSettings } = require('./periodeChecker');

/**
 * Bikin periode reguler bulan ini (kalau belum ada)
 * Dipanggil:
 *  - Otomatis tiap tanggal 1 jam 00:01 WIB (oleh cron)
 *  - Saat server pertama kali start (untuk handle case server mati pas tanggal 1)
 */
async function bikinPeriodeBulanIni() {
  try {
    const settings = await ambilSettings();
    const periode = await hitungPeriodeBulanIni();

    // Cek periode reguler bulan ini udah ada di database belum
    const sudahAda = await prisma.periodePengisian.findFirst({
      where: {
        bulan: periode.bulan,
        tahun: periode.tahun,
        jenis: 'reguler',
      },
    });

    if (sudahAda) {
      console.log(`[Scheduler] Periode reguler ${periode.bulan}/${periode.tahun} sudah ada, skip.`);
      return;
    }

    // Cari Waka aktif untuk dijadikan "creator" (audit trail)
    const waka = await prisma.pengguna.findFirst({
      where: { role: 'waka_sarpras', aktif: true },
    });

    if (!waka) {
      console.log('[Scheduler] Tidak ada Waka aktif, skip create periode.');
      return;
    }

    await prisma.periodePengisian.create({
      data: {
        tanggalMulai: periode.tanggalMulai,
        tanggalSelesai: periode.tanggalSelesai,
        bulan: periode.bulan,
        tahun: periode.tahun,
        jenis: 'reguler',
        catatan: `Auto-generate dari settings: tanggal ${settings.tanggalMulaiPeriode}, durasi ${settings.durasiPeriodeHari} hari`,
        dibuatOleh: waka.id,
      },
    });

    console.log(`[Scheduler] Periode reguler ${periode.bulan}/${periode.tahun} berhasil dibuat.`);
  } catch (err) {
    console.error('[Scheduler] Gagal bikin periode:', err);
  }
}

/**
 * Inisialisasi scheduler
 */
function initScheduler() {
  // Jalan saat server start (handle case server mati pas tanggal 1)
  bikinPeriodeBulanIni();

  // Cron: tiap tanggal 1 jam 00:01 WIB
  cron.schedule(
    '1 0 1 * *',
    () => {
      console.log('[Scheduler] Trigger: tanggal 1 jam 00:01 WIB');
      bikinPeriodeBulanIni();
    },
    { timezone: 'Asia/Jakarta' }
  );

  console.log('[Scheduler] Scheduler aktif. Cron pattern: 1 0 1 * * (Asia/Jakarta)');
}

module.exports = { initScheduler, bikinPeriodeBulanIni };