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

module.exports = { wajibAda, panjangMinMax, angkaPositif };
