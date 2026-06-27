# 05-MIGRATION_MAP.md

# Migration Map

## Google Sheets REST API → Google Sheets API

Version : 2.0

---

# 1. Purpose

Dokumen ini berfungsi sebagai peta migrasi dari arsitektur lama (Google Sheets REST API) ke arsitektur baru (Google Sheets + REST API).

Dokumen ini memastikan bahwa:

* Tidak ada fitur yang hilang.
* Tidak ada file yang terlewat.
* Tidak ada dependensi Google Sheets REST API yang tertinggal.
* Migrasi dilakukan secara bertahap dan aman.

---

# 2. Migration Strategy

```text
Current System
       │
       ▼
Google Sheets REST API

↓

Migration Layer

↓

REST API

↓

Google Sheets API

↓

Google Spreadsheet

↓

New System
```

Frontend tetap dipertahankan.

Perubahan hanya dilakukan pada Backend dan Service Layer.

---

# 3. Database Mapping

| Google Sheets REST API     | Google Sheets |
| ------------ | ------------- |
| users        | USERS         |
| siswa        | SISWA         |
| kelas        | KELAS         |
| sesi_absensi | SESI          |
| absensi      | ABSENSI       |
| izin_keluar  | IZIN          |
| app_settings | SETTINGS      |
| qr_history   | QR_HISTORY    |
| logs         | LOGS          |

---

# 4. Service Mapping

| Old Service | New Service       |
| ----------- | ----------------- |
| users.js    | usersApi.js       |
| siswa.js    | studentsApi.js    |
| kelas.js    | classesApi.js     |
| sesi.js     | sessionsApi.js    |
| absensi.js  | attendanceApi.js  |
| izin.js     | permissionsApi.js |
| settings.js | settingsApi.js    |

Semua service baru berkomunikasi melalui REST API.

---

# 5. Authentication Mapping

Old

```text
Frontend

↓

Google Sheets REST API

↓

users Table

↓

RPC Verify Password
```

New

```text
Frontend

↓

REST API

↓

Google Sheets

↓

Password Validation

↓

Token
```

---

# 6. QR Mapping

Old

```text
Google Sheets REST API RPC

↓

Generate QR
```

New

```text
REST API

↓

Generate Token

↓

Update Spreadsheet
```

QR Format tetap dipertahankan.

---

# 7. Attendance Mapping

Old

```text
Insert

↓

Google Sheets REST API
```

New

```text
Insert

↓

REST API

↓

Google Sheets
```

Flow tidak berubah.

---

# 8. Permission Mapping

Old

```text
Google Sheets REST API

↓

izin_keluar
```

New

```text
REST API

↓

IZIN Sheet
```

---

# 9. Settings Mapping

Old

```text
app_settings
```

New

```text
SETTINGS Sheet
```

---

# 10. Login Mapping

Old

```text
Google Sheets REST API Login
```

New

```text
REST Login
```

---

# 11. Offline Queue

Tidak berubah.

Tetap menggunakan

IndexedDB

↓

Sync

↓

REST API

↓

Spreadsheet

---

# 12. File Migration

## Dipertahankan

```text
pages/

components/

hooks/

styles/

assets/

scanner/

reports/

QR Generator
```

---

## Dimodifikasi

```text
src/lib/db/*
```

Seluruh service lama akan diganti.

---

## Dihapus

```text
google sheets REST api.js
```

SDK Google Sheets REST API dihapus sepenuhnya.

---

## Ditambahkan

```text
src/api/

src/services/

backend/

routes/

controllers/

repositories/
```

---

# 13. Feature Mapping

| Feature       | Status |
| ------------- | ------ |
| Login         | Tetap  |
| QR Scan       | Tetap  |
| Attendance    | Tetap  |
| Permission    | Tetap  |
| Reports       | Tetap  |
| Export        | Tetap  |
| Settings      | Tetap  |
| Offline Queue | Tetap  |

