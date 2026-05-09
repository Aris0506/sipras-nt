// =====================================================
// SIPRAS-NT — Seed Data
// Akun awal: 1 Waka Sarpras (Bu Widiawati)
// PJ Ruangan akan dibuat oleh Waka via UI
// =====================================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Mulai seeding...');

  // --- Akun Waka Sarpras (default password harus diganti saat login pertama) ---
  const passwordHash = await bcrypt.hash('sipras2026', 10);

  const waka = await prisma.pengguna.upsert({
    where: { username: 'waka.sarpras' },
    update: {},
    create: {
      nama: 'Widiawati',
      username: 'waka.sarpras',
      passwordHash,
      role: 'waka_sarpras',
      aktif: true,
    },
  });

  console.log(`✅ Akun Waka Sarpras dibuat: ${waka.username}`);
  console.log(`   Password awal: sipras2026 (WAJIB diganti setelah login pertama)`);

  console.log('🌱 Seeding selesai.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
