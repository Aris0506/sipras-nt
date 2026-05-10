// =====================================================
// SIPRAS-NT — PDF Generator (PDFKit)
// 3 jenis laporan: Per Ruangan, Rekap, Riwayat Perbaikan
// Dirancang clean, readable, professional
// =====================================================
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const PATH_LOGO = path.join(__dirname, '..', '..', 'public', 'img', 'logo.png');
const PATH_LOGO_SMK = path.join(__dirname, '..', '..', 'public', 'img', 'SMK.png'); // <-- Sesuaikan nama filenya

// --- Konstanta layout ---
const MARGIN_X = 45;
const PAGE_WIDTH = 595.28; // A4 width in pt
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2; // 505 pt

// =====================================================
// HEADER (kop surat)
// =====================================================
function gambarHeader(doc, judulLaporan) {
  const startY = 35;
  const logoSize = 65; // Ukuran logo kiri

  // Logo Kiri (Yasinat)
  if (fs.existsSync(PATH_LOGO)) {
    try {
      doc.image(PATH_LOGO, MARGIN_X, startY, { width: logoSize, height: logoSize });
    } catch (e) {}
  }

  // Logo Kanan (SMK BISA) - Kita gedein lebarnya
  const rightLogoWidth = 95; // Diset lebih lebar dari logo kiri biar visually balance
  const rightLogoX = MARGIN_X + CONTENT_WIDTH - rightLogoWidth;
  
  if (fs.existsSync(PATH_LOGO_SMK)) {
    try {
      // Gak usah pake parameter 'height', biar PDFKit nge-scale proporsional otomatis
      // startY ditambah dikit (misal + 8) biar posisinya nyenter ke tengah vertikal
      doc.image(PATH_LOGO_SMK, rightLogoX, startY, { width: rightLogoWidth }); 
    } catch (e) {}
  }

  // Teks header (diapit 2 logo)
  const paddingLogo = 15;
  const textX = MARGIN_X + logoSize + paddingLogo;
  // Kurangin lebar dari logo kiri dan logo kanan yang baru
  const textWidth = CONTENT_WIDTH - logoSize - rightLogoWidth - (paddingLogo * 2);
  
  // Yayasan
  doc
    .font('Times-Bold')
    .fontSize(10)
    .fillColor('#16A34A')
    .text('YAYASAN ISLAM NAHDLATUTH THALABAH (YASINAT)', textX, startY + 2, {
      width: textWidth,
      align: 'center', // <-- Tambahin ini
    });

  // Nama sekolah
  doc
    .font('Times-Bold')
    .fontSize(17)
    .fillColor('#000000')
    .text('SMK NAHDLATUTH THALABAH', textX, startY + 16, {
      width: textWidth,
      characterSpacing: 0.4,
      align: 'center', // <-- Tambahin ini
    });

  // Jurusan
  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor('#000000')
    .text('TEKNIK KOMPUTER JARINGAN - MULTIMEDIA', textX, startY + 37, {
      width: textWidth,
      align: 'center', // <-- Tambahin ini
    });

  // NSS NPSN
  doc
    .fontSize(7.5)
    .fillColor('#444444')
    .text('NSS : 342052405268  -  NPSN : 20558760', textX, startY + 49, {
      width: textWidth,
      align: 'center', // <-- Tambahin ini
    });

  // Alamat (1 baris)
  doc.text(
    'Jl. K.H. Imam Bukhori, Desa Kesilir, Kec. Wuluhan, Kab. Jember, Jawa Timur — 68162',
    textX,
    startY + 59,
    { width: textWidth, align: 'center' } // <-- Tambahin ini
  );

  // Kontak
  doc.text(
    '(0336) 881 400  |  0811 3787 400  |  smkyasinat@yahoo.co.id  |  smkyasinat.sch.id',
    textX,
    startY + 69,
    { width: textWidth, align: 'center' } // <-- Tambahin ini
  );

  // Garis hijau + kuning (signature visual)
  const garisY = startY + logoSize + 18;

  doc
    .moveTo(MARGIN_X, garisY)
    .lineTo(MARGIN_X + CONTENT_WIDTH, garisY)
    .lineWidth(2.5)
    .strokeColor('#16A34A')
    .stroke();

  doc
    .moveTo(MARGIN_X, garisY + 4)
    .lineTo(MARGIN_X + CONTENT_WIDTH, garisY + 4)
    .lineWidth(1.2)
    .strokeColor('#FBBF24')
    .stroke();

  // Judul laporan (extra spacing dari garis)
  doc
    .font('Times-Bold')
    .fontSize(13)
    .fillColor('#000000')
    .text(judulLaporan, MARGIN_X, garisY + 22, {
      width: CONTENT_WIDTH,
      align: 'center',
      characterSpacing: 0.3,
    });

  // Reset cursor untuk konten (extra padding bottom)
  doc.y = garisY + 50;
  doc.x = MARGIN_X;
}

