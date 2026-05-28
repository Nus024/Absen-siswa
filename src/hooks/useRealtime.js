// ============================================================
// hooks/useRealtime.js — Supabase Realtime subscription hook
// ============================================================
import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Subscribe ke perubahan realtime pada satu tabel Supabase.
 *
 * @param {string}   table    - Nama tabel (e.g. 'absensi')
 * @param {Function} onChange - Callback dipanggil saat ada INSERT/UPDATE/DELETE
 * @param {Object}   filter   - Optional filter: { column, value }
 *
 * Contoh penggunaan:
 *   useRealtime('absensi', () => fetchData(), { column: 'tanggal', value: '2025-01-01' });
 */
export function useRealtime(table, onChange, filter = null) {
  const channelRef = useRef(null);

  useEffect(() => {
    if (!table || !onChange) return;

    const channelName = filter
      ? `realtime:${table}:${filter.column}=${filter.value}`
      : `realtime:${table}`;

    let channel = supabase.channel(channelName);

    const config = {
      event:  '*',
      schema: 'public',
      table,
    };

    if (filter) {
      config.filter = `${filter.column}=eq.${filter.value}`;
    }

    channel = channel.on('postgres_changes', config, (payload) => {
      onChange(payload);
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] subscribed to ${channelName}`);
      }
    });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filter?.column, filter?.value]);
}

/**
 * Subscribe ke beberapa tabel sekaligus.
 * @param {Array<{table: string, filter?: Object}>} subscriptions
 * @param {Function} onChange
 */
export function useRealtimeMulti(subscriptions, onChange) {
  const channelRef = useRef(null);

  useEffect(() => {
    if (!subscriptions?.length || !onChange) return;

    const channelName = `realtime:multi:${subscriptions.map(s => s.table).join('+')}`;
    let channel = supabase.channel(channelName);

    for (const sub of subscriptions) {
      const config = {
        event:  '*',
        schema: 'public',
        table:  sub.table,
      };
      if (sub.filter) {
        config.filter = `${sub.filter.column}=eq.${sub.filter.value}`;
      }
      channel = channel.on('postgres_changes', config, onChange);
    }

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
