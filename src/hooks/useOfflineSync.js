// ============================================================
// hooks/useOfflineSync.js — Sync IndexedDB queue ke server
// ============================================================
import { useEffect, useCallback, useState } from 'react';
import { absensiDB } from '../lib/localDB';

// Lazy import IndexedDB untuk cegah crash saat init
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const syncQueue = useCallback(async () => {
    if (!navigator.onLine) return;
    try {
      const pending = await safeGetPending();
      if (pending.length === 0) return;

      // Batch insert ke localStorage (pengganti Supabase)
      const batches = [];
      for (let i = 0; i < pending.length; i += 10) {
        batches.push(pending.slice(i, i + 10));
      }
      const syncedIds = [];
      for (const batch of batches) {
        absensiDB.bulkCreate(batch.map(b => ({
          siswa_id: b.siswa_id, sesi_id: b.sesi_id,
          tanggal: b.tanggal, waktu_scan: b.waktu_scan,
          status: b.status || 'hadir', catatan: b.catatan || '',
        })));
        syncedIds.push(...batch.map(b => b.id));
      }
      await safeMarkSynced(syncedIds);
      const count = await safeGetQueueCount();
      setQueueCount(count);
    } catch (e) {
      console.warn('syncQueue error:', e);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); syncQueue(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Sync setiap 30 detik
    const interval = setInterval(syncQueue, 30000);

    // Init queue count
    safeGetQueueCount().then(setQueueCount).catch(() => {});

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [syncQueue]);

  return { isOnline, queueCount, syncQueue };
}
