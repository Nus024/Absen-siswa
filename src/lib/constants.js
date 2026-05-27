// ============================================================
// lib/constants.js — Konstanta global aplikasi
// ============================================================

export const STATUS_ABSENSI = {
  hadir: { label: 'Hadir', code: 'H', badge: 'badge-H' },
  izin:  { label: 'Izin',  code: 'I', badge: 'badge-I' },
  sakit: { label: 'Sakit', code: 'S', badge: 'badge-S' },
  alpha: { label: 'Alpha', code: 'A', badge: 'badge-A' },
  dispensasi: { label: 'Dispensasi', code: 'D', badge: 'badge-D' },
};

export const ROLES = {
  admin:      { label: 'Administrator', canScan: true, canEdit: true, canAdmin: true },
  tu:         { label: 'Petugas TU',   canScan: true, canEdit: false, canAdmin: false },
  wali_kelas: { label: 'Wali Kelas',   canScan: false, canEdit: true, canAdmin: false },
  viewer:     { label: 'Viewer',        canScan: false, canEdit: false, canAdmin: false },
};

export const SCAN_MODES = [
  { id: 'absensi', label: '✓ Absensi' },
  { id: 'izin_keluar', label: '↗ Izin Keluar' },
  { id: 'kembali', label: '↙ Kembali' },
];

export const DAYS_ID = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
export const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export function formatTanggal(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatWaktu(isoStr) {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export function todayStr() {
  return new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD
}

export function parseQR(raw) {
  // Format: SISWA:{UUID}
  if (!raw || !raw.startsWith('SISWA:')) return null;
  return raw.replace('SISWA:', '').trim();
}