// =====================================================
// FOOTER (tanggal cetak + halaman + waka)
// =====================================================
function gambarFooter(doc, namaWaka) {
  const range = doc.bufferedPageRange();
  const totalHal = range.count;

  for (let i = 0; i < totalHal; i++) {
    doc.switchToPage(range.start + i);

    const bottomY = doc.page.height - 45;

    // Garis pemisah
    doc
      .moveTo(MARGIN_X, bottomY - 8)
      .lineTo(MARGIN_X + CONTENT_WIDTH, bottomY - 8)
      .lineWidth(0.5)
      .strokeColor('#E5E7EB')
      .stroke();

    const tanggal = new Date().toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    const jam = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit',
    });

    doc
      .font('Helvetica')
      .fontSize(7.5)
      .fillColor('#6B7280')
      .text(`Dicetak: ${tanggal} pukul ${jam} WIB`, MARGIN_X, bottomY, { width: 220 });

    doc.text(`Halaman ${i + 1} dari ${totalHal}`, MARGIN_X + 220, bottomY, {
      width: 100,
      align: 'center',
    });

    if (namaWaka) {
      doc.text(
        `Oleh: ${namaWaka}`,
        MARGIN_X + 320,
        bottomY,
        { width: CONTENT_WIDTH - 320, align: 'right' }
      );
    }
  }
}

// =====================================================
// TANDA TANGAN
// =====================================================
function gambarTandaTangan(doc, namaWaka) {
  // Pastikan ada cukup ruang. Kalau nggak, page break.
  const tinggiTtd = 95;
  if (doc.y > doc.page.height - tinggiTtd - 60) {
    doc.addPage();
    doc.y = 50;
  }

  // Padding dari konten sebelumnya
  doc.y += 15;

  const tanggalCetak = new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  // Posisi: kanan
  const ttdX = MARGIN_X + CONTENT_WIDTH - 180;
  const ttdWidth = 180;

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#000000')
    .text(`Jember, ${tanggalCetak}`, ttdX, doc.y, { width: ttdWidth, align: 'center' });

  doc.text('Waka Sarana dan Prasarana,', ttdX, doc.y + 2, {
    width: ttdWidth, align: 'center',
  });

  // Spacing untuk ttd manual
  doc.y += 50;

  doc
    .font('Times-Bold')
    .fontSize(10.5)
    .text(`( ${namaWaka || '_______________'} )`, ttdX, doc.y, {
      width: ttdWidth, align: 'center',
    });

  // Garis tipis di bawah nama
  doc.y += 14;
}

