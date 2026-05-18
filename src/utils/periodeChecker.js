// =====================================================
// SIPRAS-NT — Periode Checker (Helper Logic)
// Fungsi pusat untuk cek status periode & kepatuhan PJ
// =====================================================
const prisma = require('../config/database');

// =====================================================
// FUNGSI 1: Ambil settings (atau bikin default)
// =====================================================
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

// =====================================================
// FUNGSI 2: Hitung periode reguler bulan ini
// (berdasarkan settings, belum tentu udah ada di database)
// =====================================================
async function hitungPeriodeBulanIni() {
  const settings = await ambilSettings();

  // Ambil tahun & bulan SAAT INI di timezone WIB (Asia/Jakarta)
  const sekarangWIB = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
  const tahun = sekarangWIB.getFullYear();
  const bulan = sekarangWIB.getMonth(); // 0-11

  // Bikin tanggal mulai & selesai di timezone WIB
  // Trik: bikin string ISO + offset WIB (+07:00), JS auto-parse ke UTC
  const padDua = (n) => String(n).padStart(2, '0');
  const bulanStr = padDua(bulan + 1);
  const mulaiStr = padDua(settings.tanggalMulaiPeriode);
  const selesaiStr = padDua(settings.tanggalMulaiPeriode + settings.durasiPeriodeHari - 1);

  const tanggalMulai = new Date(`${tahun}-${bulanStr}-${mulaiStr}T00:00:00+07:00`);
  const tanggalSelesai = new Date(`${tahun}-${bulanStr}-${selesaiStr}T23:59:59+07:00`);

  return {
    tanggalMulai,
    tanggalSelesai,
    bulan: bulan + 1,
    tahun,
  };
}

// =====================================================
// FUNGSI 3: Cek apakah saat ini (sekarang) dalam periode aktif?
// =====================================================
async function dalamPeriodeAktif() {
  const periode = await hitungPeriodeBulanIni();
  const sekarang = new Date();
  return sekarang >= periode.tanggalMulai && sekarang <= periode.tanggalSelesai;
}

// =====================================================
// FUNGSI 4: Cek apakah ruangan punya unlock khusus aktif?
// =====================================================
async function punyaUnlockAktif(ruanganId) {
  const sekarang = new Date();
  const unlock = await prisma.unlockKhusus.findFirst({
    where: {
      ruanganId,
      berlakuSampai: { gte: sekarang },
    },
    orderBy: { berlakuSampai: 'desc' },
  });
  return unlock; // return objek unlock atau null
}

// =====================================================
// FUNGSI 5: Cek apakah PJ ruangan X boleh input/edit barang sekarang?
// (kombinasi: periode aktif ATAU ada unlock khusus)
// =====================================================
async function bolehInputBarang(ruanganId) {
  // Cek periode dulu
  if (await dalamPeriodeAktif()) {
    return { boleh: true, alasan: 'periode_aktif' };
  }

  // Periode gak aktif, cek unlock khusus
  const unlock = await punyaUnlockAktif(ruanganId);
  if (unlock) {
    return {
      boleh: true,
      alasan: 'unlock_khusus',
      berlakuSampai: unlock.berlakuSampai,
    };
  }

  // Dua-duanya gak ada → di-LOCK
  return { boleh: false, alasan: 'lock' };
}

// =====================================================
// FUNGSI 6: Cek apakah PJ ruangan X PATUH di periode bulan ini?
// (patuh = ada minimal 1 aktivitas input/edit barang dalam periode)
// =====================================================
async function statusKepatuhanPj(ruanganId) {
  const periode = await hitungPeriodeBulanIni();
  const sekarang = new Date();

  // Cek aktivitas barang di ruangan ini, dalam periode bulan ini
  const aktivitas = await prisma.barang.findFirst({
    where: {
      ruanganId,
      OR: [
        {
          createdAt: {
            gte: periode.tanggalMulai,
            lte: periode.tanggalSelesai,
          },
        },
        {
          updatedAt: {
            gte: periode.tanggalMulai,
            lte: periode.tanggalSelesai,
          },
        },
      ],
    },
  });

  if (aktivitas) {
    return { status: 'patuh', label: 'Sudah diisi', warna: 'hijau' };
  }

  // Belum ada aktivitas, cek periode masih aktif atau udah lewat
  if (sekarang < periode.tanggalMulai) {
    return { status: 'belum_mulai', label: 'Belum dimulai', warna: 'abu' };
  }

  if (sekarang >= periode.tanggalMulai && sekarang <= periode.tanggalSelesai) {
    return { status: 'menunggu', label: 'Menunggu pengisian', warna: 'kuning' };
  }

  return { status: 'tidak_patuh', label: 'Belum diisi', warna: 'merah' };
}

module.exports = {
  ambilSettings,
  hitungPeriodeBulanIni,
  dalamPeriodeAktif,
  punyaUnlockAktif,
  bolehInputBarang,
  statusKepatuhanPj,
};