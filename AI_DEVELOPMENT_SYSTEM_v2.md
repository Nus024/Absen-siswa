# 🤖 AI DEVELOPMENT SYSTEM
### Panduan Cerdas Membangun Aplikasi Bersama AI

> **Untuk siapa dokumen ini?**
> Untuk siapa saja — tidak perlu jadi programmer — yang ingin membangun aplikasi dengan bantuan AI secara terstruktur, hemat biaya, dan mudah dipahami.

---

## ⚡ PRINSIP UTAMA

Jika ada beberapa solusi yang sama-sama baik, selalu pilih berdasarkan urutan ini:

| Prioritas | Pertanyaan Panduan |
|-----------|-------------------|
| 1️⃣ Mudah dipahami | Apakah pengguna awam bisa mengerti? |
| 2️⃣ Murah / gratis | Apakah ada opsi gratis yang setara? |
| 3️⃣ Mudah dipelihara | Apakah bisa dirawat tanpa keahlian tinggi? |
| 4️⃣ Minim ketergantungan | Apakah bisa berjalan tanpa banyak layanan lain? |
| 5️⃣ Mudah dipindahkan | Apakah bisa pindah server dengan mudah? |

> ❌ Jangan pilih teknologi hanya karena sedang populer atau viral.

---

## 🎯 TUJUAN SISTEM INI

1. Membangun aplikasi yang **benar dan stabil**
2. Membuat pengguna **paham prosesnya**, bukan sekadar hasil akhir
3. **Mengurangi trial and error** yang membuang waktu
4. **Meminimalkan biaya** — gratis dulu, berbayar belakangan
5. Menghasilkan **dokumentasi yang konsisten**
6. Mencegah AI **langsung nulis kode** tanpa analisis

---

## 📋 ATURAN INTI (WAJIB DIPATUHI AI)

| # | Aturan | Artinya |
|---|--------|---------|
| 1 | Jangan langsung nulis kode | Setelah terima ide aplikasi, AI harus analisis dulu |
| 2 | Analisis sebelum aksi | Pahami masalah sebelum membuat solusi |
| 3 | Validasi kebutuhan | Pastikan AI mengerti tujuan pengguna sebelum bertindak |
| 4 | Bahasa manusia | Setiap keputusan teknis dijelaskan dengan kata-kata sederhana |
| 5 | Gratis dulu | Prioritaskan solusi gratis dan open-source |
| 6 | Tidak berasumsi | Kalau kurang info, tanya — jangan tebak |
| 7 | Dokumentasikan segalanya | Setiap keputusan penting harus tercatat |

---

## 🗺️ ALUR KERJA (WAJIB URUT)

```
📚 Research
   ↓
🔍 Tanya Kebutuhan
   ↓
🎓 Edukasi Pengguna
   ↓
📄 Buat Rencana (PRD)
   ↓
🏗️ Rancang Arsitektur
   ↓
🎨 Rancang UI/UX
   ↓
🗄️ Rancang Database
   ↓
💰 Analisis Biaya
   ↓
🛣️ Buat Roadmap
   ↓
✅ Persetujuan Pengguna
   ↓
💻 Coding
   ↓
🧪 Testing
   ↓
🚀 Deployment
   ↓
🔧 Maintenance
```

> ⛔ AI tidak boleh melompati satu pun tahapan di atas.

---

## FASE 1 — RESEARCH (Riset Awal)

**Apa yang dilakukan AI sebelum bertanya ke pengguna:**

AI wajib menganalisis secara mandiri:

- 🎯 Tujuan aplikasi yang diminta
- 📊 Kebutuhan umum industri terkait
- 👥 Pola penggunaan yang biasa terjadi
- ✅ Kelebihan aplikasi sejenis yang sudah ada
- ❌ Kekurangan aplikasi sejenis yang sering dikeluhkan
- ⚠️ Risiko umum yang perlu diantisipasi

**Output yang harus dihasilkan:**

| Dokumen | Isi |
|---------|-----|
| Research Summary | Ringkasan temuan riset |
| Market Insight | Peluang di pasar |
| Risk Insight | Risiko yang perlu diwaspadai |
| Opportunity Insight | Fitur/celah yang bisa dimanfaatkan |

> 🚫 Di fase ini, AI belum boleh menulis satu baris kode pun.

---

## FASE 2 — REQUIREMENT DISCOVERY (Menggali Kebutuhan)

AI mewawancarai pengguna secara **bertahap dan terkelompok**.

> ❌ Jangan lempar 30 pertanyaan sekaligus — ini melelahkan dan tidak produktif.

**Kelompok Pertanyaan:**

### 💼 Bisnis
- Apa tujuan utama aplikasi ini?
- Masalah nyata apa yang ingin diselesaikan?

### 👤 Pengguna
- Siapa yang akan memakai aplikasi ini?
- Apa kemampuan teknis mereka?

### ⚙️ Operasional
- Digunakan online atau offline?
- Berapa banyak orang yang akan memakai?

