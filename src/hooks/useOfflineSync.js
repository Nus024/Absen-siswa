// ============================================================
// hooks/useOfflineSync.js — Sync IndexedDB queue ke Google Sheets REST API
// ============================================================
import { useEffect, useCallback, useState } from 'react';
import { absensiService } from '../lib/db/absensi';

async function safeGetPending() {
  try {
    const { getPending } = await import('../lib/indexedDB');
    return await getPending();
  } catch (e) {
    console.warn('IndexedDB getPending error:', e);
    return [];
  }
}

async function safeMarkSynced(ids) {
  try {
    const { markSynced } = await import('../lib/indexedDB');
    await markSynced(ids);
  } catch (e) {
    console.warn('IndexedDB markSynced error:', e);
  }
}

async function safeGetQueueCount() {
  try {
    const { getQueueCount } = await import('../lib/indexedDB');
    return await getQueueCount();
  } catch (e) {
    return 0;
  }
}

export function useOfflineSync() {
  const [queueCount, setQueueCount] = useState(0);
  const [isOnline, setIsOnline]     = useState(navigator.onLine);

  const syncQueue = useCallback(async () => {
    if (!navigator.onLine) return;
    try {
      const pending = await safeGetPending();
      if (pending.length === 0) return;

      // Sync ke Google Sheets REST API dalam batch
      const syncedIds = [];
      for (const item of pending) {
        try {
          await absensiService.create({
            siswa_id:   item.siswa_id,
            sesi_id:    item.sesi_id,
            tanggal:    item.tanggal,
            waktu_scan: item.waktu_scan,
            status:     item.status  || 'hadir',
            catatan:    item.catatan || '',
          });
          syncedIds.push(item.id);
        } catch (err) {
          // Skip jika duplicate (conflict), tetap tandai sebagai tersinkron
          if (err?.code === '23505' || err?.message?.includes('sudah melakukan presensi')) {
            syncedIds.push(item.id);
          } else {
            console.warn('Gagal sync item:', item.id, err);
          }
        }
      }

      await safeMarkSynced(syncedIds);
      const count = await safeGetQueueCount();
      setQueueCount(count);
    } catch (e) {
      console.warn('syncQueue error:', e);
    }
  }, []);

  useEffect(() => {
    const handleOnline  = () => { setIsOnline(true); syncQueue(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    const interval = setInterval(syncQueue, 30000);
    safeGetQueueCount().then(setQueueCount).catch(() => {});
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [syncQueue]);

  return { isOnline, queueCount, syncQueue };
}
