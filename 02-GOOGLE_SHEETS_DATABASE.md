# 02-GOOGLE_SHEETS_DATABASE.md

# Google Sheets Database Design

## Absen Digital Siswa

Version : 2.0

---

# 1. Purpose

Dokumen ini mendefinisikan struktur penyimpanan data menggunakan Google Spreadsheet.

Dokumen ini menjadi acuan:

* Backend
* REST API
* Validasi Data
* Query
* Import
* Export
* Backup

---

# 2. Design Principles

Database harus memenuhi prinsip berikut:

* Simple
* Fast
* Scalable
* Human Readable
* Easy Maintenance
* Easy Backup
* Easy Import
* Easy Export

---

# 3. Spreadsheet Structure

Satu Spreadsheet digunakan sebagai satu database.

Contoh

```text
ABSENSI DIGITAL SISWA
```

Di dalamnya terdapat beberapa Sheet.

---

# 4. Sheet List

| Sheet      | Function              |
| ---------- | --------------------- |
| SETTINGS   | Konfigurasi Sistem    |
| USERS      | Data User             |
| KELAS      | Data Kelas            |
| SISWA      | Master Siswa          |
| SESI       | Master Jam Absensi    |
| ABSENSI    | Riwayat Absensi       |
| IZIN       | Riwayat Izin          |
| QR_HISTORY | Riwayat Regenerasi QR |
| LOGS       | Activity Log          |
| SYSTEM     | Metadata Sistem       |

---

# 5. Sheet : SETTINGS

Berisi konfigurasi aplikasi.

Contoh

| KEY         | VALUE |
| ----------- | ----- |
| SCHOOL_NAME |       |
| SCHOOL_LOGO |       |
| VERSION     |       |
| YEAR        |       |
| ACTIVE      |       |

---

# 6. Sheet : USERS

Master pengguna.

Kolom

```text
USER_ID
USERNAME
PASSWORD
NAME
ROLE
STATUS
LAST_LOGIN
CREATED_AT
UPDATED_AT
```

Primary Key

USER_ID

---

# 7. Sheet : KELAS

Kolom

```text
KELAS_ID
TINGKAT
NAMA
WALI_KELAS
STATUS
CREATED_AT
UPDATED_AT
```

Primary Key

KELAS_ID

---

# 8. Sheet : SISWA

Kolom

```text
SISWA_ID
NIS
NAMA
KELAS_ID
QR_TOKEN
QR_VERSION
QR_STATUS
LAST_SCAN
STATUS
CREATED_AT
UPDATED_AT
```

Primary Key

SISWA_ID

Foreign Key

KELAS_ID

---

# 9. Sheet : SESI

Kolom

```text
SESI_ID
NAMA
JAM_MULAI
JAM_SELESAI
URUTAN
STATUS
```

---

# 10. Sheet : ABSENSI

Kolom

```text
ABSENSI_ID
TANGGAL
SISWA_ID
SESI_ID
STATUS
WAKTU_SCAN
PETUGAS
DEVICE
SYNC_STATUS
CATATAN
CREATED_AT
```

Primary Key

ABSENSI_ID

Foreign Key

SISWA_ID

SESI_ID

---

# 11. Sheet : IZIN

Kolom

```text
IZIN_ID
SISWA_ID
ALASAN
WAKTU_KELUAR
WAKTU_KEMBALI
STATUS
PETUGAS
CATATAN
```

---

# 12. Sheet : QR_HISTORY

Kolom

```text
ID
SISWA_ID
OLD_TOKEN
NEW_TOKEN
VERSION
REASON
UPDATED_BY
UPDATED_AT
```

---

# 13. Sheet : LOGS

Semua aktivitas penting.

Kolom

```text
LOG_ID
MODULE
ACTION
USER
DESCRIPTION
IP
DEVICE
CREATED_AT
```

---

# 14. Sheet : SYSTEM

Metadata.

Kolom

```text
KEY
VALUE
```

Digunakan untuk:

* Counter
* Version
* Cache
* Last Backup
* Last Sync

---

# 15. Primary Key Rules

Semua Sheet wajib memiliki Primary Key.

Format

```text
USR000001

KLS000001

STD000001

SES000001

ABS000001

IZN000001
```

Tidak menggunakan nomor baris Spreadsheet.

---

# 16. Foreign Key Rules

Relasi dilakukan menggunakan ID.

Contoh

ABSENSI

↓

SISWA_ID

↓

SISWA

Google Sheets tidak memiliki Foreign Key.

Validasi dilakukan oleh Backend.

---

# 17. Data Validation

Backend wajib memvalidasi:

* Primary Key

* Duplicate

* Empty

* Invalid QR

* Invalid User

* Invalid Class

* Invalid Session

* Invalid Status

---

# 18. Index Strategy

Karena Spreadsheet tidak memiliki Index.

Backend membuat Memory Index.

Contoh

```text
QR_TOKEN

↓

SISWA_ID
```

Cache

```text
NIS

↓

SISWA
```

Cache

```text
USERNAME

↓

USER
```

Hal ini mempercepat pencarian.

---

# 19. Soft Delete

Tidak ada DELETE permanen.

Semua data menggunakan:

STATUS

ACTIVE

INACTIVE

DELETED

---

# 20. Timestamp Standard

Semua Sheet memiliki:

```text
CREATED_AT

UPDATED_AT
```

Menggunakan ISO 8601

Contoh

2026-06-27T08:15:32Z

---

# 21. Status Standard

Attendance

```text
HADIR

IZIN

SAKIT

ALFA
```

QR

```text
ACTIVE

BLOCKED
```

User

```text
ACTIVE

INACTIVE
```

---

# 22. Duplicate Rules

Tidak boleh ada:

* NIS ganda

* Username ganda

* QR Token ganda

* Absensi ganda

Validasi dilakukan sebelum data ditulis.

---

# 23. Data Access Rules

Frontend

↓

REST API

↓

Google Sheets

Frontend tidak boleh membaca Spreadsheet secara langsung.

---

# 24. Backup Strategy

Backup dilakukan otomatis.

Format

```text
JSON

CSV

XLSX
```

Backup dapat dijadwalkan harian.

---

# 25. Performance Strategy

Backend membaca Spreadsheet.

↓

Menyimpan ke Memory Cache.

↓

Seluruh Query membaca Cache.

↓

Perubahan Data.

↓

Update Spreadsheet.

↓

Refresh Cache.

Backend tidak membaca Spreadsheet setiap request.

---

# 26. Future Expansion

Sheet baru dapat ditambahkan tanpa mengubah struktur utama.

Contoh

```text
GURU

PELAJARAN

TAHUN_AJARAN

KALENDER

PENGUMUMAN

PEMBAYARAN

INVENTARIS
```

---

# 27. Database Principles

Google Spreadsheet hanya berfungsi sebagai media penyimpanan.

Semua proses berikut dilakukan oleh Backend:

* Search
* Filter
* Join
* Validation
* Authentication
* Aggregation
* Reporting
* Duplicate Checking
* QR Validation

Spreadsheet tidak boleh digunakan sebagai tempat menjalankan logika bisnis.

---

# Approval

Status : Draft

Dokumen ini menjadi standar struktur database Google Sheets dan seluruh implementasi backend wajib mengikuti spesifikasi yang ditetapkan di dalamnya.
