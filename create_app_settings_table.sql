-- ============================================================
-- Jalankan SQL ini di Supabase Dashboard:
-- https://supabase.com/dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Buat tabel app_settings
CREATE TABLE IF NOT EXISTS app_settings (
  id    TEXT PRIMARY KEY,
  value TEXT
);

-- 2. Aktifkan Row Level Security
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- 3. Buat policy agar semua user (termasuk anon) bisa baca & tulis
--    (karena app ini pakai custom auth, bukan Supabase Auth)
DROP POLICY IF EXISTS "allow_all" ON app_settings;
CREATE POLICY "allow_all" ON app_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. (Opsional) Isi data awal jika sudah punya nama sekolah
-- INSERT INTO app_settings (id, value) VALUES ('school_name', 'Nama Sekolah Anda')
-- ON CONFLICT (id) DO NOTHING;
