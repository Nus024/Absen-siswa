# 09-IMPLEMENTATION_PLAN.md

# Implementation Plan

## Absen Digital Siswa

Version : 2.0

Status : Draft

---

# 1. Purpose

Dokumen ini mendefinisikan urutan implementasi migrasi.

Tujuan:

* Mengurangi risiko.
* Mencegah kehilangan data.
* Memastikan setiap tahap selesai sebelum tahap berikutnya dimulai.
* Menjamin sistem selalu dapat di-rollback.

---

# 2. Implementation Strategy

Strategi implementasi:

```text
Planning

↓

Infrastructure

↓

Backend

↓

API

↓

Frontend Integration

↓

Testing

↓

Production

↓

Monitoring
```

Tidak diperbolehkan melompati tahap.

---

# 3. Phase 0 — Preparation

## Objective

Menyiapkan seluruh kebutuhan sebelum coding.

### Task

☐ Finalisasi seluruh dokumen arsitektur.

☐ Review struktur proyek.

☐ Review dependensi.

☐ Identifikasi seluruh penggunaan Google Sheets REST API.

☐ Menentukan struktur Spreadsheet.

☐ Menentukan endpoint REST API.

### Deliverable

* Dokumen lengkap.
* Tidak ada perubahan kode.

### Exit Criteria

Seluruh dokumen disetujui.

---

# 4. Phase 1 — Infrastructure

## Objective

Menyiapkan lingkungan backend.

### Task

☐ Membuat repository backend.

☐ Menyiapkan Express/Fastify.

☐ Konfigurasi Environment.

☐ Konfigurasi Google Service Account.

☐ Konfigurasi Google Sheets API.

☐ JWT.

☐ Logger.

☐ Error Handler.

### Deliverable

Backend dapat dijalankan.

### Exit Criteria

Health Check API berhasil.

---

# 5. Phase 2 — Database

## Objective

Membuat struktur Google Spreadsheet.

### Task

☐ Membuat Spreadsheet.

☐ Membuat seluruh Sheet.

☐ Membuat Header.

☐ Mengatur Protected Range.

☐ Menambahkan Metadata.

### Deliverable

Database siap digunakan.

### Exit Criteria

Backend dapat membaca Spreadsheet.

---

# 6. Phase 3 — Repository Layer

## Objective

Menghubungkan backend ke Spreadsheet.

### Task

☐ UserRepository

☐ StudentRepository

☐ AttendanceRepository

☐ SettingsRepository

☐ ReportRepository

☐ LogRepository

### Deliverable

Repository mampu:

* Read
* Write
* Update
* Batch Update

### Exit Criteria

Seluruh repository lulus unit test.

---

# 7. Phase 4 — Business Service

## Objective

Membuat seluruh Business Logic.

### Task

☐ AuthService

☐ StudentService

☐ AttendanceService

☐ QRService

☐ PermissionService

☐ ReportService

☐ SettingsService

### Deliverable

Business Logic selesai.

### Exit Criteria

Seluruh service lulus pengujian.

---

# 8. Phase 5 — REST API

## Objective

Mengimplementasikan seluruh endpoint.

### Task

☐ Authentication

☐ Users

☐ Students

☐ Classes

☐ Attendance

☐ QR

☐ Permission

☐ Reports

☐ Settings

☐ Logs

☐ System

### Deliverable

REST API lengkap.

### Exit Criteria

Seluruh endpoint memberikan response sesuai spesifikasi.

---

# 9. Phase 6 — Security

## Objective

Mengaktifkan seluruh fitur keamanan.

### Task

☐ JWT

☐ Authentication

☐ Authorization

☐ Rate Limit

☐ Validation

☐ Sanitization

☐ Activity Log

### Deliverable

API aman digunakan.

### Exit Criteria

Security checklist terpenuhi.

---

# 10. Phase 7 — Frontend Integration

## Objective

Menghubungkan frontend ke REST API.

### Task

☐ Menghapus Google Sheets REST API SDK.

☐ Mengganti seluruh Service.

☐ Menghubungkan API.

☐ Menguji Login.

☐ Menguji Scanner.

☐ Menguji Attendance.