// =====================================================
// TABEL
// =====================================================
function gambarTabel(doc, kolom, baris) {
  const startX = MARGIN_X;
  const tinggiHeader = 28;
  const tinggiBaris = 24;
  const paddingX = 7;
  const lebarTotal = CONTENT_WIDTH;

  // Validasi total lebar kolom
  const totalLebarKolom = kolom.reduce((sum, k) => sum + k.lebar, 0);
  if (Math.abs(totalLebarKolom - lebarTotal) > 5) {
    console.warn(
      `[pdfGenerator] Total lebar kolom (${totalLebarKolom}) tidak match dengan lebar konten (${lebarTotal})`
    );
  }

  let cursorY = doc.y;

  // --- Helper: gambar header tabel ---
  function gambarHeaderTabel(y) {
    doc.rect(startX, y, lebarTotal, tinggiHeader)
      .fillColor('#16A34A')
      .fill();

    doc.font('Times-Bold').fontSize(8.5).fillColor('#FFFFFF');
    let cx = startX;
    kolom.forEach((kol) => {
      doc.text(kol.label, cx + paddingX, y + 10, {
        width: kol.lebar - paddingX * 2,
        align: kol.align || 'left',
        lineBreak: false,
      });
      cx += kol.lebar;
    });
  }

  gambarHeaderTabel(cursorY);
  cursorY += tinggiHeader;

  // --- Body ---
  doc.font('Helvetica').fontSize(9).fillColor('#000000');

  baris.forEach((row, idx) => {
    // Page break check
    if (cursorY + tinggiBaris > doc.page.height - 100) {
      doc.addPage();
      cursorY = 50;
      gambarHeaderTabel(cursorY);
      cursorY += tinggiHeader;
      doc.font('Helvetica').fontSize(9).fillColor('#000000');
    }

    // Zebra striping
    if (idx % 2 === 1) {
      doc.rect(startX, cursorY, lebarTotal, tinggiBaris)
        .fillColor('#F9FAFB')
        .fill();
    }

    // Border baris (tipis)
    doc.rect(startX, cursorY, lebarTotal, tinggiBaris)
      .strokeColor('#E5E7EB')
      .lineWidth(0.4)
      .stroke();

    // Isi kolom
    doc.fillColor('#1F2937');
    let cx = startX;
    kolom.forEach((kol) => {
      const nilai = kol.formatter ? kol.formatter(row) : row[kol.key];
      const display = nilai === null || nilai === undefined || nilai === '' ? '-' : String(nilai);

      doc.text(display, cx + paddingX, cursorY + 8, {
        width: kol.lebar - paddingX * 2,
        align: kol.align || 'left',
        lineBreak: false,
        ellipsis: true,
      });
      cx += kol.lebar;
    });

    cursorY += tinggiBaris;
  });

  doc.y = cursorY + 12;
}

