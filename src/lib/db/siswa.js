// ============================================================
// lib/db/siswa.js — CRUD siswa via Supabase
// ============================================================
import { supabase } from '../supabase';

export const siswaService = {
  async getAll() {
    const { data, error } = await supabase
      .from('siswa')
      .select('*, kelas:kelas_id(id, nama)')
      .order('nama');
    if (error) throw error;
    return data;
  },

  async getByKelas(kelasId) {
    const { data, error } = await supabase
      .from('siswa')
      .select('*, kelas:kelas_id(id, nama)')
      .eq('kelas_id', kelasId)
      .order('nama');
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('siswa')
      .select('*, kelas:kelas_id(id, nama)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getByQrToken(token) {
    const { data, error } = await supabase
      .from('siswa')
      .select('*, kelas:kelas_id(id, nama)')
      .eq('qr_token', token)
      .single();
    if (error) return null;
    return data;
  },

  async getByNis(nis) {
    const { data, error } = await supabase
      .from('siswa')
      .select('*, kelas:kelas_id(id, nama)')
      .eq('nis', nis)
      .single();
    if (error) return null;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('siswa')
      .insert({
        nis:      payload.nis,
        nama:     payload.nama,
        kelas_id: payload.kelas_id,
      })
      .select('*, kelas:kelas_id(id, nama)')
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from('siswa')
      .update(payload)
      .eq('id', id)
      .select('*, kelas:kelas_id(id, nama)')
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('siswa')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async regenerateQr(id) {
    // Gunakan PostgreSQL uuid_generate_v4() via RPC atau generate di client
    const newToken = crypto.randomUUID();
    const { data, error } = await supabase
      .from('siswa')
      .update({
        qr_token:             newToken,
        qr_generated_at:      new Date().toISOString(),
        qr_regenerated_count: supabase.rpc ? undefined : 0, // updated via trigger / manual
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateLastScan(id) {
    const { error } = await supabase
      .from('siswa')
      .update({ last_scan_at: new Date().toISOString() })
      .eq('id', id);
    if (error) console.error('updateLastScan error:', error);
  },

  // Bulk import dari Excel/CSV
  async bulkCreate(rows) {
    const { data, error } = await supabase
      .from('siswa')
      .insert(rows)
      .select();
    if (error) throw error;
    return data;
  },
};
