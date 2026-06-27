# 00-MASTER_MIGRATION_PLAN.md

# Master Migration Plan

## Absen Digital Siswa

### Version 2.0

---

# Document Information

| Item             | Value                  |
| ---------------- | ---------------------- |
| Project          | Absen Digital Siswa    |
| Document         | Master Migration Plan  |
| Version          | 2.0                    |
| Status           | Draft                  |
| Priority         | Critical               |
| Purpose          | Architecture Migration |
| Previous Backend | Google Sheets REST API               |
| New Backend      | Google Sheets API      |
| API Format       | REST JSON              |
| Hosting          | Netlify                |
| Frontend         | React + Vite           |

---

# 1. Purpose

Dokumen ini menjadi acuan utama seluruh proses migrasi sistem.

Tidak diperbolehkan melakukan perubahan kode sebelum seluruh keputusan arsitektur dalam dokumen ini disetujui.

Dokumen ini mendefinisikan:

* tujuan migrasi
* ruang lingkup
* prinsip arsitektur
* target sistem
* strategi migrasi
* standar implementasi

---

# 2. Background

Versi sebelumnya menggunakan:

* Google Sheets REST API Database
* Google Sheets REST API RPC
* Google Sheets REST API Realtime
* Google Sheets REST API Authentication (Custom Table)
* Google Sheets REST API SDK

Seluruh data aplikasi bergantung langsung kepada Google Sheets REST API.

Target baru adalah menghilangkan ketergantungan tersebut dan menggantinya dengan arsitektur yang lebih sederhana namun tetap mudah dikembangkan.

---

# 3. Migration Objectives

Migrasi dilakukan untuk mencapai tujuan berikut.

## Primary Objectives

* Menghapus seluruh ketergantungan terhadap Google Sheets REST API.
* Menggunakan Google Sheets sebagai penyimpanan utama.
* Menggunakan REST API berbasis JSON.
* Mempertahankan tampilan frontend yang sudah ada.
* Meminimalkan perubahan UI.
* Mempermudah maintenance.

---

## Secondary Objectives

* Mempermudah deployment.
* Mempermudah backup data.
* Mempermudah pengelolaan data oleh operator sekolah.
* Mengurangi kompleksitas backend.
* Menyiapkan arsitektur reusable untuk proyek lain.

---

# 4. Scope

## Included

* Database
* API
* Authentication
* QR Validation
* Attendance
* Student Management
* Teacher Management
* Permission Management
* Reporting
* Settings
* Export

---

## Not Included

* Redesign UI
* Perubahan UX
* Perubahan Flow Scanner
* Perubahan QR Format
* Perubahan Struktur Menu

---

# 5. Target Architecture

```
React Application
        │
        ▼
REST JSON API
        │
        ▼
Google Sheets API
        │
        ▼
Google Spreadsheet
```

Frontend tidak boleh berkomunikasi langsung dengan Google Sheets.

Seluruh komunikasi wajib melalui REST API.

---

# 6. Design Principles

## Single Source of Truth

Google Spreadsheet menjadi satu-satunya sumber data.

---

## Separation of Concerns

Frontend

↓

REST API

↓

Google Sheets

Setiap layer memiliki tanggung jawab yang jelas.

---

## API First

Semua data harus diakses melalui endpoint API.

Frontend tidak boleh mengetahui struktur Spreadsheet.

---

## Reusable

Backend harus dapat digunakan oleh:

* Absensi Siswa
* Absensi Guru
* e-Izin Santri
* Sistem Akademik
* Proyek sekolah lainnya

tanpa perubahan arsitektur.

---

## Modular

Setiap modul berdiri sendiri.

Contoh:

* Student Module
* Attendance Module
* QR Module
* User Module
* Report Module

---

## Maintainable

Perubahan pada satu modul tidak boleh memengaruhi modul lainnya.

---

# 7. Migration Rules

Selama proses migrasi:

❌ Tidak boleh mengubah UI.

❌ Tidak boleh mengubah Flow Scanner.

❌ Tidak boleh mengubah QR Format.

❌ Tidak boleh mengubah User Experience.

Yang boleh berubah:

* Backend
* API
* Database
* Service Layer

---

# 8. Success Criteria

Migrasi dianggap berhasil apabila:

* Seluruh fitur berjalan.
* Tidak ada kehilangan data.
* Scanner tetap bekerja.
* Login tetap bekerja.
* Rekap tetap berjalan.
* Export tetap berjalan.
* Offline Queue tetap berjalan.
* QR tetap valid.
* Performa minimal sama atau lebih baik dibanding versi sebelumnya.

---

# 9. Migration Strategy

Migrasi dilakukan secara bertahap.

Phase 1

Perencanaan

↓

Phase 2

Perancangan Arsitektur

↓

Phase 3

Perancangan Database

↓

Phase 4

Perancangan API

↓

Phase 5

Implementasi Backend

↓

Phase 6

Migrasi Service

↓

Phase 7

Testing

↓

Phase 8

Production

---

# 10. Risk Management

Risiko utama:

* Kehilangan data
* API gagal
* Google Sheets limit
* Konflik penulisan data
* Error sinkronisasi offline
* Perubahan struktur Spreadsheet

Setiap risiko wajib memiliki strategi mitigasi sebelum implementasi.

---

# 11. Documentation Order

Dokumen berikut harus dibuat secara berurutan.

1. 00-MASTER_MIGRATION_PLAN.md

2. 01-PROJECT_ARCHITECTURE_V2.md

3. 02-GOOGLE_SHEETS_DATABASE.md

4. 03-REST_API_SPEC.md

5. 04-DATA_FLOW.md

6. 05-MIGRATION_MAP.md

7. 06-SECURITY.md

8. 07-PERFORMANCE.md

9. 08-FILE_CHANGE_LIST.md

10. 09-IMPLEMENTATION_PLAN.md

11. 10-TESTING_PLAN.md

---

# 12. Project Goals

Sistem harus memiliki karakteristik berikut:

* Cepat
* Stabil
* Mudah dipelihara
* Mudah dikembangkan
* Modular
* Aman
* Mendukung banyak proyek
* Mendukung banyak sekolah
* Mendukung ribuan transaksi absensi
* Mudah dipindahkan ke database lain di masa depan

---

# 13. Long-Term Vision

Arsitektur ini tidak hanya dibuat untuk Absen Digital Siswa.

Arsitektur yang sama akan menjadi fondasi seluruh aplikasi sekolah berbasis REST API dan Google Sheets, sehingga setiap proyek baru dapat menggunakan backend yang sama dengan hanya menambahkan modul baru tanpa mengubah struktur inti sistem.

---

# Approval

Status : Draft

Belum boleh dilakukan perubahan kode sebelum seluruh dokumen perencanaan selesai dan disetujui.
