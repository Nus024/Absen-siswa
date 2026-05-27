# FINAL PRODUCTION-READY ARCHITECTURE  
## Aplikasi Absensi & Perizinan Siswa Berbasis QR Code (Operasional Sekolah Nyata)

> Dokumen ini adalah cetak biru final yang mengutamakan **stabilitas, kecepatan scan, kemudahan operasional, dan performa di HP Android low-end**. Bukan showcase UI, bukan dashboard AI, bukan overengineering.

---

## 1. FINAL OPERATIONAL PRD

### 1.1 Tujuan Utama (Urut Prioritas)
1. **Scan QR super cepat** – petugas bisa scan 30 siswa/menit.
2. **Tidak ada kehilangan data** – offline queue + sync otomatis.
3. **Cetak QR massal** – admin siapkan QR seluruh sekolah dalam <15 menit.
4. **Laporan Excel seperti format manual** – langsung print dan arsip.
5. **Monitoring izin keluar** – realtime sederhana (polling 10 detik, bukan WebSocket).

### 1.2 Skenario Operasional Harian
| Peran | Aksi Utama | Frekuensi |
|-------|-----------|-----------|
| TU/Petugas | Scan QR siswa (3 sesi) | ~4950 scan/hari (30 kelas x 55 siswa x 3 sesi) |
| Wali Kelas | Ubah status alpha → sakit/izin | ~10-20 perubahan/hari |
| Admin | Cetak QR baru, export laporan | Mingguan/bulanan |

### 1.3 Fitur Final (Tidak Lebih)
- ✅ Scanner continuous + offline queue
- ✅ Generate QR (UUID token) per siswa/kelas/sekolah
- ✅ Cetak QR layout kartu A4 (12 kartu/halaman)
- ✅ Rekap harian & bulanan (tabel klasik)
- ✅ Export Excel (format H/I/S/A/D)
- ✅ Izin keluar (scan keluar, scan kembali)
- ✅ Manajemen siswa & kelas (CRUD sederhana)
- ✅ Pengaturan sesi & jam (3 sesi fleksibel)
- ✅ Role: Admin, TU, Wali Kelas, Viewer

### 1.4 Fitur Ditiadakan (Demi Stabilitas)
- ❌ Grafik, chart, statistik visual
- ❌ Notifikasi realtime (cukup polling)
- ❌ Upload file bukti surat (cukup catatan teks)
- ❌ Animasi & micro-interaction
- ❌ Rekomendasi berbasis AI

---

## 2. FINAL QR ARCHITECTURE

### 2.1 Struktur QR (Sederhana, Aman, Ringan)
```
SISWA:{UUID}
```
Contoh: `SISWA:550e8400-e29b-41d4-a716-446655440000`

- **UUID** = `qr_token` di database (dibuat dengan `gen_random_uuid()`)
- **Tidak perlu HMAC** untuk mengurangi kompleksitas. Keamanan: karena token unik dan tidak bisa ditebak, siswa tidak bisa membuat QR palsu. Risiko foto QR teman tetap ada, tapi itu tidak merugikan karena absensi tetap atas nama pemilik QR. Sekolah bisa mencetak QR dengan foto siswa di kartu sebagai pengaman fisik.

### 2.2 Generate QR (Internal Admin)
- Library: `qrcode` (npm install qrcode)
- Generate data URL: `QRCode.toDataURL('SISWA:' + siswa.qr_token, { width: 300, margin: 1 })`
- Simpan token di database, QR tidak perlu disimpan (generate ulang saat cetak).

### 2.3 Validasi QR Saat Scan (Tanpa DB Lookup)
Di backend (Supabase Edge Function) atau RLS:
```sql
-- Cek apakah token ada di tabel siswa dan status active
SELECT 1 FROM siswa WHERE qr_token = 'uuid_from_qr' AND qr_status = 'active';
```
Cukup satu query cepat karena UUID indexed.

### 2.4 Database QR (Tabel Siswa)
```sql
CREATE TABLE siswa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nis varchar(20) UNIQUE NOT NULL,
  nama varchar(100) NOT NULL,
  kelas_id uuid REFERENCES kelas(id),
  qr_token uuid UNIQUE DEFAULT gen_random_uuid(),
  qr_status varchar(10) DEFAULT 'active',
  qr_generated_at timestamptz,
  qr_regenerated_count int DEFAULT 0,
  last_scan_at timestamptz
);
CREATE INDEX idx_siswa_qr_token ON siswa(qr_token);
```

---

## 3. FINAL SCANNER ARCHITECTURE

### 3.1 Continuous Scanning (Tanpa Reload)
```jsx
// components/scanner/ContinuousScanner.jsx
import { Html5Qrcode } from 'html5-qrcode';

let html5QrCode = null;

export function startScanner(onScanSuccess) {
  html5QrCode = new Html5Qrcode("reader");
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: { width: 250, height: 250 } },
    onScanSuccess,
    () => {} // ignore error
  );
}
export function stopScanner() { html5QrCode?.stop(); }
```

