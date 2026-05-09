// =====================================================
// SIPRAS-NT — PDF Generator (PDFKit)
// =====================================================
const PDFDocument = require('pdfkit');

function header(doc, judul) {
  doc.fontSize(14).text('SMKS NAHDLATUTH THALABAH', { align: 'center' });
  doc.fontSize(11).text('Sistem Informasi Inventaris Sarana dan Prasarana', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(13).text(judul, { align: 'center', underline: true });
  doc.moveDown(1);
}

function footer(doc) {
  const tanggal = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  doc.moveDown(2);
  doc.fontSize(10).text(`Dicetak pada: ${tanggal}`, { align: 'right' });
}

function buatLaporanPerRuangan(stream, { ruangan, barang }) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.pipe(stream);

  header(doc, 'LAPORAN INVENTARIS PER RUANGAN');

  if (ruangan) {
    doc.fontSize(11).text(`Nama Ruangan : ${ruangan.namaRuangan}`);
    doc.text(`Kode Ruangan : ${ruangan.kodeRuangan}`);
    doc.text(`Penanggung Jawab : ${ruangan.pj?.nama || '-'}`);
    doc.moveDown();
  }

  // TODO: tabel barang
  doc.fontSize(10).text('Daftar barang akan ditampilkan di sini.');

  footer(doc);
  doc.end();
}

function buatLaporanRekap(stream, { ruangan, totalBarang, totalRusak }) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.pipe(stream);

  header(doc, 'LAPORAN REKAP INVENTARIS SEKOLAH');

  doc.fontSize(11);
  doc.text(`Total Ruangan : ${ruangan.length}`);
  doc.text(`Total Barang  : ${totalBarang}`);
  doc.text(`Barang Rusak  : ${totalRusak}`);
  doc.moveDown();

  // TODO: tabel rekap per ruangan

  footer(doc);
  doc.end();
}

module.exports = { buatLaporanPerRuangan, buatLaporanRekap };
