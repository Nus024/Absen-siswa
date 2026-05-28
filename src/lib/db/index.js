// ============================================================
// lib/db/index.js — Re-export semua services dengan nama
// yang kompatibel dengan pola lama (xxxDB)
// ============================================================
export { kelasService  as kelasDB  } from './kelas';
export { siswaService  as siswaDB  } from './siswa';
export { sesiService   as sesiDB   } from './sesi';
export { absensiService as absensiDB } from './absensi';
export { izinService   as izinDB   } from './izin';
export { usersService  as usersDB  } from './users';
