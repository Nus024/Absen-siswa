// ============================================================
// lib/supabase.js — Singleton Supabase client
// ============================================================
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error('Supabase URL atau Anon Key belum dikonfigurasi di .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    // Kita gunakan custom auth (bukan Supabase Auth),
    // tapi tetap butuh sesi anon agar RLS bekerja.
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});