### Deliverable

Frontend menggunakan REST API.

### Exit Criteria

Tidak ada import Google Sheets REST API.

---

# 11. Phase 8 — Migration Data

## Objective

Memindahkan seluruh data.

### Task

☐ Export Google Sheets REST API.

☐ Konversi.

☐ Import Spreadsheet.

☐ Validasi.

☐ Hitung jumlah record.

### Deliverable

Semua data berhasil dipindahkan.

### Exit Criteria

Jumlah data sesuai.

---

# 12. Phase 9 — Feature Verification

## Objective

Memastikan seluruh fitur tetap berfungsi.

### Checklist

☐ Login

☐ Logout

☐ QR Scan

☐ Attendance

☐ Duplicate Check

☐ Permission

☐ Report

☐ Export

☐ Import

☐ Settings

☐ QR Regeneration

☐ Offline Queue

### Exit Criteria

Seluruh fitur lulus pengujian.

---

# 13. Phase 10 — Performance Optimization

## Objective

Mengoptimalkan performa.

### Task

☐ Memory Cache

☐ Memory Index

☐ Batch Read

☐ Batch Write

☐ Lazy Loading

☐ Debounce

☐ Queue

### Exit Criteria

Target performa tercapai.

---

# 14. Phase 11 — Production Testing

## Objective

Melakukan simulasi penggunaan nyata.

### Pengujian

☐ Banyak scanner.

☐ Banyak operator.

☐ Import besar.

☐ Export besar.

☐ Offline.

☐ Reconnect.

☐ Refresh.

☐ Login bersamaan.

### Exit Criteria

Tidak ditemukan bug kritis.

---

# 15. Phase 12 — Deployment

## Objective

Deploy ke Production.

### Task

☐ Deploy Backend.

☐ Deploy Frontend.

☐ Konfigurasi Environment.

☐ Konfigurasi Domain.

☐ SSL.

☐ Monitoring.

### Exit Criteria

Production aktif.

---

# 16. Phase 13 — Post Deployment

## Monitoring

Pantau:

* Response Time
* Error Rate
* Failed Login
* Queue
* Cache Hit
* Spreadsheet Read
* Spreadsheet Write

---

# 17. Rollback Plan

Jika deployment gagal.

Langkah:

1. Matikan Backend baru.

2. Aktifkan versi lama.

3. Restore Spreadsheet.

4. Verifikasi.

5. Audit.

Rollback maksimal dilakukan dalam 30 menit.

---

# 18. Risk Management

Risiko utama:

* Kehilangan data.
* Data tidak sinkron.
* Cache usang.
* Kegagalan autentikasi.
* Konflik penulisan.
* Kegagalan API.
* Kuota Google API.

Setiap risiko harus memiliki mitigasi sebelum implementasi.

---

# 19. Milestone

| Milestone | Target               |
| --------- | -------------------- |
| M1        | Dokumen selesai      |
| M2        | Backend siap         |
| M3        | Spreadsheet siap     |
| M4        | REST API selesai     |
| M5        | Frontend terhubung   |
| M6        | Migrasi data selesai |
| M7        | Testing selesai      |
| M8        | Production Live      |

---

# 20. Definition of Done

Migrasi dianggap selesai apabila:

✓ Tidak ada lagi dependensi Google Sheets REST API.

✓ Seluruh data berada di Google Sheets.

✓ Seluruh komunikasi menggunakan REST API.

✓ Frontend tetap mempertahankan UI dan UX sebelumnya.

✓ Semua endpoint sesuai spesifikasi.

✓ Semua fitur berfungsi normal.

✓ Target performa terpenuhi.

✓ Security checklist terpenuhi.

✓ Backup dan rollback tervalidasi.

✓ Sistem siap menjadi fondasi untuk proyek sekolah lain yang menggunakan arsitektur yang sama.

---

# Approval

Status : Draft

Dokumen ini merupakan panduan resmi pelaksanaan migrasi. Seluruh implementasi wajib mengikuti urutan fase, milestone, dan exit criteria yang telah ditetapkan. Tidak diperbolehkan memulai fase berikutnya sebelum fase sebelumnya dinyatakan selesai.
