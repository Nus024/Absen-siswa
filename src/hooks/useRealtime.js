import { useEffect } from 'react';

/**
 * Polling fallback sebagai pengganti realtime Google Sheets REST API.
 * Mengambil data berkala setiap 10 detik agar tampilan tetap diperbarui secara otomatis.
 */
export function useRealtime(table, onChange, filter = null) {
  useEffect(() => {
    if (!table || !onChange) return;

    const interval = setInterval(() => {
      onChange();
    }, 10000); // Poll setiap 10 detik

    return () => {
      clearInterval(interval);
    };
  }, [table, onChange]);
}

export function useRealtimeMulti(subscriptions, onChange) {
  useEffect(() => {
    if (!subscriptions?.length || !onChange) return;

    const interval = setInterval(() => {
      onChange();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [subscriptions, onChange]);
}
