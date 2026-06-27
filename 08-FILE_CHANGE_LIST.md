# 08-FILE_CHANGE_LIST.md

# File Change List

## Absen Digital Siswa

Version : 2.0

---

# 1. Purpose

Dokumen ini mendefinisikan seluruh perubahan file selama proses migrasi dari:

Google Sheets REST API

↓

Google Sheets REST API

Dokumen ini menjadi checklist implementasi.

Tidak boleh ada perubahan file di luar daftar ini tanpa evaluasi.

---

# 2. Change Categories

Seluruh file dikelompokkan menjadi:

* Keep
* Modify
* Replace
* Remove
* Create

---

# 3. KEEP (Dipertahankan)

File berikut dipertahankan.

Karena tidak bergantung langsung pada Google Sheets REST API.

```text id="n3a5sx"
src/

pages/

components/

hooks/

styles/

assets/

icons/

layouts/

scanner/

utils/

theme/
```

Tidak perlu perubahan besar.

---

# 4. MODIFY (Dimodifikasi)

File berikut tetap digunakan tetapi implementasinya berubah.

```text id="8lp4dz"
src/lib/db/*

src/services/*

src/context/Auth*

src/context/User*

src/utils/request*

src/utils/auth*
```

Perubahan:

* Menghapus Google Sheets REST API SDK.
* Menggunakan REST API.

---

# 5. REPLACE (Diganti)

Implementasi lama diganti sepenuhnya.

Old

```text id="j0u2hs"
google sheets REST apiClient.js
```

↓

New

```text id="nnnn7p"
apiClient.js
```

---

Old

```text id="sujl0r"
attendanceService.js
```

↓

New

```text id="rjyb5i"
attendanceApi.js
```

---

Old

```text id="pxnps2"
studentService.js
```

↓

New

```text id="gkn5q0"
studentsApi.js
```

---

Old

```text id="6b8xw2"
userService.js
```

↓

New

```text id="t0owll"
usersApi.js
```

---

Old

```text id="2ff2j8"
settingsService.js
```

↓

New

```text id="25e0fz"
settingsApi.js
```

---

# 6. REMOVE (Dihapus)

Seluruh file yang hanya digunakan oleh Google Sheets REST API.

Contoh

```text id="vjlwmx"
google sheets REST api.js

google sheets REST apiClient.js

google sheets REST apiAuth.js

google sheets REST apiStorage.js

rpc/

realtime/

subscription/
```

Tidak ada dependensi Google Sheets REST API yang boleh tersisa.

---

# 7. CREATE (File Baru)

Backend

```text id="lazr2y"
backend/

controllers/

services/

repositories/

middlewares/

validators/

routes/

config/

helpers/

logs/
```

---

Frontend

```text id="nd13p3"
src/api/

apiClient.js

request.js

response.js

errorHandler.js
```

---

# 8. API Layer

Buat folder baru.

```text id="drj0d4"
src/api/

auth.js

users.js

students.js

classes.js

attendance.js

permissions.js

reports.js

settings.js

system.js
```

Seluruh komunikasi dilakukan melalui folder ini.

---

# 9. Backend Controllers

```text id="qjlwmc"
AuthController

UserController

StudentController

AttendanceController

PermissionController

ReportController

SettingsController

QRController
```

Controller hanya menerima Request dan mengirim Response.

---

# 10. Backend Services

```text id="t5umlp"
AuthService

UserService

StudentService

AttendanceService

PermissionService

QRService

ReportService
```

Berisi seluruh Business Logic.

---

# 11. Repository Layer

```text id="2htfkm"
UserRepository

StudentRepository

AttendanceRepository

SettingsRepository

LogRepository
```

Repository hanya berkomunikasi dengan Google Sheets API.

---

# 12. Middleware

```text id="f6a8rx"
Authentication

Authorization

Validation

Logger

RateLimiter

ErrorHandler
```

---

# 13. Validators

```text id="7u7hns"
StudentValidator

AttendanceValidator

QRValidator

UserValidator

SettingsValidator
```

Semua Request divalidasi.

---

# 14. Helpers

```text id="dfavm6"
DateHelper

TokenHelper

HashHelper

QRHelper

ExcelHelper

ResponseHelper

LoggerHelper
```

---

# 15. Config

```text id="tmkvqg"
config/

google.js

jwt.js

cache.js

app.js
```

---

# 16. Environment

Tambahkan

```text id="n2qln4"
GOOGLE_PROJECT_ID

GOOGLE_CLIENT_EMAIL

GOOGLE_PRIVATE_KEY

SPREADSHEET_ID

JWT_SECRET

API_SECRET
```

Hapus

```text id="h2pp3m"
GOOGLE_SHEETS_URL

GOOGLE_SHEETS_KEY
```

---

# 17. Authentication Files

File lama

↓

Login menggunakan Google Sheets REST API

↓

Diganti menjadi

REST Login

↓

JWT

↓

Session

---

# 18. Attendance Files

Semua file Attendance tetap dipertahankan.

Yang berubah hanya sumber data.

Old

Google Sheets REST API

↓

New

REST API

---

# 19. Scanner Files

Scanner tidak berubah.

Yang berubah hanya endpoint validasi.

Old

```text id="dspzdz"
Google Sheets REST API Query
```

↓

New

```text id="g9d8nf"
POST /qr/validate
```

---

# 20. Report Files

UI tetap.

Perubahan hanya:

Data Source.

Old

Google Sheets REST API

↓

New

REST API

---

# 21. Import Files

Import Excel tetap.

Perubahan:

Insert

↓

REST API

↓

Spreadsheet

---

# 22. Export Files

Tetap.

Backend menghasilkan:

* XLSX
* CSV
* JSON

---

# 23. Assets

Tidak berubah.

Logo

Audio

QR

Image

tetap digunakan.

---

# 24. Folder Rules

Frontend

Tidak boleh:

* mengakses Spreadsheet
* menyimpan Secret
* menjalankan Business Logic

Backend

Harus:

* Authentication
* Validation
* Business Logic
* Google Sheets

---

# 25. Migration Priority

Urutan perubahan.

1.

Environment

↓

2.

API Client

↓

3.

Repository

↓

4.

Services

↓

5.

Controllers

↓

6.

Frontend Service

↓

7.

Testing

---

# 26. Rollback Files

Backup sebelum perubahan.

```text id="7rygrs"
src/

backend/

.env

package.json

Spreadsheet
```

Rollback hanya dilakukan jika migrasi gagal.

---

# 27. File Checklist

KEEP

☐ Pages

☐ Components

☐ Assets

☐ Scanner

---

MODIFY

☐ Services

☐ Context

☐ Utils

---

REMOVE

☐ Google Sheets REST API SDK

☐ RPC

☐ Realtime

☐ Subscription

---

CREATE

☐ API Layer

☐ Backend

☐ Repository

☐ Middleware

☐ Validators

☐ Helpers

☐ Config

---

# 28. Definition of Done

Migrasi file dianggap selesai apabila:

✓ Tidak ada file yang mengimpor Google Sheets REST API.

✓ Seluruh komunikasi menggunakan REST API.

✓ Struktur folder mengikuti Architecture V2.

✓ Seluruh konfigurasi dipindahkan ke Environment Variable.

✓ Semua modul berhasil dikompilasi tanpa error.

✓ Seluruh fitur dapat berjalan menggunakan implementasi baru.

---

# Approval

Status : Draft

Dokumen ini menjadi referensi resmi implementasi. Seluruh perubahan file selama proses migrasi wajib mengacu pada daftar ini agar proses berjalan terstruktur, terdokumentasi, dan mudah diaudit.