Tidak ada fitur yang dihapus.

---

# 14. Realtime Mapping

Old

```text
Google Sheets REST API Realtime
```

New

```text
Polling API

atau

Manual Refresh
```

Karena Google Sheets tidak memiliki realtime native.

---

# 15. RPC Mapping

Google Sheets REST API RPC dihapus.

Diganti menjadi:

Backend Service

Contoh

Old

```text
verify_password()
```

↓

New

```text
AuthService.verifyPassword()
```

---

Old

```text
hash_password()
```

↓

New

```text
AuthService.hashPassword()
```

---

Old

```text
regenerate_student_qr()
```

↓

New

```text
QRService.regenerate()
```

---

# 16. Dependency Mapping

Dihapus

```text
@google sheets REST api/google sheets REST api-js
```

Ditambahkan

```text
Google Sheets API

Google Auth

REST Client

JWT

Express (atau framework backend)
```

---

# 17. Environment Mapping

Old

```text
GOOGLE_SHEETS_URL

GOOGLE_SHEETS_KEY
```

New

```text
GOOGLE_PROJECT_ID

GOOGLE_CLIENT_EMAIL

GOOGLE_PRIVATE_KEY

SPREADSHEET_ID

JWT_SECRET
```

---

# 18. API Mapping

Old

```text
Google Sheets REST API SDK
```

↓

New

```text
fetch()

↓

REST API

↓

Google Sheets API
```

---

# 19. Folder Mapping

Old

```text
src/lib/db
```

↓

New

```text
src/api

↓

backend/controllers

↓

backend/services

↓

backend/repositories
```

---

# 20. Testing Mapping

Setelah migrasi selesai.

Seluruh fitur berikut wajib diuji.

* Login

* Logout

* QR Scan

* Attendance

* Permission

* Reports

* Export

* Settings

* Offline Queue

* Import

* QR Regeneration

---

# 21. Rollback Plan

Apabila migrasi gagal.

Langkah rollback:

1.

Backup Spreadsheet.

2.

Restore Project.

3.

Aktifkan kembali Backend lama.

4.

Verifikasi data.

5.

Testing.

---

# 22. Migration Checklist

## Phase 1

☐ Backup Google Sheets REST API

☐ Backup Project

☐ Backup Assets

---

## Phase 2

☐ Membuat Spreadsheet

☐ Membuat API

☐ Membuat Authentication

---

## Phase 3

☐ Migrasi Users

☐ Migrasi Kelas

☐ Migrasi Siswa

☐ Migrasi Session

☐ Migrasi Attendance

☐ Migrasi Permission

☐ Migrasi Settings

---

## Phase 4

☐ Mengganti Service Layer

☐ Menghubungkan API

☐ Testing

---

## Phase 5

☐ Load Test

☐ Security Test

☐ Production Test

☐ Release

---

# 23. Migration Rules

Selama migrasi:

* Tidak mengubah UI.
* Tidak mengubah UX.
* Tidak mengubah format QR.
* Tidak mengubah struktur halaman.
* Tidak mengubah flow pengguna.

Migrasi hanya boleh mengubah:

* Backend.
* API.
* Database.
* Service Layer.

---

# 24. Definition of Done

Migrasi dinyatakan selesai apabila:

✓ Seluruh data berhasil dipindahkan.

✓ Seluruh endpoint REST API berfungsi.

✓ Tidak ada lagi dependensi Google Sheets REST API.

✓ Seluruh fitur berjalan normal.

✓ Performa minimal sama dengan versi sebelumnya.

✓ Tidak ada perubahan pada pengalaman pengguna (User Experience).

---

# Approval

Status : Draft

Dokumen ini menjadi checklist resmi migrasi. Implementasi hanya boleh dimulai setelah seluruh poin pada dokumen ini disetujui dan seluruh dokumen perencanaan sebelumnya telah selesai.