// =====================================================
// LAPORAN 1: Per Ruangan
// =====================================================
// function buatLaporanPerRuangan(stream, { ruangan, daftarBarang, namaWaka }) {
//   const doc = new PDFDocument({
//     size: 'A4', margin: MARGIN_X, bufferPages: true,
//     info: {
//       Title: `Laporan Inventaris Ruangan ${ruangan.namaRuangan}`,
//       Author: namaWaka || 'Waka Sarpras',
//       Creator: 'SIPRAS-NT',
//     },
//   });
  function buatLaporanPerRuangan(stream, { ruangan, daftarBarang, namaWaka }) {
  const doc = new PDFDocument({
    size: 'A4', 
    margins: { top: MARGIN_X, bottom: 20, left: MARGIN_X, right: MARGIN_X }, 
    bufferPages: true,
    info: {
      Title: `Laporan Inventaris Ruangan ${ruangan.namaRuangan}`,
      Author: namaWaka || 'Waka Sarpras',
      Creator: 'SIPRAS-NT',
    },
  });
  // ... lanjut kode aslinya
  doc.pipe(stream);

  gambarHeader(doc, 'LAPORAN INVENTARIS PER RUANGAN');

  // Info ruangan (2 kolom)
  const infoY = doc.y;
  const labelW = 110;
  const valueW = 200;

  doc.font('Helvetica').fontSize(10).fillColor('#000000');

  const baris = [
    ['Nama Ruangan', ruangan.namaRuangan],
    ['Kode Ruangan', ruangan.kodeRuangan],
    ['Penanggung Jawab', ruangan.pj?.nama || '— Belum ditetapkan —'],
  ];

  const jumlahBaik = daftarBarang.filter((b) => b.kondisi === 'baik').length;
  const jumlahRusak = daftarBarang.filter((b) => b.kondisi === 'rusak').length;
  baris.push([
    'Total Barang',
    `${daftarBarang.length} item  (${jumlahBaik} baik, ${jumlahRusak} rusak)`,
  ]);

  baris.forEach((row, i) => {
    const y = infoY + i * 16;
    doc.font('Times-Bold').text(row[0], MARGIN_X, y, { width: labelW });
    doc.font('Helvetica').text(`: ${row[1]}`, MARGIN_X + labelW, y, { width: valueW });
  });

  doc.y = infoY + baris.length * 16 + 18;

  // Tabel barang
  if (daftarBarang.length === 0) {
    doc.font('Times-Italic').fontSize(10).fillColor('#6B7280')
      .text('Belum ada barang di ruangan ini.', MARGIN_X, doc.y, {
        width: CONTENT_WIDTH, align: 'center',
      });
    doc.y += 20;
  } else {
    // Cek apakah ada data keterangan — kalau tidak ada, hilangkan kolomnya
    const adaKeterangan = daftarBarang.some((b) => b.keterangan && b.keterangan.trim());

    let kolom;
    if (adaKeterangan) {
      kolom = [
        { label: 'No', key: 'no', lebar: 30, align: 'center' },
        { label: 'Kode Barang', key: 'kodeBarang', lebar: 100 },
        { label: 'Nama Barang', key: 'namaBarang', lebar: 145 },
        { label: 'Kategori', key: 'kategori', lebar: 75 },
        { label: 'Jml', key: 'jumlah', lebar: 35, align: 'center' },
        { label: 'Kondisi', key: 'kondisi', lebar: 55, align: 'center',
          formatter: (row) => row.kondisi === 'baik' ? 'Baik' : 'Rusak' },
        { label: 'Keterangan', key: 'keterangan', lebar: 65 },
      ];
    } else {
      kolom = [
        { label: 'No', key: 'no', lebar: 35, align: 'center' },
        { label: 'Kode Barang', key: 'kodeBarang', lebar: 115 },
        { label: 'Nama Barang', key: 'namaBarang', lebar: 175 },
        { label: 'Kategori', key: 'kategori', lebar: 95 },
        { label: 'Jml', key: 'jumlah', lebar: 40, align: 'center' },
        { label: 'Kondisi', key: 'kondisi', lebar: 45, align: 'center',
          formatter: (row) => row.kondisi === 'baik' ? 'Baik' : 'Rusak' },
      ];
    }

    const dataBaris = daftarBarang.map((b, i) => ({
      no: i + 1,
      kodeBarang: b.kodeBarang,
      namaBarang: b.namaBarang,
      kategori: b.kategori,
      jumlah: b.jumlah,
      kondisi: b.kondisi,
      keterangan: b.keterangan || '',
    }));

    gambarTabel(doc, kolom, dataBaris);
  }

  // Tanda tangan
  gambarTandaTangan(doc, namaWaka);

  // Footer
  gambarFooter(doc, namaWaka);
  doc.end();
}

