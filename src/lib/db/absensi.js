// ============================================================
// lib/db/absensi.js — CRUD absensi via Supabase
// ============================================================
import { supabase } from '../supabase';
import { todayStr } from '../constants';

export const absensiService = {
  async getByTanggal(tanggal) {
    const { data, error } = await supabase
      .from('absensi')
      .select(`
        *,
        siswa:siswa_id(id, nis, nama, kelas_id),
        sesi:sesi_id(id, nama, urutan)
      `)
      .eq('tanggal', tanggal)
      .order('waktu_scan', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getByTanggalSesi(tanggal, sesiId) {
    const { data, error } = await supabase
      .from('absensi')
      .select(`
        *,
        siswa:siswa_id(id, nis, nama, kelas_id),
        sesi:sesi_id(id, nama, urutan)
      `)
      .eq('tanggal', tanggal)
      .eq('sesi_id', sesiId);
    if (error) throw error;
    return data;
  },

  async getByTanggalKelas(tanggal, kelasId) {
    const { data, error } = await supabase
      .from('absensi')
      .select(`
        *,
        siswa:siswa_id!inner(id, nis, nama, kelas_id),
        sesi:sesi_id(id, nama, urutan)
      `)
      .eq('tanggal', tanggal)
      .eq('siswa.kelas_id', kelasId)
      .order('waktu_scan', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getByMonth(year, month) {
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to   = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
    const { data, error } = await supabase
      .from('absensi')
      .select(`
        *,
        siswa:siswa_id(id, nis, nama, kelas_id),
        sesi:sesi_id(id, nama, urutan)
      `)
      .gte('tanggal', from)
      .lte('tanggal', to)
      .order('tanggal');
    if (error) throw error;
    return data;
  },

  async getBySiswaMonth(siswaId, year, month) {
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to   = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
    const { data, error } = await supabase
      .from('absensi')
      .select('*, sesi:sesi_id(id, nama, urutan)')
      .eq('siswa_id', siswaId)
      .gte('tanggal', from)
      .lte('tanggal', to)
      .order('tanggal');
    if (error) throw error;
    return data;
  },

  async existsScan(siswaId, sesiId, tanggal) {
    const { count, error } = await supabase
      .from('absensi')
      .select('id', { count: 'exact', head: true })
      .eq('siswa_id', siswaId)
      .eq('sesi_id', sesiId)
      .eq('tanggal', tanggal);
    if (error) return false;
    return (count ?? 0) > 0;
  },

  async create(payload) {
    const item = {
      siswa_id:   payload.siswa_id,
      sesi_id:    payload.sesi_id,
      tanggal:    payload.tanggal ?? todayStr(),
      status:     payload.status ?? 'hadir',
      catatan:    payload.catatan ?? '',
      waktu_scan: new Date().toISOString(),
      petugas_id: payload.petugas_id ?? null,
    };
    const { data, error } = await supabase
      .from('absensi')
      .insert(item)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from('absensi')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('absensi')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async bulkCreate(items) {
    const rows = items.map(it => ({
      siswa_id:   it.siswa_id,
      sesi_id:    it.sesi_id,
      tanggal:    it.tanggal ?? todayStr(),
      status:     it.status ?? 'hadir',
      catatan:    it.catatan ?? '',
      waktu_scan: new Date().toISOString(),
      petugas_id: it.petugas_id ?? null,
    }));
    const { data, error } = await supabase
      .from('absensi')
      .insert(rows)
      .select();
    if (error) throw error;
    return data;
  },

  // Upsert: create atau update jika sudah ada (untuk isi manual)
  async upsert(payload) {
    const item = {
      siswa_id: payload.siswa_id,
      sesi_id:  payload.sesi_id,
      tanggal:  payload.tanggal,
      status:   payload.status ?? 'hadir',
      catatan:  payload.catatan ?? '',
    };
    const { data, error } = await supabase
      .from('absensi')
      .upsert(item, { onConflict: 'siswa_id,sesi_id,tanggal' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
