export const GAS_CODE_GS = `/**
 * ==============================================================================
 * SISTEM PENDATAAN PERPUSTAKAAN DDC & QR CODE (GOOGLE APPS SCRIPT BACKEND)
 * ==============================================================================
 * Petunjuk Pemasangan:
 * 1. Buka Google Spreadsheet baru (atau spreadsheet perpustakaan Anda).
 * 2. Klik menu 'Ekstensi' (Extensions) > 'Apps Script'.
 * 3. Hapus seluruh kode default di editor, lalu paste seluruh isi skrip ini.
 * 4. Klik tombol 'Terapkan' (Deploy) di kanan atas > 'Penerapan Baru' (New Deployment).
 * 5. Pilih jenis: 'Aplikasi Web' (Web App).
 *    - Deskripsi: Sistem Perpustakaan DDC
 *    - Jalankan sebagai (Execute as): 'Saya' (Me)
 *    - Siapa yang memiliki akses (Who has access): 'Siapa saja' (Anyone)
 * 6. Klik 'Terapkan' (Deploy) dan salin URL Aplikasi Web (Web App URL).
 * 7. Tempelkan URL tersebut ke aplikasi ini pada menu 'Pengaturan Google Sheets'.
 * ==============================================================================
 */

const SHEET_NAME = 'Katalog_Buku';

// Inisialisasi Header Kolom Standar
const HEADERS = [
  'ID Buku',
  'Judul Buku',
  'Pengarang',
  'Ringkasan Penulis',
  'Ringkasan/Sinopsis Buku',
  'Kualitas Cetakan',
  'Kode DDC',
  'Kategori DDC',
  'Tahun Terbit',
  'URL Gambar Sampul',
  'Tanggal Input'
];

/**
 * Mendapatkan lembar kerja aktif atau membuatnya jika belum ada
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Format header
    sheet.appendRow(HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground('#1e293b');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    
    // Auto-fit lebar kolom
    for (let i = 1; i <= HEADERS.length; i++) {
      sheet.setColumnWidth(i, i === 2 || i === 5 ? 260 : 150);
    }
  }
  return sheet;
}

/**
 * Endpoint GET: Mengambil seluruh data buku dalam format JSON
 * atau menampilkan web app jika dibuka di browser
 */
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    // Jika hanya ada header
    if (data.length <= 1) {
      return createJsonResponse({
        status: 'success',
        message: 'Database siap, belum ada data buku.',
        total: 0,
        data: []
      });
    }

    const rows = data.slice(1);
    const books = rows.map(function(row) {
      return {
        id: String(row[0] || ''),
        title: String(row[1] || ''),
        author: String(row[2] || ''),
        authorSummary: String(row[3] || ''),
        synopsis: String(row[4] || ''),
        printQuality: String(row[5] || ''),
        ddcCode: String(row[6] || ''),
        ddcCategory: String(row[7] || ''),
        publicationYear: Number(row[8]) || new Date().getFullYear(),
        coverUrl: String(row[9] || ''),
        createdAt: row[10] ? new Date(row[10]).toISOString() : new Date().toISOString()
      };
    }).filter(function(b) { return b.id !== ''; });

    return createJsonResponse({
      status: 'success',
      total: books.length,
      data: books
    });
  } catch (error) {
    return createJsonResponse({
      status: 'error',
      message: error.toString()
    });
  }
}

/**
 * Endpoint POST: Menambah, Memperbarui, atau Menghapus buku
 */
function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    let payload = {};

    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action;

    // 1. TAMBAH BUKU BARU
    if (action === 'create' || action === 'add') {
      const book = payload.book;
      if (!book || !book.id || !book.title) {
        throw new Error('Data buku tidak lengkap: ID dan Judul wajib diisi.');
      }

      sheet.appendRow([
        book.id,
        book.title,
        book.author || '',
        book.authorSummary || '',
        book.synopsis || '',
        book.printQuality || '',
        book.ddcCode || '',
        book.ddcCategory || '',
        book.publicationYear || new Date().getFullYear(),
        book.coverUrl || '',
        book.createdAt || new Date().toISOString()
      ]);

      return createJsonResponse({
        status: 'success',
        message: 'Buku berhasil disimpan ke Google Sheets.',
        id: book.id
      });
    }

    // 2. PERBARUI BUKU
    if (action === 'update') {
      const book = payload.book;
      const data = sheet.getDataRange().getValues();
      let rowIndex = -1;

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(book.id)) {
          rowIndex = i + 1; // 1-based index di Google Sheets
          break;
        }
      }

      if (rowIndex === -1) {
        throw new Error('Buku dengan ID ' + book.id + ' tidak ditemukan.');
      }

      sheet.getRange(rowIndex, 1, 1, HEADERS.length).setValues([[
        book.id,
        book.title,
        book.author || '',
        book.authorSummary || '',
        book.synopsis || '',
        book.printQuality || '',
        book.ddcCode || '',
        book.ddcCategory || '',
        book.publicationYear || new Date().getFullYear(),
        book.coverUrl || '',
        book.updatedAt || new Date().toISOString()
      ]]);

      return createJsonResponse({
        status: 'success',
        message: 'Data buku berhasil diperbarui.',
        id: book.id
      });
    }

    // 3. HAPUS BUKU
    if (action === 'delete') {
      const bookId = payload.id;
      const data = sheet.getDataRange().getValues();
      let rowIndex = -1;

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(bookId)) {
          rowIndex = i + 1;
          break;
        }
      }

      if (rowIndex === -1) {
        throw new Error('Buku dengan ID ' + bookId + ' tidak ditemukan.');
      }

      sheet.deleteRow(rowIndex);
      return createJsonResponse({
        status: 'success',
        message: 'Buku dengan ID ' + bookId + ' berhasil dihapus dari Google Sheets.'
      });
    }

    // 4. SINKRONISASI MASSAL (BATCH SYNC)
    if (action === 'batch_sync') {
      const books = payload.books || [];
      // Bersihkan data lama kecuali header
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }

      if (books.length > 0) {
        const rows = books.map(function(b) {
          return [
            b.id,
            b.title,
            b.author || '',
            b.authorSummary || '',
            b.synopsis || '',
            b.printQuality || '',
            b.ddcCode || '',
            b.ddcCategory || '',
            b.publicationYear || new Date().getFullYear(),
            b.coverUrl || '',
            b.createdAt || new Date().toISOString()
          ];
        });
        sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
      }

      return createJsonResponse({
        status: 'success',
        message: 'Sinkronisasi massal berhasil: ' + books.length + ' buku tersimpan.',
        total: books.length
      });
    }

    throw new Error('Aksi tidak dikenal: ' + action);
  } catch (error) {
    return createJsonResponse({
      status: 'error',
      message: error.toString()
    });
  }
}

/**
 * Format Response JSON dengan CORS Support
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export const GAS_HTML_TEMPLATE = `<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <title>Sistem Perpustakaan DDC</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #1e293b; background: #f8fafc; }
      .container { max-width: 900px; margin: 0 auto; background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
      h1 { color: #0f172a; margin-top: 0; }
      .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; background: #e0f2fe; color: #0369a1; }
    </style>
  </head>
  <body>
    <div class="container">
      <span class="badge">Google Apps Script Endpoint Aktif</span>
      <h1>Katalog Perpustakaan DDC</h1>
      <p>API Endpoint Google Apps Script berhasil terhubung dan siap melayani pertukaran data buku dengan Web App Perpustakaan.</p>
    </div>
  </body>
</html>
`;