// =====================================================
// LAPORAN 2: Rekap Inventaris Sekolah
// =====================================================
// function buatLaporanRekap(stream, { rekapPerRuangan, totalBarang, totalRusak, totalRuangan, namaWaka }) {
//   const doc = new PDFDocument({
//     size: 'A4', margin: MARGIN_X, bufferPages: true,
//     info: {
//       Title: 'Laporan Rekap Inventaris Sekolah',
//       Author: namaWaka || 'Waka Sarpras',
//       Creator: 'SIPRAS-NT',
//     },
//   });
function buatLaporanRekap(stream, { rekapPerRuangan, totalBarang, totalRusak, totalRuangan, namaWaka }) {
  const doc = new PDFDocument({
    size: 'A4', 
    margins: { top: MARGIN_X, bottom: 20, left: MARGIN_X, right: MARGIN_X }, 
    bufferPages: true,
    info: {
      Title: 'Laporan Rekap Inventaris Sekolah',
      Author: namaWaka || 'Waka Sarpras',
      Creator: 'SIPRAS-NT',
    },
  });
  doc.pipe(stream);

  gambarHeader(doc, 'REKAP INVENTARIS SEKOLAH');

  // A. Ringkasan
  doc.font('Times-Bold').fontSize(11).fillColor('#000000')
    .text('A. Ringkasan', MARGIN_X, doc.y);
  doc.y += 8;

  const ringkasanY = doc.y;
  const labelW = 130;
  doc.font('Helvetica').fontSize(10);

  const ringkasan = [
    ['Total Ruangan', `${totalRuangan} ruangan`, '#000000'],
    ['Total Barang', `${totalBarang} item`, '#000000'],
    ['Barang Rusak', `${totalRusak} item`, totalRusak > 0 ? '#DC2626' : '#16A34A'],
  ];

  ringkasan.forEach((row, i) => {
    const y = ringkasanY + i * 16;
    doc.font('Times-Bold').fillColor('#000000')
      .text(row[0], MARGIN_X + 20, y, { width: labelW });
    doc.font('Helvetica').fillColor(row[2])
      .text(`: ${row[1]}`, MARGIN_X + 20 + labelW, y, { width: 200 });
  });

  doc.y = ringkasanY + ringkasan.length * 16 + 20;
  doc.fillColor('#000000');

  // B. Tabel rekap
  doc.font('Times-Bold').fontSize(11)
    .text('B. Rekap Per Ruangan', MARGIN_X, doc.y);
  doc.y += 8;

  if (rekapPerRuangan.length === 0) {
    doc.font('Times-Italic').fontSize(10).fillColor('#6B7280')
      .text('Belum ada data ruangan.', MARGIN_X, doc.y, {
        width: CONTENT_WIDTH, align: 'center',
      });
    doc.y += 20;
  } else {
    // const kolom = [
    //   { label: 'No', key: 'no', lebar: 35, align: 'center' },
    //   { label: 'Kode', key: 'kodeRuangan', lebar: 75 },
    //   { label: 'Nama Ruangan', key: 'namaRuangan', lebar: 165 },
    //   { label: 'Penanggung Jawab', key: 'pj', lebar: 130,
    //     formatter: (row) => row.pj || '— Belum ditetapkan —' },
    //   { label: 'Jml Barang', key: 'jumlahBarang', lebar: 60, align: 'center' },
    //   { label: 'Rusak', key: 'jumlahRusak', lebar: 40, align: 'center' },
    // ];
    const kolom = [
      { label: 'No', key: 'no', lebar: 30, align: 'center' }, // Kurangin 5
      { label: 'Kode', key: 'kodeRuangan', lebar: 70 },       // Kurangin 5
      { label: 'Nama Ruangan', key: 'namaRuangan', lebar: 165 }, // Tetap
      { label: 'Penanggung Jawab', key: 'pj', lebar: 125,     // Kurangin 5
        formatter: (row) => row.pj || '— Belum ditetapkan —' },
      { label: 'Jml Barang', key: 'jumlahBarang', lebar: 75, align: 'center' }, // Tambahin 15 biar lega
      { label: 'Rusak', key: 'jumlahRusak', lebar: 40, align: 'center' }, // Tetap
    ];

    const baris = rekapPerRuangan.map((r, i) => ({
      no: i + 1,
      kodeRuangan: r.kodeRuangan,
      namaRuangan: r.namaRuangan,
      pj: r.pj?.nama,
      jumlahBarang: r.jumlahBarang,
      jumlahRusak: r.jumlahRusak,
    }));

    gambarTabel(doc, kolom, baris);
  }

  gambarTandaTangan(doc, namaWaka);
  gambarFooter(doc, namaWaka);
  doc.end();
}

