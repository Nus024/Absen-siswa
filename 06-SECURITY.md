# 06-SECURITY.md

# Security Specification

## Absen Digital Siswa

Version : 2.0

---

# 1. Purpose

Dokumen ini mendefinisikan standar keamanan seluruh sistem.

Meliputi:

* Authentication
* Authorization
* API Security
* Google Sheets Security
* Data Protection
* Session Management
* Logging
* Backup
* Audit

Seluruh implementasi wajib mengikuti dokumen ini.

---

# 2. Security Principles

Sistem dibangun berdasarkan prinsip:

* Zero Trust
* Least Privilege
* Defense in Depth
* Secure by Default
* Never Trust Client
* Server Side Validation

Frontend dianggap tidak dapat dipercaya.

Semua validasi dilakukan oleh Backend.

---

# 3. Architecture Security

```text id="2vys7m"
Client

↓

HTTPS

↓

REST API

↓

Authentication

↓

Authorization

↓

Validation

↓

Business Logic

↓

Google Sheets API

↓

Google Spreadsheet
```

Frontend tidak pernah mengakses Spreadsheet secara langsung.

---

# 4. Google Sheets Security

Spreadsheet bersifat PRIVATE.

Tidak boleh:

* Public
* Anyone with Link
* Shared Read
* Shared Write

Akses hanya diberikan kepada:

Service Account

Backend

---

# 5. Service Account

Backend menggunakan:

Google Service Account

File credential tidak boleh:

* masuk Git
* berada di Frontend
* dapat diunduh User

Disimpan sebagai:

Environment Variable

atau

Secret Manager

---

# 6. Environment Variables

Contoh

```text id="d6ozm5"
GOOGLE_PROJECT_ID

GOOGLE_CLIENT_EMAIL

GOOGLE_PRIVATE_KEY

SPREADSHEET_ID

JWT_SECRET

API_SECRET
```

Tidak boleh disimpan di Frontend.

---

# 7. Authentication

Login dilakukan melalui Backend.

Flow

```text id="ic4h0o"
Username

↓

Password

↓

Backend

↓

Verify Password

↓

Generate Token

↓

Response
```

Password tidak pernah dibandingkan di Frontend.

---

# 8. Password Policy

Password disimpan dalam bentuk Hash.

Tidak boleh disimpan sebagai Plain Text.

Minimal

* 8 karakter

Disarankan

* bcrypt

atau

* Argon2

---

# 9. Session Management

Session menggunakan:

JWT

atau

Secure Session Token

Disimpan pada:

HttpOnly Cookie

atau

Secure Storage

Session memiliki masa berlaku.

---

# 10. Authorization

Setiap request memeriksa:

* Token
* Role
* Permission

Role

```text id="ahag5i"
ADMIN

PETUGAS

WALI_KELAS

VIEWER
```

Hak akses ditentukan oleh Backend.

---

# 11. API Key

API Key hanya digunakan oleh Backend.

Frontend tidak boleh mengetahui:

* Google API Key
* Service Account
* Spreadsheet ID sensitif

---

# 12. HTTPS

Semua komunikasi wajib menggunakan:

HTTPS

Tidak diperbolehkan menggunakan HTTP.

---

# 13. Input Validation

Semua request divalidasi.

Meliputi:

* Required Field
* Length
* Type
* Duplicate
* Invalid Format
* Invalid Date
* Invalid QR
* Invalid ID

---

# 14. Sanitization

Backend membersihkan seluruh input.

Melindungi dari:

* Script Injection
* Formula Injection
* Invalid Character

---

# 15. QR Security

QR hanya berisi:

QR Token

Tidak berisi:

* Nama
* NIS
* Password
* Data pribadi

Semua informasi diambil dari Backend.

---

# 16. Spreadsheet Security

Backend melakukan:

* Read
* Write
* Update

Frontend tidak boleh:

* Read Spreadsheet
* Write Spreadsheet

langsung.

---

# 17. Duplicate Protection

Backend wajib memeriksa:

* QR Duplicate

* Attendance Duplicate

* User Duplicate

* NIS Duplicate

* Username Duplicate

sebelum menyimpan data.

---

# 18. Rate Limiting

Untuk mencegah penyalahgunaan.

Contoh

Login

5 request / menit

Attendance

60 request / menit

QR Validation

120 request / menit

---

# 19. Activity Logging

Semua aktivitas penting dicatat.

Contoh

* Login

* Logout

* Scan

* Manual Attendance

* QR Regeneration

* Import

* Export

* Delete

* Update

* Failed Login

---

# 20. Audit Trail

Setiap perubahan data memiliki:

```text id="1sltn4"
Created By

Created At

Updated By

Updated At
```

Tidak boleh dihapus.

---

# 21. Backup Security

Backup dilakukan otomatis.

Backup disimpan:

* JSON

* XLSX

Backup hanya dapat diakses Administrator.

---

# 22. Error Security

Response Error tidak boleh mengungkapkan:

* Password

* Query

* Google Credential

* Stack Trace

* Spreadsheet ID

Error yang dikirim:

```json id="a0h4y3"
{
  "success": false,
  "message": "Unauthorized"
}
```

---

# 23. File Upload Security

Semua file:

* diperiksa ukuran
* diperiksa tipe
* diperiksa isi

Hanya menerima format yang didukung.

---

# 24. Import Security

Saat Import Excel.

Backend memeriksa:

* Duplicate

* Empty Row

* Invalid Class

* Invalid Student

* Invalid Session

* Invalid Format

---

# 25. API Security

Setiap endpoint wajib:

* Authentication
* Authorization
* Validation
* Logging

baru kemudian

Business Logic

---

# 26. Cache Security

Memory Cache tidak boleh menyimpan:

* Password

* Private Key

* Secret

Cache hanya menyimpan data publik.

---

# 27. Google Sheets Protection

Spreadsheet wajib memiliki:

* Version History aktif

* Protected Sheet

* Protected Range

* Backup Harian

* Restricted Sharing

---

# 28. Security Checklist

☐ HTTPS aktif

☐ JWT aktif

☐ Password Hash

☐ Input Validation

☐ Sanitization

☐ Rate Limit

☐ Activity Log

☐ Backup

☐ Protected Spreadsheet

☐ Service Account

☐ Environment Variable

☐ Audit Trail

---

# 29. Incident Recovery

Jika terjadi:

Credential Bocor

↓

Nonaktifkan Service Account

↓

Generate Credential Baru

↓

Perbarui Environment

↓

Restart Backend

↓

Audit Log

Jika Token Bocor

↓

Invalidate Session

↓

Paksa Login Ulang

---

# 30. Definition of Done

Implementasi keamanan dianggap selesai apabila:

✓ Frontend tidak mengetahui kredensial Google.

✓ Spreadsheet hanya dapat diakses Backend.

✓ Seluruh password tersimpan dalam bentuk hash.

✓ Semua endpoint memiliki autentikasi dan otorisasi.

✓ Seluruh request tervalidasi.

✓ Aktivitas penting tercatat.

✓ Backup otomatis tersedia.

✓ Tidak ada data sensitif yang dikirim ke klien.

---

# Approval

Status : Draft

Dokumen ini menjadi standar keamanan resmi sistem. Seluruh implementasi backend, API, dan database wajib mematuhi spesifikasi yang ditetapkan di dalamnya.
