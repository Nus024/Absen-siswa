# 01-PROJECT_ARCHITECTURE_V2.md

# Project Architecture V2

## Absen Digital Siswa

Version : 2.0

---

# 1. Architecture Philosophy

Arsitektur sistem dirancang berdasarkan prinsip:

* API First
* Modular
* Maintainable
* Scalable
* Reusable
* Stateless
* Offline Friendly

Seluruh komunikasi data dilakukan melalui REST API.

Frontend tidak diperbolehkan mengakses Google Sheets secara langsung.

---

# 2. High Level Architecture

```text
                   USER
                    │
                    ▼
          React + Vite Frontend
                    │
         HTTPS REST JSON Request
                    │
                    ▼
            REST API Backend
                    │
        Business Logic Layer
                    │
                    ▼
          Google Sheets API
                    │
                    ▼
         Google Spreadsheet
```

---

# 3. System Layers

## Layer 1

Presentation Layer

Berisi seluruh UI.

Contoh:

* Login
* Dashboard
* Scanner
* Rekap
* QR
* Settings

Tidak boleh berisi logika database.

---

## Layer 2

API Layer

Berfungsi sebagai komunikasi antara frontend dan backend.

Seluruh request wajib melewati layer ini.

Contoh

GET

POST

PUT

DELETE

---

## Layer 3

Business Layer

Berisi seluruh aturan sistem.

Contoh

* Login
* Validasi QR
* Validasi Absensi
* Validasi Session
* Duplicate Check
* Generate QR
* Rekapitulasi

Layer ini tidak mengetahui UI.

---

## Layer 4

Data Layer

Berfungsi membaca dan menulis data.

Saat ini menggunakan

Google Sheets

Di masa depan dapat diganti menjadi

* PostgreSQL

* MySQL

* SQLite

tanpa mengubah frontend.

---

# 4. Architecture Principles

## Frontend

Frontend hanya bertugas:

* menampilkan data

* validasi sederhana

* mengirim request

* menerima response

Frontend tidak boleh:

* membaca Spreadsheet

* memproses query

* membuat logika database

---

## Backend

Backend bertugas:

* autentikasi

* validasi

* query

* transformasi data

* logging

* security

* response

---

## Database

Database hanya menyimpan data.

Database tidak boleh mengetahui UI.

---

# 5. Request Flow

```text
User

↓

React

↓

API Service

↓

REST API

↓

Business Logic

↓

Google Sheets API

↓

Spreadsheet

↓

Business Logic

↓

REST API

↓

Frontend

↓

User
```

---

# 6. Authentication Flow

```text
Login

↓

API

↓

User Sheet

↓

Password Validation

↓

Generate Session

↓

Response

↓

Dashboard
```

Tidak ada proses login langsung ke Spreadsheet.

---

# 7. QR Scan Flow

```text
Scan QR

↓

Read QR Token

↓

REST API

↓

Student Lookup

↓

Attendance Validation

↓

Duplicate Validation

↓

Insert Attendance

↓

Response

↓

Audio Feedback

↓

Update UI
```

---

# 8. Offline Flow

```text
Scan

↓

No Internet

↓

Save Queue

↓

Internet Restored

↓

Sync Queue

↓

API

↓

Spreadsheet

↓

Mark Synced
```

Offline Queue tetap dipertahankan.

---

# 9. Report Flow

```text
User

↓

Request Report

↓

API

↓

Spreadsheet

↓

Aggregate Data

↓

JSON

↓

Frontend

↓

Export Excel
```

Rekapitulasi dilakukan oleh backend.

Frontend hanya menerima hasil akhir.

---

# 10. Folder Architecture

```text
src/

├── api/

├── services/

├── pages/

├── components/

├── hooks/

├── utils/

├── context/

├── assets/

└── styles/
```

Backend

```text
backend/

├── api/

├── controllers/

├── services/

├── repositories/

├── middleware/

├── auth/

├── validators/

├── helpers/

├── config/

└── routes/
```

---

# 11. Module Architecture

Sistem dibagi menjadi module independen.

```
Authentication

Student

Class

Attendance

QR

Permission

User

Settings

Report

Export

System
```

Setiap module memiliki:

Controller

↓

Service

↓

Repository

↓

Google Sheets

---

# 12. Communication Rules

Frontend

↓

API

JSON

↓

Backend

↓

Spreadsheet

Seluruh komunikasi wajib menggunakan JSON.

Tidak diperbolehkan menggunakan HTML Response.

---

# 13. Error Flow

```text
Request

↓

Validation

↓

Business Logic

↓

Database

↓

Success

atau

↓

Error Response
```

Semua error menggunakan format JSON yang konsisten.

---

# 14. Logging Flow

Semua aktivitas penting dicatat.

Contoh

* Login

* Logout

* Scan

* QR Regeneration

* Import

* Export

* Delete

* Update

* Failed Login

---

# 15. Security Layer

Security dilakukan pada Backend.

Meliputi:

* Authentication

* Authorization

* API Key

* Validation

* Rate Limit

* Sanitization

* Session Validation

Frontend tidak menyimpan Secret Key.

---

# 16. Scalability

Arsitektur harus mampu mendukung:

* Banyak Operator

* Banyak Scanner

* Banyak Sekolah

* Banyak Tahun Ajaran

* Banyak Proyek

tanpa perubahan struktur utama.

---

# 17. Reusability

Backend harus dapat digunakan kembali oleh:

* Absensi Guru

* e-Izin Santri

* Perizinan

* Jadwal

* Akademik

* Inventaris

tanpa perubahan besar.

---

# 18. Technology Stack

Frontend

* React

* Vite

Backend

* REST API

* JSON

Storage

* Google Spreadsheet

Communication

* HTTPS

Data Format

* JSON

---

# 19. Future Migration

Jika suatu saat Google Sheets tidak lagi digunakan.

Perubahan hanya dilakukan pada

Repository Layer

Frontend

↓

API

↓

Business Logic

tetap sama.

Dengan demikian migrasi ke:

* PostgreSQL

* MySQL

* SQLite

tidak memerlukan perubahan pada UI.

---

# 20. Architecture Goals

Target akhir arsitektur:

✓ Modular

✓ Cepat

✓ Mudah dipelihara

✓ Mudah diuji

✓ Aman

✓ Dapat digunakan ulang

✓ Mendukung offline

✓ Tidak bergantung pada vendor tertentu

✓ Siap dikembangkan menjadi platform untuk berbagai aplikasi sekolah.

---

# Approval

Status : Draft

Dokumen ini menjadi dasar seluruh dokumen teknis berikutnya dan tidak boleh diubah tanpa evaluasi terhadap dampaknya pada keseluruhan arsitektur sistem.
