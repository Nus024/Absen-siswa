// ============================================================
// lib/db/users.js — Auth & CRUD users via Supabase
// Password di-hash dengan pgcrypto (crypt + gen_salt)
// ============================================================
import { supabase } from '../supabase';

export const usersService = {
  // Login: cocokkan username + password_hash di Supabase
  async login(username, password) {
    // Ambil user berdasarkan username dulu
    const { data: user, error } = await supabase
      .from('users')
      .select('id, nama, username, role, kelas_ids, tingkat_akses, password_hash')
      .eq('username', username)
      .single();

    if (error || !user) return null;

    // Verifikasi password menggunakan pgcrypto via RPC
    const { data: valid } = await supabase.rpc('verify_password', {
      input_password: password,
      stored_hash:    user.password_hash,
    });

    if (!valid) return null;

    // Kembalikan user tanpa password_hash
    const { password_hash: _, ...safeUser } = user;
    return safeUser;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('id, nama, username, role, kelas_ids, tingkat_akses, created_at')
      .order('nama');
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, nama, username, role, kelas_ids, tingkat_akses')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    // Hash password via RPC
    const { data: hashedPw } = await supabase.rpc('hash_password', {
      input_password: payload.password,
    });

    const { data, error } = await supabase
      .from('users')
      .insert({
        nama:          payload.nama,
        username:      payload.username,
        password_hash: hashedPw,
        role:          payload.role,
        kelas_ids:     payload.kelas_ids ?? [],
        tingkat_akses: payload.tingkat_akses ?? [],
      })
      .select('id, nama, username, role, kelas_ids, tingkat_akses')
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const updateData = {
      nama:          payload.nama,
      username:      payload.username,
      role:          payload.role,
      kelas_ids:     payload.kelas_ids ?? [],
      tingkat_akses: payload.tingkat_akses ?? [],
    };

    // Jika ada password baru, hash dulu
    if (payload.password) {
      const { data: hashedPw } = await supabase.rpc('hash_password', {
        input_password: payload.password,
      });
      updateData.password_hash = hashedPw;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, nama, username, role, kelas_ids, tingkat_akses')
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