### 3.2 Feedback & Duplicate Prevention
- Cache memory: `Map` dengan key `siswa_id+sesi_id+tanggal`, TTL 5 menit.
- Jika duplikat → getar 2x, tolak.
- Berhasil → getar 1x, suara pendek, floating card hijau 1.5 detik.

### 3.3 Offline Queue (IndexedDB)
- Simpan scan sebagai object: `{ siswa_id, sesi_id, tanggal, waktu_scan, mode, alasan }`
- Sinkronisasi setiap 30 detik atau saat koneksi pulih.
- Batch insert 10 item per request.

### 3.4 Performa di HP Low-End
- Resolusi kamera 320x240 (cukup untuk QR).
- Nonaktifkan torch jika tidak diperlukan.
- Hentikan scanner saat pindah halaman (free memory).

---

## 4. FINAL PRINT ARCHITECTURE (QR Cetak)

### 4.1 Layout Kartu (A4, 12 kartu/halaman)
```css
@media print {
  .qr-card {
    width: 6.5cm;
    height: 9cm;
    float: left;
    page-break-inside: avoid;
    border: 1px solid #ccc;
    margin: 0.2cm;
    padding: 0.2cm;
  }
  .qr-image { width: 2.5cm; height: 2.5cm; }
}
```

### 4.2 Generate Print Preview (Tanpa Backend)
- Admin pilih kelas → klik "Cetak QR Kelas"
- Sistem buat modal atau tab baru dengan HTML berisi semua kartu siswa di kelas itu.
- Panggil `window.print()` → user save as PDF atau print langsung.

### 4.3 Ukuran QR Optimal
- Cetak: minimal 2.5 cm x 2.5 cm (200x200 px pada 200 DPI).
- Rekomendasi: 3 cm x 3 cm agar scan mudah dari jarak 20 cm.

---

## 5. FINAL DATABASE STRUCTURE (Sederhana & Scalable)

```sql
-- Kelas
CREATE TABLE kelas (id uuid PRIMARY KEY, nama varchar(10), wali_kelas_id uuid);

-- Siswa (sudah di atas)

-- Sesi Absensi (3 baris, bisa diedit admin)
CREATE TABLE sesi (id uuid PRIMARY KEY, nama varchar(20), jam_mulai time, jam_selesai time);

-- Absensi (~148k baris/bulan)
CREATE TABLE absensi (
  id uuid PRIMARY KEY,
  siswa_id uuid REFERENCES siswa(id),
  sesi_id uuid REFERENCES sesi(id),
  tanggal date DEFAULT CURRENT_DATE,
  waktu_scan timestamptz DEFAULT now(),
  status varchar(20) DEFAULT 'hadir', -- hadir, sakit, izin, alpha, dispensasi
  catatan text,
  updated_by uuid
);
CREATE INDEX idx_absensi_siswa_tanggal ON absensi(siswa_id, tanggal);
CREATE INDEX idx_absensi_tanggal_sesi ON absensi(tanggal, sesi_id);

-- Izin Keluar
CREATE TABLE izin_keluar (
  id uuid PRIMARY KEY,
  siswa_id uuid REFERENCES siswa(id),
  petugas_id uuid,
  waktu_keluar timestamptz DEFAULT now(),
  waktu_kembali timestamptz,
  alasan text,
  status varchar(10) DEFAULT 'keluar'
);
CREATE INDEX idx_izin_status ON izin_keluar(status) WHERE status='keluar';

-- Archive: setiap 6 bulan pindahkan absensi > 180 hari ke tabel absensi_archive (struktur sama)
```

### 5.1 Cleanup Strategy
- Cron job (Supabase Edge Function) setiap tanggal 1 jam 02:00:
  - Hapus izin_keluar dengan status 'kembali' dan waktu_kembali < 90 hari.
  - Pindahkan absensi dengan tanggal < 180 hari ke archive.

---

## 6. FINAL EXCEL & REPORT SYSTEM

### 6.1 Format Tabel Manual (Sekolah)
| No | NIS | Nama | Kelas | 1 Mar | 2 Mar | ... | Hadir | Izin | Alpha |
|----|-----|------|-------|-------|-------|-----|-------|------|-------|
| 1 | 1234 | Ahmad | X IPA 1 | H | I | ... | 20 | 5 | 2 |

### 6.2 Export dengan SheetJS
```js
import * as XLSX from 'xlsx';

function exportRekapBulanan(data) {
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{wch:5},{wch:12},{wch:25},{wch:10}, ...]; // lebar kolom
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Bulanan');
  XLSX.writeFile(wb, `rekap_${bulan}_${tahun}.xlsx`);
}
```

### 6.3 Print Ready CSS
```css
@media print {
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid black; padding: 4px; font-size: 10pt; }
}
```

---

## 7. FINAL OPERATIONAL UI DIRECTION

### 7.1 Layout Global
- **Desktop**: Sidebar kiri lebar 200px (icon + teks), background putih, border kanan 1px solid #E5E5EA.
- **Mobile**: Bottom navigation (5 item) + konten scroll.
- **Warna utama**: Putih (`#FFFFFF`), abu sangat terang (`#F5F5F7`) untuk alternatif baris tabel.
- **Aksen tombol**: Biru tua (`#0055CC`) – hanya untuk tombol aksi utama.

