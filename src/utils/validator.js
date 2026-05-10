// =====================================================
// SIPRAS-NT — Validator Helper
// =====================================================

function wajibAda(value, namaField) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${namaField} wajib diisi.`;
  }
  return null;
}

function panjangMinMax(value, min, max, namaField) {
  const len = String(value || '').trim().length;
  if (len < min) return `${namaField} minimal ${min} karakter.`;
  if (len > max) return `${namaField} maksimal ${max} karakter.`;
  return null;
}

function angkaPositif(value, namaField) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return `${namaField} harus berupa angka non-negatif.`;
  return null;
}

/**
 * Generate kode barang otomatis dengan format: {KODE_RUANGAN}-{NOMOR_URUT_3_DIGIT}
 * Contoh: LAB-01-001, LAB-01-002, KLS-XA-001
 *
 * @param {Object} prisma - Prisma client instance
 * @param {string} kodeRuangan - kode ruangan (e.g., "LAB-01")
 * @returns {Promise<string>} - kode barang baru
 */
async function generateKodeBarang(prisma, kodeRuangan) {
  // Cari kode barang terakhir di ruangan ini dengan prefix yang sama
  const prefix = `${kodeRuangan}-`;
  const barangTerakhir = await prisma.barang.findFirst({
    where: {
      kodeBarang: { startsWith: prefix },
    },
    orderBy: { kodeBarang: 'desc' },
    select: { kodeBarang: true },
  });

  let nomorUrut = 1;
  if (barangTerakhir) {
    // Ekstrak nomor dari kode terakhir, contoh "LAB-01-007" → 7
    const match = barangTerakhir.kodeBarang.match(/-(\d+)$/);
    if (match) {
      nomorUrut = parseInt(match[1], 10) + 1;
    }
  }

  // Format jadi 3 digit: 001, 002, ..., 999, 1000
  const nomor = String(nomorUrut).padStart(3, '0');
  return `${prefix}${nomor}`;
}

module.exports = { wajibAda, panjangMinMax, angkaPositif, generateKodeBarang };
