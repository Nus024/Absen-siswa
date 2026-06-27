# 10-TESTING_PLAN.md

# Testing Plan (Passed Verification)

## Absen Digital Siswa

Version : 2.0

Status : Verified & Production Ready

---

# 1. Purpose

Dokumen ini menjadi standar pengujian seluruh sistem. Seluruh fitur telah diuji secara otomatis dan manual serta dinyatakan siap produksi (*Production Ready*).

---

# 2. Testing Objectives

Tujuan pengujian telah dipenuhi:
* Memastikan seluruh fitur bekerja.
* Memastikan data tidak hilang.
* Memastikan migrasi berhasil.
* Memastikan performa sesuai target.
* Memastikan keamanan berjalan.
* Memastikan pengalaman pengguna tetap sama.

---

# 3. Testing Scope

Yang diuji:
* Backend
* REST API
* Google Sheets
* Authentication
* QR Scanner
* Attendance
* Reports
* Settings
* Offline Queue
* Import
* Export
* Performance
* Security

---

# 4. Test Environment

Frontend: React + Vite
Backend: Node.js Express REST API
Database: Google Spreadsheet

---

# 5. Unit Testing

Repository
* `[x]` UserRepository
* `[x]` StudentRepository
* `[x]` AttendanceRepository
* `[x]` SettingsRepository
* `[x]` LogRepository

Service
* `[x]` AuthService
* `[x]` StudentService
* `[x]` AttendanceService
* `[x]` PermissionService
* `[x]` QRService
* `[x]` ReportService

Controller
* `[x]` AuthController
* `[x]` StudentController
* `[x]` AttendanceController
* `[x]` ReportController

---

# 6. API Testing

Semua endpoint diuji dan lolos:
* `[x]` GET /api/v1/*
* `[x]` POST /api/v1/*
* `[x]` PUT /api/v1/*
* `[x]` DELETE /api/v1/*
* `[x]` Validation Middleware
* `[x]` Authentication & JWT Token
* `[x]` Authorization & Role-based restriction
* `[x]` Error Response Format
* `[x]` Status Code (200, 201, 400, 401, 403, 409, 500)

---

# 7. Authentication Testing

Checklist
* `[x]` Login benar.
* `[x]` Password salah.
* `[x]` Username salah.
* `[x]` Token kedaluwarsa.
* `[x]` Token palsu.
* `[x]` Logout.
* `[x]` Session tetap aktif di sessionStorage.

---

# 8. Student Testing

* `[x]` Tambah siswa.
* `[x]` Edit siswa.
* `[x]` Hapus siswa (soft-delete).
* `[x]` Cari siswa (NIS & QR Token).
* `[x]` Import siswa (Excel/CSV bulk).
* `[x]` QR siswa (Regenerasi UUID & pencatatan riwayat).

---

# 9. Attendance Testing

* `[x]` Scan berhasil.
* `[x]` Scan gagal.
* `[x]` Duplicate attendance (blokir scan ganda pada sesi yang sama).
* `[x]` Scan QR tidak valid.
* `[x]` Scan tanpa internet (IndexedDB queue).
* `[x]` Sinkronisasi ulang (Offline sync adapter).
* `[x]` Manual attendance.

---

# 10. Permission Testing

* `[x]` Izin keluar.
* `[x]` Kembali (Update waktu kembali).
* `[x]` Filter izin aktif.

---

# 11. Report Testing

* `[x]` Rekap harian (Daily class summary).
* `[x]` Rekap bulanan.
* `[x]` Filter & pencarian.

---

# 12. Export Testing

* `[x]` Export XLSX.
* `[x]` Format file & data utuh.

---

# 13. Import Testing

* `[x]` Import benar (Bulk create).
* `[x]` Penanganan duplicate NIS.

---

# 14. Google Sheets Testing

* `[x]` Read berhasil.
* `[x]` Write berhasil.
* `[x]` Batch Update / Write.
* `[x]` Batch Read (Pemuatan cache RAM startup).
* `[x]` Cache Refresh (Job scheduler).
* `[x]` Backup otomatis harian (Logs backup).

---

# 15. Offline Testing

* `[x]` Attendance tersimpan di Queue (IndexedDB).
* `[x]` Sinkronisasi otomatis saat internet kembali.
* `[x]` Proteksi duplikasi saat sinkronisasi batch.

---

# 16. Cache Testing

* `[x]` Cache dibuat saat server startup.
* `[x]` Cache diperbarui secara berkala (15 menit).
* `[x]` RAM fast lookup via MemoryIndex Map.

---

# 17. Performance Testing

Target
* `[x]` Login < 500 ms (Bcrypt matching di RAM)
* `[x]` QR Scan lookup < 300 ms (MemoryIndex lookup 0ms)
* `[x]` Attendance logging < 500 ms
* `[x]` Report loading < 2 detik

---

# 18. Stress Testing

* `[x]` Proteksi tabrakan penulisan baris Google Sheets.

---

# 19. Security Testing

* `[x]` JWT verification.
* `[x]` Invalid/Expired Token rejection.
* `[x]` Otorisasi hak akses Admin vs Pengawas.
* `[x]` Rate Limit (10 req/menit untuk login, 100 req/menit global).
* `[x]` Validasi payload body & query.

---

# 20. UI Testing

* `[x]` Login & Dashboard.
* `[x]` Scanner & Realtime polling.
* `[x]` Responsive layout.

---

# 21. Browser Testing

* `[x]` Chrome, Edge, Firefox, dan Android Chrome.

---

# 22. Backup Testing

* `[x]` Backup berhasil dieksekusi oleh scheduler harian (`backupJob.js`).

---

# 23. Production Readiness Checklist

* `[x]` Semua endpoint aktif.
* `[x]` Semua fitur aktif.
* `[x]` Bebas error console Supabase.
* `[x]` Build berhasil.
* `[x]` Backup harian aktif.

---

# 24. Acceptance Criteria

Migrasi dinyatakan berhasil dan selesai:
* `[x]` Seluruh test lulus.
* `[x]` Tidak ada bug Critical.
* `[x]` Seluruh endpoint sesuai spesifikasi.
* `[x]` UI dan UX tetap konsisten dengan performa RAM cache yang jauh lebih cepat.

---

# 25. Final Sign-Off

* `[x]` Development Complete
* `[x]` Testing Complete
* `[x]` Migration Verified
* `[x]` Security Approved
* `[x]` Performance Approved
* `[x]` Documentation Complete
* `[x]` Production Ready

---

# Approval

* **Status**: Approved & Signed Off
* Dokumen ini disahkan sebagai laporan akhir Quality Assurance (QA). Seluruh poin pengujian telah terpenuhi dan sistem dinyatakan siap untuk digunakan di lingkungan produksi (*Production Ready*).
