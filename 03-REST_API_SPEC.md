# 03-REST_API_SPEC.md

# REST API Specification

## Absen Digital Siswa

Version : 2.0

---

# 1. Purpose

Dokumen ini menjadi kontrak resmi komunikasi antara Frontend dan Backend.

Seluruh komunikasi data wajib mengikuti spesifikasi pada dokumen ini.

Frontend tidak diperbolehkan mengakses Google Sheets secara langsung.

---

# 2. API Standard

Protocol

```
HTTPS
```

Format

```
JSON
```

Base URL

```
/api/v1
```

Character Encoding

```
UTF-8
```

Timezone

```
UTC
```

Date Format

```
YYYY-MM-DD
```

Datetime Format

```
ISO 8601
```

---

# 3. HTTP Methods

| Method | Function    |
| ------ | ----------- |
| GET    | Read Data   |
| POST   | Create Data |
| PUT    | Update Data |
| DELETE | Delete Data |

---

# 4. Standard Response

Success

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

---

Failed

```json
{
  "success": false,
  "message": "Error Message",
  "error_code": "ERROR_CODE"
}
```

---

# 5. Authentication

Semua endpoint kecuali Login harus menggunakan Authorization.

Header

```
Authorization: Bearer TOKEN
```

---

# 6. API Modules

API dibagi menjadi module berikut

```
Auth

Users

Students

Classes

Sessions

Attendance

Permissions

QR

Reports

Settings

Logs

System
```

---

# 7. Auth API

## Login

POST

```
/auth/login
```

Request

```json
{
    "username":"",
    "password":""
}
```

Response

```json
{
    "success":true,
    "token":"",
    "user":{}
}
```

---

Logout

POST

```
/auth/logout
```

---

Check Session

GET

```
/auth/session
```

---

# 8. User API

GET

```
/users
```

GET

```
/users/{id}
```

POST

```
/users
```

PUT

```
/users/{id}
```

DELETE

```
/users/{id}
```

---

# 9. Student API

GET

```
/students
```

GET

```
/students/{id}
```

GET

```
/students/nis/{nis}
```

GET

```
/students/qr/{token}
```

POST

```
/students
```

PUT

```
/students/{id}
```

DELETE

```
/students/{id}
```

---

Bulk Import

POST

```
/students/import
```

---

Regenerate QR

POST

```
/students/{id}/qr
```

---

# 10. Class API

GET

```
/classes
```

GET

```
/classes/{id}
```

POST

```
/classes
```

PUT

```
/classes/{id}
```

DELETE

```
/classes/{id}
```

---

# 11. Session API

GET

```
/sessions
```

POST

```
/sessions
```

PUT

```
/sessions/{id}
```

DELETE

```
/sessions/{id}
```

---

# 12. Attendance API

GET

```
/attendance
```

Filter

```
date

class

student

session

status
```

---

Create Attendance

POST

```
/attendance
```

---

Update Attendance

PUT

```
/attendance/{id}
```

---

Delete Attendance

DELETE

```
/attendance/{id}
```

---

Check Duplicate

GET

```
/attendance/check
```

---

Bulk Attendance

POST

```
/attendance/bulk
```

---

# 13. Permission API

GET

```
/permissions
```

POST

```
/permissions
```

PUT

```
/permissions/{id}
```

---

Student Return

POST

```
/permissions/{id}/return
```

---

# 14. QR API

Generate

POST

```
/qr/generate
```

Validate

POST

```
/qr/validate
```

History

GET

```
/qr/history
```

---

# 15. Report API

Daily

GET

```
/reports/daily
```

Monthly

GET

```
/reports/monthly
```

Student

GET

```
/reports/student
```

Export Excel

POST

```
/reports/export
```

---

# 16. Settings API

GET

```
/settings
```

PUT

```
/settings
```

---

# 17. Logs API

GET

```
/logs
```

GET

```
/logs/{id}
```

---

# 18. System API

Health

GET

```
/system/health
```

Version

GET

```
/system/version
```

Database

GET

```
/system/database
```

---

# 19. Pagination

Request

```
?page=1

&limit=50
```

Response

```json
{
    "page":1,
    "limit":50,
    "total":500
}
```

---

# 20. Sorting

```
?sort=created_at

&order=desc
```

---

# 21. Searching

```
?search=Yunus
```

---

# 22. Filtering

```
?status=ACTIVE

?class=XI

?date=2026-06-27
```

---

# 23. Error Codes

| Code       | Description       |
| ---------- | ----------------- |
| AUTH001    | Login Failed      |
| AUTH002    | Invalid Token     |
| USER001    | User Not Found    |
| STUDENT001 | Student Not Found |
| QR001      | QR Invalid        |
| QR002      | QR Expired        |
| ATT001     | Attendance Exists |
| ATT002     | Attendance Failed |
| SYSTEM001  | Internal Error    |

---

# 24. Validation Rules

Semua endpoint wajib melakukan validasi:

* Required Field
* Duplicate Data
* Invalid ID
* Invalid QR
* Invalid Session
* Invalid User
* Invalid Date
* Invalid Status

---

# 25. API Versioning

Seluruh endpoint menggunakan

```
/api/v1
```

Apabila terjadi perubahan besar

```
/api/v2
```

Frontend lama tetap dapat digunakan.

---

# 26. Performance Rules

Backend wajib:

* menggunakan Memory Cache
* menggunakan Batch Read
* menggunakan Batch Write
* mengurangi akses langsung ke Spreadsheet
* mengembalikan Response < 500 ms untuk operasi normal

---

# 27. Security Rules

Backend wajib:

* memvalidasi Token
* memvalidasi Input
* melakukan Sanitization
* mencatat Activity Log
* membatasi Request (Rate Limit)

---

# 28. Future Expansion

Module baru cukup menambahkan endpoint baru.

Contoh

```
/teachers

/payments

/inventory

/schedules

/announcements
```

Tanpa mengubah endpoint lama.

---

# Approval

Status : Draft

Dokumen ini merupakan kontrak resmi antara Frontend dan Backend. Perubahan endpoint setelah implementasi harus melalui proses versioning agar kompatibilitas aplikasi tetap terjaga.