// =====================================================
// LAPORAN 3: Riwayat Perbaikan
// =====================================================
// function buatLaporanRiwayatPerbaikan(stream, { daftarLog, namaWaka, periode }) {
//   const doc = new PDFDocument({
//     size: 'A4', margin: MARGIN_X, bufferPages: true,
//     info: {
//       Title: 'Laporan Riwayat Perbaikan',
//       Author: namaWaka || 'Waka Sarpras',
//       Creator: 'SIPRAS-NT',
//     },
//   });
function buatLaporanRiwayatPerbaikan(stream, { daftarLog, namaWaka, periode }) {
  const doc = new PDFDocument({
    size: 'A4', 
    margins: { top: MARGIN_X, bottom: 20, left: MARGIN_X, right: MARGIN_X }, 
    bufferPages: true,
    info: {
      Title: 'Laporan Riwayat Perbaikan',
      Author: namaWaka || 'Waka Sarpras',
      Creator: 'SIPRAS-NT',
    },
  });
  doc.pipe(stream);

  gambarHeader(doc, 'LAPORAN RIWAYAT PERBAIKAN BARANG');

  // Periode
  if (periode) {
    doc.font('Helvetica').fontSize(9.5).fillColor('#6B7280')
      .text(`Periode: ${periode}`, MARGIN_X, doc.y, {
        width: CONTENT_WIDTH, align: 'center',
      });
    doc.y += 18;
  }

  // Tabel
  if (daftarLog.length === 0) {
    doc.font('Times-Italic').fontSize(10).fillColor('#6B7280')
      .text('Belum ada riwayat perbaikan dalam periode ini.', MARGIN_X, doc.y, {
        width: CONTENT_WIDTH, align: 'center',
      });
    doc.y += 20;
  } else {
    // const kolom = [
    //   { label: 'No', key: 'no', lebar: 30, align: 'center' },
    //   { label: 'Kode Barang', key: 'kodeBarang', lebar: 95 },
    //   { label: 'Nama Barang', key: 'namaBarang', lebar: 130 },
    //   { label: 'Ruangan', key: 'ruangan', lebar: 90 },
    //   { label: 'Tgl Lapor', key: 'tglLapor', lebar: 65, align: 'center' },
    //   { label: 'Tgl Selesai', key: 'tglSelesai', lebar: 65, align: 'center' },
    //   { label: 'Penindak', key: 'penindak', lebar: 30 },
    // ];
    const kolom = [
      { label: 'No', key: 'no', lebar: 30, align: 'center' }, // Tetap
      { label: 'Kode Barang', key: 'kodeBarang', lebar: 85 }, // Kurangin 10
      { label: 'Nama Barang', key: 'namaBarang', lebar: 110 }, // Kurangin 20
      { label: 'Ruangan', key: 'ruangan', lebar: 85 }, // Kurangin 5
      { label: 'Tgl Lapor', key: 'tglLapor', lebar: 60, align: 'center' }, // Kurangin 5
      { label: 'Tgl Selesai', key: 'tglSelesai', lebar: 65, align: 'center' }, // Tetap (judulnya agak panjang)
      { label: 'Penindak', key: 'penindak', lebar: 70 }, // Tambahin 40 pt!
    ];

    const baris = daftarLog.map((log, i) => ({
      no: i + 1,
      kodeBarang: log.barang.kodeBarang,
      namaBarang: log.barang.namaBarang,
      ruangan: log.barang.ruangan.namaRuangan,
      tglLapor: new Date(log.tanggalLapor).toLocaleDateString('id-ID', {
        day: '2-digit', month: '2-digit', year: '2-digit',
      }),
      tglSelesai: log.tanggalSelesai
        ? new Date(log.tanggalSelesai).toLocaleDateString('id-ID', {
            day: '2-digit', month: '2-digit', year: '2-digit',
          })
        : '-',
      penindak: log.penindak?.nama || '-',
    }));

    gambarTabel(doc, kolom, baris);
  }

  gambarTandaTangan(doc, namaWaka);
  gambarFooter(doc, namaWaka);
  doc.end();
}

module.exports = {
  buatLaporanPerRuangan,
  buatLaporanRekap,
  buatLaporanRiwayatPerbaikan,
};