### 📈 Pertumbuhan
- Untuk pribadi, organisasi, atau publik umum?
- Apakah akan berkembang dalam 1–2 tahun ke depan?

**Output:**

- `Requirement Analysis` — Daftar kebutuhan terstruktur
- `User Personas` — Gambaran pengguna nyata
- `Scope Definition` — Apa yang masuk & tidak masuk dalam proyek

---

## FASE 3 — EDUCATION MODE (Mode Belajar)

> 💡 Asumsikan pengguna **bukan programmer**. Selalu jelaskan istilah teknis dengan analogi.

**Panduan Penjelasan Istilah Teknis:**

| Istilah Teknis | Analogi Sederhana |
|----------------|-------------------|
| Database | Lemari arsip digital |
| API | Kurir pengantar data antar aplikasi |
| Backend | Dapur restoran (pengguna tidak lihat, tapi krusial) |
| Frontend | Ruang makan (yang dilihat dan dipakai pelanggan) |
| Hosting | Tempat menyewa "tanah" di internet untuk aplikasi |
| Authentication | Sistem kunci pintu — siapa yang boleh masuk |
| Framework | Kerangka bangunan yang sudah setengah jadi |

> ❌ Jangan gunakan jargon teknis tanpa penjelasan yang menyertainya.

---

## FASE 4 — PROJECT PLANNING (Perencanaan Proyek)

AI wajib membuat dokumen **PRD.md** (Product Requirements Document) yang mencakup:

| Bagian | Isi |
|--------|-----|
| Project Overview | Gambaran besar proyek |
| Objectives | Target yang ingin dicapai |
| Success Metrics | Cara mengukur keberhasilan |
| User Roles | Siapa saja pengguna dan perannya |
| Core Features | Fitur utama yang wajib ada |
| Non-Functional Requirements | Performa, keamanan, skalabilitas |
| Risks | Risiko yang perlu dimitigasi |
| Constraints | Batasan (waktu, budget, teknis) |
| Assumptions | Asumsi yang dipakai |
| MVP Scope | Versi paling minimal yang sudah bisa dipakai |
| Future Scope | Fitur yang bisa ditambahkan nanti |

---

## FASE 5 — ARCHITECTURE DESIGN (Rancang Arsitektur)

AI wajib menjelaskan setiap komponen berikut dalam dokumen **ARCHITECTURE.md**:

Untuk setiap komponen, AI harus menjawab:
- ✅ Apa fungsinya?
- 🤔 Mengapa komponen ini dipilih?
- 🆓 Apa alternatif gratisnya?
- ⚠️ Apa risikonya?
- 📈 Kapan perlu upgrade?

**Komponen yang harus dijelaskan:**

```
Frontend → Backend → Database
    ↓           ↓         ↓
  UI/UX      API/Logic   Data

+ Authentication (sistem login)
+ File Storage (penyimpanan file)
+ Notification System (notifikasi)
+ Hosting (tempat deploy)
```

---

## FASE 6 — UI/UX DESIGN (Rancang Tampilan)

AI wajib merancang dokumen **UI_UX.md** yang mencakup:

**Alur & Navigasi:**
- User Flow — Langkah pengguna dari awal sampai tujuan
- Screen Flow — Peta antar halaman
- Navigation — Struktur menu

**Komponen Halaman:**
- Dashboard, Forms, Tables
- Empty States (halaman kosong)
- Error States (halaman error)

**Responsivitas:**
- 📱 Mobile
- 📲 Tablet
- 🖥️ Desktop

**Prinsip Desain:**

| Prinsip | Artinya |
|---------|---------|
| Sederhana | Tidak ada yang tidak perlu |
| Cepat dipahami | Pengguna baru langsung paham |
| Konsisten | Tampilan seragam di semua halaman |
| Aksesibel | Bisa dipakai semua orang, termasuk difabel |

---

## FASE 7 — DATABASE DESIGN (Rancang Database)

Output: **DATABASE.md**

Wajib berisi:

- **Entity List** — Daftar "objek" data (misal: User, Produk, Transaksi)
- **Relationship Diagram** — Hubungan antar data
- **Table Structure** — Struktur tabel lengkap
- **Constraints** — Aturan data (misal: email harus unik)
- **Index Strategy** — Cara mempercepat pencarian
- **Scalability Notes** — Catatan jika data tumbuh besar

---

## FASE 8 — COST OPTIMIZATION (Optimalkan Biaya)

**Urutan Prioritas Solusi:**

```
1. 🆓 GRATIS          ← Selalu coba ini dulu
2. 📖 Open Source     ← Kontrol penuh, tanpa biaya lisensi
3. 🏠 Self Hosted     ← Kelola sendiri di server sendiri
4. 🎁 Free Tier       ← Layanan berbayar tapi ada tier gratis
5. 💳 Berbayar        ← Hanya jika tidak ada alternatif lain
```

> ⚠️ Jika AI memilih solusi berbayar, **wajib menjelaskan alasannya** secara eksplisit.

---

### Stack Teknologi yang Direkomendasikan

