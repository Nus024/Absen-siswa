# 07-PERFORMANCE.md

# Performance Specification

## Absen Digital Siswa

Version : 2.0

---

# 1. Purpose

Dokumen ini menetapkan standar performa sistem.

Tujuan utama:

* Respon cepat
* Penggunaan resource efisien
* Mengurangi akses langsung ke Google Sheets
* Mengurangi latency
* Mendukung banyak pengguna secara bersamaan

Seluruh implementasi wajib mengikuti dokumen ini.

---

# 2. Performance Goals

Target minimum sistem.

| Operation       | Target      |
| --------------- | ----------- |
| Login           | < 500 ms    |
| QR Validation   | < 300 ms    |
| Attendance Save | < 500 ms    |
| Student Search  | < 200 ms    |
| Settings        | < 500 ms    |
| Report Daily    | < 1 second  |
| Report Monthly  | < 2 seconds |
| Export XLSX     | < 5 seconds |

---

# 3. Architecture Strategy

Sistem tidak membaca Spreadsheet setiap request.

Flow

```text id="b5pqig"
Client

↓

REST API

↓

Memory Cache

↓

Spreadsheet (Jika diperlukan)
```

---

# 4. Cache Strategy

Backend memiliki Memory Cache.

Data yang di-cache:

* USERS
* SISWA
* KELAS
* SESI
* SETTINGS

Data transaksi tidak di-cache permanen.

---

# 5. Cache Lifecycle

```text id="3ibd2i"
Server Start

↓

Load Spreadsheet

↓

Memory Cache

↓

Read Cache

↓

Spreadsheet Updated

↓

Refresh Cache
```

---

# 6. Read Strategy

Prioritas pembacaan data.

```text id="rj9jxq"
Memory Cache

↓

Spreadsheet

↓

Response
```

Spreadsheet hanya dibaca apabila cache tidak tersedia atau telah kedaluwarsa.

---

# 7. Write Strategy

Semua penulisan data mengikuti urutan berikut.

```text id="kmds9z"
Validation

↓

Business Logic

↓

Spreadsheet

↓

Update Cache

↓

Response
```

---

# 8. Batch Read

Tidak diperbolehkan membaca baris satu per satu.

Backend membaca seluruh Sheet dalam satu request.

Contoh

```text id="xg7m6h"
SISWA

↓

Seluruh Data

↓

Memory Cache
```

---

# 9. Batch Write

Jika terdapat banyak perubahan.

Gunakan Batch Update.

Contoh

```text id="6gnm1g"
100 Attendance

↓

1 Batch Request

↓

Spreadsheet
```

Bukan:

100 Request.

---

# 10. Search Strategy

Search dilakukan pada Memory Cache.

Bukan langsung pada Spreadsheet.

Flow

```text id="ytzy3g"
Search

↓

Cache

↓

Result
```

---

# 11. QR Validation Strategy

QR Validation harus menggunakan cache.

Flow

```text id="0h4g6m"
QR Token

↓

Memory Index

↓

Student

↓

Response
```

Tidak melakukan scan seluruh Spreadsheet.

---

# 12. Memory Index

Backend membuat Index.

Contoh

```text id="0n6jlwm"
QR_TOKEN

↓

SISWA_ID
```

```text id="x4vuvn"
NIS

↓

SISWA
```

```text id="n0j3zb"
USERNAME

↓

USER
```

Lookup dilakukan melalui Index.

---

# 13. Duplicate Check

Duplicate Attendance menggunakan Memory Cache.

Tidak membaca Spreadsheet setiap kali.

---

# 14. Report Generation

Backend melakukan:

* Filter
* Group
* Aggregate

Frontend hanya menerima JSON hasil akhir.

---

# 15. Pagination

Semua data besar wajib menggunakan pagination.

Contoh

```text id="y58qnt"
?page=1

&limit=100
```

---

# 16. Lazy Loading

Halaman besar wajib menggunakan Lazy Loading.

Contoh:

