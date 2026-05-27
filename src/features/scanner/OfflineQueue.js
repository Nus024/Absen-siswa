// ============================================================
// features/scanner/OfflineQueue.js — IndexedDB queue wrapper
// ============================================================
import { enqueue } from '../../lib/indexedDB';

export async function queueScan(data) {
  return enqueue({
    siswa_id: data.siswa_id,
    sesi_id: data.sesi_id,
    tanggal: data.tanggal,
    waktu_scan: data.waktu_scan,
    status: 'hadir',
    catatan: '',
    mode: data.mode || 'absensi',
  });
}
