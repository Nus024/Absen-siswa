// ============================================================
// lib/db/sesi.js — CRUD sesi absensi via Supabase
// ============================================================
import { supabase } from '../supabase';

export const sesiService = {
  async getAll() {
    const { data, error } = await supabase
      .from('sesi_absensi')
      .select('*')
      .order('urutan');
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('sesi_absensi')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('sesi_absensi')
      .insert({
        nama:        payload.nama,
        jam_mulai:   payload.jam_mulai,
        jam_selesai: payload.jam_selesai,
        urutan:      payload.urutan ?? 1,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from('sesi_absensi')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('sesi_absensi')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