* Report
* Logs
* History

---

# 17. Debounce Search

Search menggunakan Debounce.

Contoh

300 ms

untuk mengurangi request API.

---

# 18. Queue System

Semua proses berat dimasukkan ke Queue.

Contoh

* Import
* Export
* Backup

---

# 19. Import Strategy

Flow

```text id="bcs4y0"
Read Excel

↓

Validation

↓

Memory

↓

Batch Write

↓

Spreadsheet
```

---

# 20. Export Strategy

Flow

```text id="n0v4xt"
Read Cache

↓

Generate XLSX

↓

Download
```

Tidak membaca Spreadsheet berulang kali.

---

# 21. Offline Queue

Jika Offline.

```text id="9vcmke"
Attendance

↓

IndexedDB

↓

Queue

↓

Reconnect

↓

Sync
```

Tidak ada data yang hilang.

---

# 22. Retry Strategy

Jika Google Sheets gagal.

```text id="hf9k2t"
Try

↓

Retry 1

↓

Retry 2

↓

Retry 3

↓

Error
```

Retry menggunakan Exponential Backoff.

---

# 23. Cache Refresh

Cache diperbarui apabila:

* Data berubah
* Import selesai
* Settings berubah
* Login pertama
* Manual Refresh

---

# 24. Concurrency Strategy

Jika terdapat banyak Scanner.

Flow

```text id="hdgkpb"
Request

↓

Queue

↓

Validation

↓

Write

↓

Response
```

Mencegah konflik penulisan data.

---

# 25. Google Sheets Optimization

Spreadsheet dioptimalkan dengan:

* Sheet terpisah berdasarkan fungsi.
* Tidak menggunakan Formula kompleks.
* Tidak menggunakan Filter View.
* Tidak menggunakan Conditional Formatting berlebihan.
* Tidak menggunakan Merge Cell.
* Header tetap pada baris pertama.
* Data bersifat tabular.

---

# 26. Frontend Optimization

Frontend wajib:

* Lazy Import
* Code Splitting
* Asset Compression
* Image Optimization
* Local Cache
* Request Cancellation

---

# 27. Backend Optimization

Backend wajib:

* Memory Cache
* Memory Index
* Batch Read
* Batch Write
* Connection Reuse
* Async Processing

---

# 28. Monitoring

Parameter yang dipantau:

* API Response Time
* Spreadsheet Read Time
* Spreadsheet Write Time
* Cache Hit Ratio
* Cache Miss Ratio
* Failed Request
* Queue Length
* Memory Usage

---

# 29. Scalability

Target minimal sistem:

* 5.000 siswa
* 100.000 data absensi
* 20 operator aktif
* 10 scanner aktif bersamaan
* 500 request per menit

Tanpa perubahan arsitektur utama.

---

# 30. Performance Checklist

☐ Memory Cache aktif

☐ Batch Read aktif

☐ Batch Write aktif

☐ Memory Index aktif

☐ Lazy Loading aktif

☐ Debounce Search aktif

☐ Queue aktif

☐ Retry aktif

☐ Pagination aktif

☐ Cache Refresh aktif

☐ Monitoring aktif

---

# 31. Definition of Done

Implementasi performa dianggap selesai apabila:

✓ Tidak ada pembacaan Spreadsheet pada setiap request.

✓ Seluruh pencarian menggunakan Memory Cache.

✓ QR Validation menggunakan Memory Index.

✓ Penulisan data menggunakan Batch Write jika memungkinkan.

✓ Proses berat menggunakan Queue.

✓ Tidak ada penurunan performa saat jumlah data meningkat.

✓ Seluruh target waktu respons pada dokumen ini terpenuhi.

---

# Approval

Status : Draft

Dokumen ini menjadi standar optimasi sistem. Seluruh implementasi backend dan frontend wajib mengikuti strategi performa yang ditetapkan agar aplikasi tetap cepat meskipun menggunakan Google Sheets sebagai media penyimpanan.