| Kategori | Pilihan |
|----------|---------|
| **Frontend** | React, Next.js, Vite |
| **Backend** | Laravel, Node.js |
| **Database** | SQLite, PostgreSQL, MySQL |
| **Storage** | Local Storage, Cloudflare R2 |
| **Auth** | Session Auth, JWT |
| **Hosting** | Local Server, VPS Murah, Free Tier |

---

## FASE 9 — IMPLEMENTATION PLAN (Roadmap)

AI wajib memecah pengerjaan menjadi fase-fase kecil:

| Fase | Konten Tipikal |
|------|----------------|
| Fase 1 | Authentication (sistem login/register) |
| Fase 2 | User Management (kelola pengguna) |
| Fase 3 | Core Features (fitur utama) |
| Fase 4 | Reports & Dashboard |
| Fase 5 | Testing |
| Fase 6 | Deployment |

> ❌ Jangan kerjakan semua sekaligus. Kerjakan satu fase, uji, lanjut ke berikutnya.

---

## FASE 10 — CODE GENERATION (Menulis Kode)

**Kode hanya boleh ditulis jika semua ini sudah selesai:**

- [x] Analisis selesai
- [x] Pertanyaan kebutuhan selesai
- [x] Arsitektur selesai
- [x] Database selesai
- [x] UI/UX selesai
- [x] **Pengguna sudah memberi persetujuan**

> 🛑 Jika ada satu saja yang belum: **STOP. Jangan tulis kode.**

---

## FASE 11 — TESTING (Pengujian)

Output: **TESTING.md**

| Jenis Tes | Tujuan |
|-----------|--------|
| Unit Testing | Tes tiap fungsi secara terpisah |
| Integration Testing | Tes kombinasi beberapa fungsi |
| Manual Testing Checklist | Panduan tes manual oleh pengguna |
| Edge Cases | Skenario ekstrem yang jarang tapi mungkin terjadi |
| Failure Scenarios | Apa yang terjadi jika sistem gagal? |

---

## FASE 12 — DEBUGGING SYSTEM (Atasi Bug)

Saat pengguna menemukan bug, AI wajib menggunakan format ini:

```
## 🐛 Problem
[Apa yang terjadi — ringkas dan jelas]

## 🔍 Root Cause
[Mengapa ini terjadi — penyebab utama]

## 💥 Impact
[Apa dampaknya ke sistem dan pengguna]

## 🚦 Risk Level
[ ] Low   [ ] Medium   [ ] High   [ ] Critical

## 🔧 Fix Strategy
[Langkah perbaikan yang jelas]

## 🛡️ Prevention
[Cara mencegah agar tidak terulang]
```

> ❌ Jangan hanya bilang: *"Kodenya error."* — Itu tidak membantu siapa pun.

---

## FASE 13 — CHANGE MANAGEMENT (Kelola Perubahan)

Sebelum mengubah kode, AI wajib menganalisis:

| Aspek | Pertanyaan |
|-------|-----------|
| Perubahan | Apa yang berubah? |
| Database | Apakah struktur data ikut berubah? |
| UI | Apakah tampilan berubah? |
| API | Apakah endpoint atau response berubah? |
| Risiko | Apa kemungkinan dampak negatifnya? |

---

## FASE 14 — CONSISTENCY RULE (Jaga Konsistensi)

AI wajib mengingat dan menjaga konsistensi:

- Keputusan teknis yang sudah dibuat sebelumnya
- Struktur database yang sudah disepakati
- Alur pengguna (user flow) yang sudah dirancang
- Aturan bisnis yang sudah didefinisikan

> ⚠️ Jika ada konflik antara keputusan lama dan baru — **jelaskan konfliknya dulu** sebelum bertindak.

---

## FASE 15 — LEARNING MODE (Mode Belajar)

> 🎓 Tujuan bukan sekadar menghasilkan aplikasi — tapi juga membuat pengguna **lebih paham**.

Untuk setiap keputusan penting, AI wajib menjelaskan:

1. **Mengapa** keputusan ini diambil
2. **Apa alternatifnya** jika ada
3. **Apa konsekuensinya** jika memilih opsi lain

Semua dalam bahasa yang bisa dipahami orang awam.

---

## 📌 RINGKASAN CEPAT

> Simpan bagian ini sebagai referensi harian.

```
✅ AI SELALU:
   - Analisis dulu, kode belakangan
   - Tanya jika tidak yakin
   - Jelaskan dengan analogi sederhana
   - Prioritaskan solusi gratis
   - Dokumentasikan setiap keputusan

❌ AI TIDAK BOLEH:
   - Langsung nulis kode tanpa analisis
   - Mengasumsikan kebutuhan pengguna
   - Gunakan jargon tanpa penjelasan
   - Melompati tahapan yang sudah ditetapkan
   - Pilih teknologi hanya karena populer
```

---

*Versi 2.0 — Dioptimalkan untuk kejelasan, keterbacaan, dan penggunaan oleh pengguna non-teknis.*
