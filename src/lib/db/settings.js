// ============================================================
// lib/db/settings.js — App settings via Supabase (sinkron antar perangkat)
// ============================================================
import { supabase } from '../supabase';

/**
 * Tabel `app_settings` di Supabase:
 *   id    TEXT PRIMARY KEY  (misal: 'school_name', 'school_logo')
 *   value TEXT
 *
 * SQL untuk buat tabel (jalankan sekali di Supabase SQL Editor):
 *
 *   CREATE TABLE IF NOT EXISTS app_settings (
 *     id    TEXT PRIMARY KEY,
 *     value TEXT
 *   );
 *   ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "allow_all" ON app_settings FOR ALL USING (true) WITH CHECK (true);
 */

const LS_KEYS = {
  school_name: 'school_name',
  school_logo: 'school_logo',
};

export const settingsService = {
  /** Ambil semua settings sebagai object { school_name, school_logo } */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('id, value');
      if (error) throw error;

      const result = {};
      (data || []).forEach(row => { result[row.id] = row.value; });

      // Sync ke localStorage sebagai cache lokal
      Object.entries(LS_KEYS).forEach(([key]) => {
        if (result[key] !== undefined) {
          if (result[key]) {
            localStorage.setItem(key, result[key]);
          } else {
            localStorage.removeItem(key);
          }
        }
      });

      return result;
    } catch (err) {
      console.warn('[settings] Gagal baca dari Supabase, pakai cache lokal:', err.message);
      // Fallback ke localStorage
      return {
        school_name: localStorage.getItem('school_name') || '',
        school_logo: localStorage.getItem('school_logo') || '',
      };
    }
  },

  /** Ambil satu nilai setting */
  async get(key) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('id', key)
        .maybeSingle();
      if (error) throw error;
      const val = data?.value ?? null;
      // Sync cache
      if (val) localStorage.setItem(key, val);
      else localStorage.removeItem(key);
      return val;
    } catch (err) {
      console.warn('[settings] Gagal get dari Supabase, pakai cache lokal:', err.message);
      return localStorage.getItem(key) || null;
    }
  },

  /** Simpan / update satu setting (upsert) */
  async set(key, value) {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ id: key, value: value ?? '' }, { onConflict: 'id' });
      if (error) throw error;
      // Sync cache
      if (value) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
    } catch (err) {
      console.warn('[settings] Gagal simpan ke Supabase, simpan lokal saja:', err.message);
      if (value) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
    }
  },

  /** Hapus satu setting */
  async remove(key) {
    try {
      const { error } = await supabase
        .from('app_settings')
        .delete()
        .eq('id', key);
      if (error) throw error;
      localStorage.removeItem(key);
    } catch (err) {
      console.warn('[settings] Gagal hapus dari Supabase:', err.message);
      localStorage.removeItem(key);
    }
  },
};
