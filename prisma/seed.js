// =====================================================
// SIPRAS-NT — Seed Data
// 1 Waka Sarpras (Bu Widiawati) + 31 PJ asli dari SK Sekolah TP 2025/2026
// =====================================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const PASSWORD_DEFAULT = 'sipras2026';

// Daftar 31 PJ dari PDF "DAFTAR NAMA PJ RUANGAN & KEBERSIHAN"
// Format: { kode, nama, username }
// Catatan: Bu Widiawati (kode H) dijadikan Waka Sarpras (role berbeda),
// jadi 30 PJ + 1 Waka.
const DAFTAR_PJ = [
  { kode: 'B', nama: 'Jarot Setyo Bintoro, S.E', username: 'jarot' },
  { kode: 'C', nama: 'Munif Khoil', username: 'munif' },
  { kode: 'D', nama: 'Subur Hariyanto, S.Kom', username: 'subur' },
  { kode: 'E', nama: 'Nurkholis, S.Pd', username: 'nurkholis' },
  { kode: 'G', nama: 'Moh. Waslil Fuad, S.Pd', username: 'waslil' },
  { kode: 'I', nama: 'Khoirul Mukhlisin, S.I.Kom', username: 'khoirul' },
  { kode: 'J', nama: 'Fitria Nur Aisyah, A.Md', username: 'fitria' },
  { kode: 'K', nama: 'Muhammad Ihsan Al-Fadli', username: 'muhammad' },
  { kode: 'L', nama: 'Luthfiatul Hasanah, S.Kom', username: 'luthfiatul' },
  { kode: 'M', nama: 'Khoirun Nisak, S.Si', username: 'khoirun' },
  { kode: 'N', nama: 'Edi Purnomo, S.Pd', username: 'edi' },
  { kode: 'O', nama: 'Nury Ziyadatul Faricha, S.Pd, M.Pd', username: 'faricha' },
  { kode: 'P', nama: 'Imam Badrut Tamam, AH., S.Pd.I', username: 'imam' },
  { kode: 'Q', nama: 'Ghorizatul Latifah, S.PdI', username: 'ghorizatul' },
  { kode: 'R', nama: 'Dhodhik Irawan Sugiarto, S.Pd', username: 'dhodhik' },
  { kode: 'S', nama: 'Angga Widianto, S.Kom', username: 'angga' },
  { kode: 'T', nama: 'Ahmad Fajri Al Hadi', username: 'fajri' },
  { kode: 'U', nama: 'M. Gani Reza, S.Pd', username: 'gani' },
  { kode: 'V', nama: 'Muhammad Asyrofi, S.Pd', username: 'asyrofi' },
  { kode: 'W', nama: 'Susanti Dwi Indra Lestari, S.Pd', username: 'susanti' },
  { kode: 'X', nama: 'Nur Ifadah Imamah, AH.', username: 'ifadah' },
  { kode: 'Y', nama: 'Achmad Junaidi, S.Pd', username: 'junaidi' },
  { kode: 'Z', nama: "Safira Afifatul Mu'arrofah", username: 'safira' },
  { kode: 'AA', nama: 'Farikhatun Nuriyah Ramadani, S.Pd', username: 'farikhatun' },
  { kode: 'AB', nama: 'Ahmad Sudar Syaifulloh, S.Pd', username: 'sudar' },
  { kode: 'AC', nama: 'Ahmad Iqbal Rifqy, S.Pd', username: 'iqbal' },
  { kode: 'AD', nama: 'Inayah Ulandari, S.Pd', username: 'inayah' },
  { kode: 'AE', nama: 'Vina Rohmatul Izza, SH', username: 'vina' },
  { kode: '-', nama: 'Moh. Nashri Farhan', username: 'farhan' },
  { kode: '-', nama: 'Ahmad Ainul Yaqin', username: 'aan' },
];

async function main() {
  console.log('🌱 Mulai seeding...\n');

  const passwordHash = await bcrypt.hash(PASSWORD_DEFAULT, 10);

  // --- 1. Akun Waka Sarpras ---
  const waka = await prisma.pengguna.upsert({
    where: { username: 'widiawati' },
    update: {},
    create: {
      nama: 'Widiawati, S.Pd',
      username: 'widiawati',
      passwordHash,
      role: 'waka_sarpras',
      aktif: true,
    },
  });
  console.log(`✅ Waka Sarpras : ${waka.nama} (${waka.username})`);

  // --- 2. Akun PJ ---
  let countBaru = 0;
  let countSkip = 0;

  for (const pj of DAFTAR_PJ) {
    const sudahAda = await prisma.pengguna.findUnique({
      where: { username: pj.username },
    });

    if (sudahAda) {
      countSkip++;
      continue;
    }

    await prisma.pengguna.create({
      data: {
        nama: pj.nama,
        username: pj.username,
        passwordHash,
        role: 'pj',
        aktif: true,
        dibuatOleh: waka.id,
      },
    });
    countBaru++;
  }

  console.log(`✅ PJ Ruangan  : ${countBaru} akun baru, ${countSkip} di-skip (sudah ada)`);
  console.log(`\n📌 Password awal SEMUA akun: ${PASSWORD_DEFAULT}`);
  console.log(`   Wajib diganti oleh masing-masing user setelah login pertama.`);
  console.log(`\n🌱 Seeding selesai.\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });