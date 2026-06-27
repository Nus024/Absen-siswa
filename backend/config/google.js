import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const spreadsheetId = process.env.SPREADSHEET_ID;
const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH || './credentials/credentials.json';

// Resolving path secara cerdas agar tidak bergantung pada lokasi start-up terminal
let absoluteKeyPath = path.isAbsolute(keyPath) ? keyPath : path.resolve(process.cwd(), keyPath);

if (!fs.existsSync(absoluteKeyPath) && !path.isAbsolute(keyPath)) {
  // Coba naik satu tingkat (jika dijalankan dari dalam subdirektori /backend)
  const fallbackParent = path.resolve(process.cwd(), '..', keyPath);
  if (fs.existsSync(fallbackParent)) {
    absoluteKeyPath = fallbackParent;
  }
}

if (!fs.existsSync(absoluteKeyPath) && !path.isAbsolute(keyPath)) {
  // Coba masuk ke subdirektori /backend (jika dijalankan dari workspace root)
  const fallbackSub = path.resolve(process.cwd(), 'backend', keyPath);
  if (fs.existsSync(fallbackSub)) {
    absoluteKeyPath = fallbackSub;
  }
}

let sheets = null;

if (!spreadsheetId) {
  console.warn('\x1b[33m[GOOGLE CONFIG] SPREADSHEET_ID belum dikonfigurasi di .env!\x1b[0m');
} else if (!fs.existsSync(absoluteKeyPath)) {
  console.warn(`\x1b[33m[GOOGLE CONFIG] Berkas kredensial JSON tidak ditemukan di: ${absoluteKeyPath}\x1b[0m`);
} else {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: absoluteKeyPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    sheets = google.sheets({ version: 'v4', auth });
    console.log(`\x1b[32m[GOOGLE CONFIG] API client Google Sheets diinisialisasi dengan kredensial: ${absoluteKeyPath}\x1b[0m`);
  } catch (err) {
    console.error('Gagal menginisialisasi autentikasi Google Sheets:', err.message);
  }
}

export const googleConfig = {
  spreadsheetId,
  sheets,
};
