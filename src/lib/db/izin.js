// ============================================================
// lib/db/izin.js — CRUD izin keluar via Supabase
// ============================================================
import { supabase } from '../supabase';

export const izinService = {
  async getAll() {
    const { data, error } = await supabase
      .from('izin_keluar')
      .select(`
        *,
        siswa:siswa_id(id, nis, nama, kelas_id)
      `)
      .order('waktu_keluar', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAktif() {
    const { data, error } = await supabase
      .from('izin_keluar')
      .select(`
        *,
        siswa:siswa_id(id, nis, nama, kelas_id)
      `)
      .eq('status', 'keluar')
      .order('waktu_keluar', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByTanggal(tanggal) {
    // tanggal dalam format YYYY-MM-DD
    const from = `${tanggal}T00:00:00`;
    const to   = `${tanggal}T23:59:59`;
    const { data, error } = await supabase
      .from('izin_keluar')
      .select(`
        *,
        siswa:siswa_id(id, nis, nama, kelas_id)
      `)
      .gte('waktu_keluar', from)
      .lte('waktu_keluar', to)
      .order('waktu_keluar', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('izin_keluar')
      .insert({
        siswa_id:     payload.siswa_id,
        petugas_id:   payload.petugas_id ?? null,
        alasan:       payload.alasan ?? '',
        status:       'keluar',
        waktu_keluar: new Date().toISOString(),
      })
      .select(`*, siswa:siswa_id(id, nis, nama, kelas_id)`)
      .single();
    if (error) throw error;
    return data;
  },

  async kembali(id) {
    const { data, error } = await supabase
      .from('izin_keluar')
      .update({
        status:        'kembali',
        waktu_kembali: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`*, siswa:siswa_id(id, nis, nama, kelas_id)`)
      .single();
    if (error) throw error;
    return data;
  },
};
