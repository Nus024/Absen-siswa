// ============================================================
// lib/db/kelas.js — CRUD kelas via Supabase
// ============================================================
import { supabase } from '../supabase';

export const kelasService = {
  async getAll() {
    const { data, error } = await supabase
      .from('kelas')
      .select('*')
      .order('nama');
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('kelas')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(nama) {
    const { data, error } = await supabase
      .from('kelas')
      .insert({ nama })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, nama) {
    const { data, error } = await supabase
      .from('kelas')
      .update({ nama })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('kelas')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