### 7.2 Halaman Scanner (Default setelah login)
- Fullscreen kamera.
- Tombol mode (Absensi / Izin Keluar / Kembali) di pojok bawah kiri, transparan.
- Tombol flash di pojok bawah kanan.
- Hasil scan muncul sebagai floating bar kecil di tengah bawah, hilang otomatis.

### 7.3 Halaman Rekap Harian
- Filter: dropdown kelas, date picker.
- Tabel dengan kolom: Nama, Sesi1, Sesi2, Sesi3, Aksi (edit status untuk wali kelas).
- Tombol Export Excel di atas tabel.

### 7.4 Halaman QR Management
- Tabel siswa dengan kolom: NIS, Nama, Kelas, Status QR, Aksi (Preview, Cetak, Regenerate).
- Toolbar: filter kelas, tombol "Generate QR Kelas", tombol "Cetak Semua".

### 7.5 Larangan Visual
- ❌ Tidak ada card dengan shadow > `0 1px 2px rgba(0,0,0,0.05)`
- ❌ Tidak ada gradient, glow, backdrop blur
- ❌ Tidak ada ikon animasi atau spinning

---

## 8. FINAL MOBILE-FIRST STRATEGY

### 8.1 Target Device
- Android 8+, RAM 2GB, kamera 5MP.
- Chrome mobile terbaru.

### 8.2 Optimalisasi
- **Bundle size**: <150KB gzipped (Vite + manual chunks).
- **Scanner**: stop saat halaman tidak aktif (gunakan visibility API).
- **Baterai**: deteksi battery level, jika <20% turunkan fps scanner menjadi 5.
- **Touch target**: tombol minimal 44x44px, jarak 8px.

### 8.3 One-Hand Operation
- Bottom navigation dengan tinggi 56px.
- Tombol aksi utama (scan, simpan) berada di area jangkau ibu jari (bawah tengah).

---

## 9. FINAL ANTI-TEMPLATE DESIGN SYSTEM

### 9.1 Filosofi
> *“Tidak ada yang istimewa, semuanya berfungsi. Guru tidak perlu adaptasi.”*

### 9.2 Komponen Wajib
- **Tabel**: border horizontal tipis, row height 44px, hover abu muda.
- **Tombol**: flat, background putih, border 1px #CCCCCC, padding 8px 12px.
- **Form input**: border 1px #CCCCCC, padding 8px, font 14px.

### 9.3 Yang Tidak Boleh Ada
- Sidebar gelap, icon-only navigation, floating action button (kecuali scanner), skeleton loading, shimmer effect.

### 9.4 Operational Hierarchy
1. Scanner (80% ruang)
2. Tabel rekap (15%)
3. Form admin (5%)

---

## 10. FINAL PRODUCTION-READY FRONTEND STRUCTURE

```
src/
├── features/
│   ├── scanner/
│   │   ├── ContinuousScanner.jsx
│   │   ├── useScanner.js
│   │   └── OfflineQueue.js
│   ├── qr/
│   │   ├── QRGenerator.js
│   │   ├── QRPrintLayout.jsx
│   │   └── QRManagementTable.jsx
│   ├── attendance/
│   │   ├── AbsensiService.js
│   │   └── IzinService.js
│   ├── reports/
│   │   ├── RekapHarian.jsx
│   │   ├── RekapBulanan.jsx
│   │   └── exportToExcel.js
│   └── admin/
│       ├── ManageSiswa.jsx
│       └── ManageKelas.jsx
├── lib/
│   ├── supabaseClient.js
│   ├── indexedDB.js
│   └── constants.js
├── hooks/
│   ├── useAuth.js
│   └── useOfflineSync.js
├── components/
│   ├── OperationalTable.jsx
│   ├── Button.jsx
│   ├── BottomNav.jsx
│   └── Sidebar.jsx
├── layouts/
│   ├── MobileLayout.jsx
│   └── DesktopLayout.jsx
├── styles/
│   └── globals.css (Tailwind + custom print)
└── App.jsx
```

### 10.1 Deployment (Vercel)
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Build: `npm run build` → output `dist/` → deploy ke Vercel (gratis).

---

## KESIMPULAN FINAL

Arsitektur di atas sudah siap **langsung diimplementasikan** dan digunakan di sekolah nyata. Semua keputusan mengorbankan estetika modern demi **stabilitas, kecepatan, dan kemudahan operasional**.  

**Tidak ada:**
- Template AI, gradient, glassmorphism, chart analytics, atau fitur berlebihan.

**Yang ada:**
- Scanner continuous offline-ready, cetak QR massal dengan layout A4, laporan Excel format manual, tabel operasional yang familiar bagi guru, dan database sederhana namun scalable.

**Hasil akhir** akan terasa seperti **software internal sekolah premium** yang sudah dipakai bertahun-tahun – bukan produk startup atau showcase UI.