/**
 * Google Apps Script (code.gs)
 * Absen Digital Siswa - Spreadsheet Database Setup & Seeder (v2.0)
 * 
 * Petunjuk Penggunaan:
 * 1. Buka Google Spreadsheet kosong Anda.
 * 2. Klik menu "Extensions" -> "Apps Script".
 * 3. Hapus kode bawaan, lalu tempel kode di bawah ini.
 * 4. Simpan proyek dengan menekan tombol save (ikon disket).
 * 5. Pilih fungsi "setupSpreadsheet" di toolbar, lalu klik "Run".
 * 6. Berikan izin otorisasi yang diminta (klik Advanced -> Go to ... -> Allow).
 * 7. Spreadsheet Anda siap digunakan oleh Node.js Backend REST API!
 */

function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Konfigurasi skema kolom dan mock data untuk setiap Sheet
  const schema = {
    "SETTINGS": {
      headers: ["KEY", "VALUE"],
      data: [
        ["school_name", "SMA Negeri 1 Jakarta"],
        ["school_logo", "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200"]
      ]
    },
    
    "USERS": {
      headers: ["USER_ID", "USERNAME", "PASSWORD", "NAME", "ROLE", "STATUS", "LAST_LOGIN", "CREATED_AT", "UPDATED_AT"],
      data: [
        // password hash di bawah adalah untuk "admin123" menggunakan bcryptjs
        ["USR000001", "admin", "$2a$10$n8DhTC/p.p9gf7a28T1hzefYJzpOO.wZbjiG.9fEYtIpJhdFr4BDC", "Administrator Utama", "admin", "ACTIVE", "", new Date().toISOString(), new Date().toISOString()],
        // password hash di bawah adalah untuk "pengawas123" menggunakan bcryptjs
        ["USR000002", "pengawas", "$2a$10$BOfUP.NPbXSTSS916TkU9OdAlodcw5MHyAK9ornC7h0LOz2JwA8ca", "Petugas Piket", "pengawas", "ACTIVE", "", new Date().toISOString(), new Date().toISOString()]
      ]
    },
    
    "KELAS": {
      headers: ["KELAS_ID", "TINGKAT", "NAMA", "WALI_KELAS", "STATUS", "CREATED_AT", "UPDATED_AT"],
      data: [
        ["KLS000001", "10", "X IPA 1", "Budi, S.Pd.", "ACTIVE", new Date().toISOString(), new Date().toISOString()],
        ["KLS000002", "10", "X IPA 2", "Siti, M.Pd.", "ACTIVE", new Date().toISOString(), new Date().toISOString()],
        ["KLS000003", "11", "XI IPS 1", "Joko, S.Kom.", "ACTIVE", new Date().toISOString(), new Date().toISOString()],
        ["KLS000004", "12", "XII IPA 1", "Rini, M.Si.", "ACTIVE", new Date().toISOString(), new Date().toISOString()]
      ]
    },
    
    "SISWA": {
      headers: ["SISWA_ID", "NIS", "NAMA", "KELAS_ID", "QR_TOKEN", "QR_VERSION", "QR_STATUS", "LAST_SCAN", "STATUS", "CREATED_AT", "UPDATED_AT"],
      data: [
        ["STD000001", "202410001", "Ahmad Rizki", "KLS000001", "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d", "1", "ACTIVE", "", "ACTIVE", new Date().toISOString(), new Date().toISOString()],
        ["STD000002", "202410002", "Budi Prasetyo", "KLS000001", "b2c3d4e5-f67a-8b9c-0d1e-2f3a4b5c6d7e", "1", "ACTIVE", "", "ACTIVE", new Date().toISOString(), new Date().toISOString()],
        ["STD000003", "202410003", "Cahya Dewi", "KLS000001", "c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f", "1", "ACTIVE", "", "ACTIVE", new Date().toISOString(), new Date().toISOString()],
        ["STD000004", "202410004", "Dian Safitri", "KLS000002", "d4e5f67a-8b9c-0d1e-2f3a-4b5c6d7e8f9a", "1", "ACTIVE", "", "ACTIVE", new Date().toISOString(), new Date().toISOString()],
        ["STD000005", "202411001", "Kevin Andrianto", "KLS000003", "e5f67a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b", "1", "ACTIVE", "", "ACTIVE", new Date().toISOString(), new Date().toISOString()]
      ]
    },
    
    "SESI": {
      headers: ["SESI_ID", "NAMA", "JAM_MULAI", "JAM_SELESAI", "URUTAN", "STATUS"],
      data: [
        ["SES000001", "Masuk Pagi", "06:30", "07:15", "1", "ACTIVE"],
        ["SES000002", "KBM Siang", "12:30", "13:15", "2", "ACTIVE"]
      ]
    },
    
    "ABSENSI": {
      headers: ["ABSENSI_ID", "TANGGAL", "SISWA_ID", "SESI_ID", "STATUS", "WAKTU_SCAN", "PETUGAS", "DEVICE", "SYNC_STATUS", "CATATAN", "CREATED_AT"],
      data: []
    },
    
    "IZIN": {
      headers: ["IZIN_ID", "SISWA_ID", "ALASAN", "WAKTU_KELUAR", "WAKTU_KEMBALI", "STATUS", "PETUGAS", "CATATAN"],
      data: []
    },
    
    "QR_HISTORY": {
      headers: ["ID", "SISWA_ID", "OLD_TOKEN", "NEW_TOKEN", "VERSION", "REASON", "UPDATED_BY", "UPDATED_AT"],
      data: []
    },
    
    "LOGS": {
      headers: ["LOG_ID", "MODULE", "ACTION", "USER", "DESCRIPTION", "IP", "DEVICE", "CREATED_AT"],
      data: []
    },
    
    "SYSTEM": {
      headers: ["KEY", "VALUE"],
      data: [
        ["VERSION", "2.0.0"],
        ["DATABASE_TYPE", "GOOGLE_SHEETS"]
      ]
    }
  };

  // Proses inisialisasi lembar demi lembar
  for (const sheetName in schema) {
    let sheet = ss.getSheetByName(sheetName);
    
    if (sheet) {
      // Hapus konten lama untuk pembersihan/reset seeder
      sheet.clear();
    } else {
      // Buat sheet baru jika belum ada
      sheet = ss.insertSheet(sheetName);
    }
    
    const config = schema[sheetName];
    
    // 1. Tulis Header
    sheet.appendRow(config.headers);
    
    // 2. Format baris Header (Tebal, latar belakang abu-abu terang, text-alignment center)
    const headerRange = sheet.getRange(1, 1, 1, config.headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#f3f3f3");
    headerRange.setHorizontalAlignment("center");
    
    // 3. Tulis Data Awal (Seeder)
    if (config.data.length > 0) {
      sheet.getRange(2, 1, config.data.length, config.headers.length).setValues(config.data);
    }
    
    // 4. Set format text untuk seluruh kolom ID dan Kode agar tidak dikonversi otomatis oleh Excel
    sheet.getRange(2, 1, Math.max(10, config.data.length + 50), 1).setNumberFormat("@");
    
    // 5. Atur lebar kolom otomatis secara individual
    for (let i = 1; i <= config.headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
    
    Logger.log(`Sheet "${sheetName}" berhasil dibuat dengan ${config.data.length} baris data awal.`);
  }
  
  // Hapus sheet default bawaan "Sheet1" jika ada untuk merapikan layout
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet) {
    ss.deleteSheet(defaultSheet);
  }
  
  Browser.msgBox("Sukses", "Spreadsheet Database Absensi berhasil diinisialisasi dan diisi mock data!", Browser.Buttons.OK);
}
