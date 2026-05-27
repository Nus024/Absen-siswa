// ============================================================
// lib/indexedDB.js — Offline Queue menggunakan IndexedDB
// Menyimpan scan yang gagal dan disinkronisasi saat online
// ============================================================

const DB_NAME = 'AbsensiOfflineDB';
const DB_VERSION = 2; // Naikkan versi untuk reset schema lama
const STORE_NAME = 'offlineQueue';

let db = null;

export async function openDB() {
  if (db) return db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      // Hapus store lama jika ada (reset schema)
      if (d.objectStoreNames.contains(STORE_NAME)) {
        d.deleteObjectStore(STORE_NAME);
      }
      const store = d.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      // Index dengan integer 0/1 bukan boolean langsung
      store.createIndex('synced', 'synced', { unique: false });
    };
    req.onsuccess = (e) => { db = e.target.result; resolve(db); };
    req.onerror = () => reject(req.error);
  });
}

export async function enqueue(item) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    // Simpan synced sebagai 0 (false) bukan boolean
    const req = store.add({ ...item, synced: 0, queued_at: new Date().toISOString() });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getPending() {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    // Gunakan getAll() lalu filter — paling aman untuk semua browser
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result || []).filter(r => !r.synced));
    req.onerror = () => reject(req.error);
  });
}

export async function markSynced(ids) {
  if (!ids || ids.length === 0) return;
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    let pending = ids.length;
    for (const id of ids) {
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const existing = getReq.result;
        if (existing) {
          store.put({ ...existing, synced: 1, synced_at: new Date().toISOString() });
        }
        pending--;
        if (pending === 0) resolve();
      };
      getReq.onerror = () => { pending--; if (pending === 0) resolve(); };
    }
    tx.onerror = () => reject(tx.error);
  });
}

export async function getQueueCount() {
  try {
    const pending = await getPending();
    return pending.length;
  } catch {
    return 0;
  }
}
