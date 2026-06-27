# 04-DATA_FLOW.md

# Data Flow

## Absen Digital Siswa

Version : 2.0

---

# 1. Purpose

Dokumen ini menjelaskan seluruh alur perpindahan data di dalam sistem.

Flow mencakup:

* Login
* Authentication
* QR Scan
* Attendance
* Permission
* Report
* Offline Queue
* Export
* Synchronization
* Error Handling

Seluruh implementasi harus mengikuti alur ini.

---

# 2. High Level Flow

```text
User
 │
 ▼
Frontend
 │
 ▼
REST API
 │
 ▼
Business Service
 │
 ▼
Google Sheets API
 │
 ▼
Google Spreadsheet
 │
 ▼
Business Service
 │
 ▼
REST API
 │
 ▼
Frontend
 │
 ▼
User
```

---

# 3. Login Flow

```text
User

↓

Input Username

↓

Input Password

↓

POST /auth/login

↓

Auth Service

↓

Read USERS Sheet

↓

Verify Password

↓

Generate Session

↓

Return Token

↓

Save Session

↓

Dashboard
```

Jika gagal

↓

Return Error

↓

Login Page

---

# 4. Session Validation Flow

```text
Frontend

↓

Read Token

↓

GET /auth/session

↓

Backend

↓

Validate Token

↓

Valid

↓

Continue

atau

↓

Invalid

↓

Redirect Login
```

---

# 5. QR Scan Flow

```text
User Scan QR

↓

Camera

↓

Read QR

↓

Extract Token

↓

POST /qr/validate

↓

Read Student

↓

Check QR Status

↓

QR Valid

↓

Continue

atau

↓

QR Invalid

↓

Audio Error

↓

Show Error
```

---

# 6. Attendance Flow

```text
QR Valid

↓

Read Active Session

↓

Check Student

↓

Check Duplicate

↓

Create Attendance

↓

Update Last Scan

↓

Write Spreadsheet

↓

Return Success

↓

Play Audio

↓

Refresh UI
```

---

# 7. Duplicate Attendance Flow

```text
Attendance Request

↓

Find Attendance

↓

Already Exists

↓

Return Duplicate

↓

No Insert

↓

Notification
```

---

# 8. Permission Flow

```text
Scan Student

↓

Permission Mode

↓

Read Student

↓

Insert Permission

↓

Status

↓

OUT

↓

Return Success
```

---

Return Student

```text
Scan QR

↓

Find Permission

↓

Update Return Time

↓

Status

↓

IN

↓

Return Success
```

---

# 9. Manual Attendance Flow

```text
Teacher

↓

Open Report

↓

Select Student

↓

Edit Status

↓

PUT Attendance

↓

Spreadsheet Updated

↓

Return Success
```

---

# 10. Report Flow

```text
User

↓

Select Date

↓

GET Report

↓

Backend

↓

Read Spreadsheet

↓

Aggregate

↓

JSON

↓

Frontend

↓

Table
```

---

# 11. Export Flow

```text
User

↓

Export Excel

↓

Backend

↓

Read Data

↓

Generate XLSX

↓

Download
```

---

# 12. Settings Flow

```text
Admin

↓

Change Settings

↓

PUT Settings

↓

Spreadsheet

↓

Success

↓

Refresh Cache
```

---

# 13. QR Regeneration Flow

```text
Admin

↓

Select Student

↓

Generate New Token

↓

Save Student

↓

Insert History

↓

Return Success
```

---

# 14. Student Import Flow

```text
Excel File

↓

Read File

↓

Validation

↓

Duplicate Check

↓

Insert Batch

↓

Spreadsheet

↓

Return Summary
```

---

# 15. Offline Attendance Flow

```text
Scan

↓

No Internet

↓

Save IndexedDB

↓

Queue Created

↓

Waiting
```

---

Internet Available

```text
Queue

↓

Sync Service

↓

POST Attendance

↓

Spreadsheet

↓

Success

↓

Queue Removed
```

---

# 16. Cache Flow

```text
Request

↓

Memory Cache

↓

Found

↓

Return

atau

↓

Read Spreadsheet

↓

Update Cache

↓

Return
```

---

# 17. Authentication Flow

```text
Login

↓

Token

↓

Save Session

↓

Every Request

↓

Authorization Header

↓

Backend

↓

Validate

↓

Continue
```

---

# 18. Error Flow

```text
Request

↓

Validation

↓

Business

↓

Spreadsheet

↓

Success

atau

↓

Validation Error

↓

API Error

↓

Network Error

↓

System Error
```

Semua error dikembalikan dalam format JSON yang konsisten.

---

# 19. Synchronization Flow

```text
Spreadsheet Updated

↓

Invalidate Cache

↓

Reload Cache

↓

Next Request

↓

Latest Data
```

---

# 20. Activity Log Flow

Semua aktivitas penting dicatat.

```text
User

↓

Action

↓

Backend

↓

LOGS Sheet

↓

Continue Process
```

Aktivitas yang dicatat:

* Login
* Logout
* Scan
* Manual Attendance
* Permission
* Import
* Export
* Delete
* Update
* QR Regeneration

---

# 21. Data Validation Flow

Semua request harus melalui validasi.

```text
Request

↓

Required Field

↓

Data Type

↓

Duplicate

↓

Business Rule

↓

Save
```

Jika salah satu validasi gagal, proses dihentikan.

---

# 22. Backup Flow

```text
Spreadsheet

↓

Scheduled Backup

↓

JSON

↓

XLSX

↓

Archive
```

Backup dilakukan tanpa menghentikan layanan.

---

# 23. Notification Flow

```text
Success

↓

Audio

↓

Toast

↓

UI Update
```

atau

```text
Failed

↓

Audio Error

↓

Toast Error

↓

No Data Saved
```

---

# 24. Performance Flow

```text
Frontend Request

↓

REST API

↓

Memory Cache

↓

Spreadsheet

↓

Cache Refresh

↓

Response
```

Target waktu respons:

* Login < 500 ms
* QR Validation < 300 ms
* Attendance < 500 ms
* Report < 1 detik
* Export < 5 detik

---

# 25. Security Flow

```text
Request

↓

Authentication

↓

Authorization

↓

Validation

↓

Business Rule

↓

Spreadsheet
```

Tidak ada request yang langsung menuju Google Sheets tanpa melalui backend.

---

# 26. Failure Recovery Flow

Jika Spreadsheet gagal diakses:

```text
Request

↓

Retry

↓

Retry

↓

Retry

↓

Fail

↓

Return Error

↓

Write Log
```

Jika internet terputus:

```text
Queue

↓

IndexedDB

↓

Reconnect

↓

Auto Sync
```

---

# 27. Future Flow

Arsitektur ini memungkinkan penambahan modul baru tanpa mengubah flow utama.

Contoh:

* Guru
* Inventaris
* Pembayaran
* Perpustakaan
* Akademik

Semua modul mengikuti pola:

```text
Frontend

↓

REST API

↓

Business Service

↓

Repository

↓

Google Sheets
```

---

# 28. Definition of Done

Flow dianggap benar apabila:

✓ Tidak ada akses langsung dari Frontend ke Google Sheets.

✓ Seluruh data melewati REST API.

✓ Seluruh validasi dilakukan di Backend.

✓ Offline Queue tetap berjalan.

✓ Tidak ada kehilangan data.

✓ Seluruh perubahan tercatat di Activity Log.

✓ Semua response menggunakan format JSON standar.

---

# Approval

Status : Draft

Dokumen ini menjadi acuan resmi seluruh alur data sistem dan harus dipatuhi oleh implementasi frontend maupun backend.
