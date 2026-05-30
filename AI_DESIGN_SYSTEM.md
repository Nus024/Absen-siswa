# 🎨 AI_DESIGN_SYSTEM.md
### Sistem Standar Desain UI/UX untuk Pengembangan Aplikasi Bersama AI

> **Untuk siapa?**
> Dokumen ini digunakan AI untuk merancang tampilan aplikasi yang konsisten, indah, dan mudah dipakai — bahkan oleh pengguna yang tidak berlatar desain.

---

## 🎯 TUJUAN

1. Menjaga **konsistensi visual** di seluruh halaman aplikasi
2. Membuat UI yang **mudah dipahami pengguna awam**
3. Mengurangi keputusan desain yang berulang
4. Menghasilkan tampilan yang **profesional tanpa desainer mahal**
5. Memastikan aplikasi **bisa dipakai semua orang** (aksesibel)

---

## ⚡ PRINSIP DESAIN UTAMA

| Prinsip | Penjelasan Sederhana |
|---------|----------------------|
| **Sederhana** | Jika bisa dihapus tanpa mengurangi fungsi, hapus saja |
| **Konsisten** | Tombol yang sama harus terlihat sama di semua halaman |
| **Jelas** | Pengguna tahu apa yang harus dilakukan tanpa diberi instruksi |
| **Cepat** | Halaman yang lambat = pengguna kabur |
| **Aksesibel** | Bisa dipakai oleh semua orang, termasuk yang berkebutuhan khusus |
| **Responsif** | Tampil baik di HP, tablet, dan komputer |

---

## 🎨 FONDASI DESAIN

### 1. Warna (Color Palette)

Setiap aplikasi wajib mendefinisikan palet warna sebelum coding:

```
Struktur Warna:

PRIMARY     → Warna utama brand (tombol utama, link, aksen)
SECONDARY   → Warna pendukung (tombol sekunder, badge)
NEUTRAL     → Abu-abu untuk teks, border, background
SUCCESS     → Hijau untuk pesan berhasil
WARNING     → Kuning/oranye untuk peringatan
DANGER      → Merah untuk error dan hapus
INFO        → Biru muda untuk informasi
```

**Aturan Warna:**

| Aturan | Alasan |
|--------|--------|
| Maksimal 3 warna dominan per halaman | Lebih dari itu terlihat kacau |
| Kontras teks minimal 4.5:1 | Standar aksesibilitas WCAG |
| Jangan pakai warna satu-satunya sebagai penanda | Pertimbangkan pengguna buta warna |
| Gunakan CSS Variables | Memudahkan ganti tema |

**Contoh Variabel CSS:**
```css
:root {
  --color-primary:    #2563EB;
  --color-secondary:  #7C3AED;
  --color-success:    #16A34A;
  --color-warning:    #D97706;
  --color-danger:     #DC2626;
  --color-neutral-50: #F9FAFB;
  --color-neutral-900:#111827;
}
```

---

### 2. Tipografi (Typography)

```
Hierarki Teks:

H1  → Judul halaman utama     (32–40px, bold)
H2  → Judul seksi             (24–28px, semibold)
H3  → Sub-judul               (18–22px, semibold)
H4  → Label / kartu           (16–18px, medium)
Body → Konten utama           (14–16px, regular)
Small → Caption / footnote    (12–13px, regular)
```

**Aturan Tipografi:**

| Aturan | Mengapa |
|--------|---------|
| Maksimal 2 jenis font per aplikasi | Lebih dari itu tampak tidak profesional |
| Line height minimal 1.5× untuk body text | Lebih mudah dibaca |
| Panjang baris optimal 60–80 karakter | Mata tidak terlalu jauh bergerak |
| Jangan gunakan font ukuran < 12px | Sulit dibaca |

---

### 3. Spacing (Ruang Kosong)

Gunakan sistem kelipatan yang konsisten:

```
Skala Spacing:

4px   → xs   (jarak antar elemen sangat kecil)
8px   → sm   (padding dalam tombol kecil)
12px  → md   (jarak antar label dan input)
16px  → lg   (padding standar kartu)
24px  → xl   (jarak antar seksi)
32px  → 2xl  (margin halaman)
48px  → 3xl  (jarak antar blok besar)
64px  → 4xl  (section header)
```

> 💡 Ruang kosong bukan pemborosan — ia membuat konten lebih mudah dibaca dan terlihat premium.

---

### 4. Border Radius

```
none   → 0px    (tampilan tegas/industrial)
sm     → 4px    (tombol, input)
md     → 8px    (kartu, panel)
lg     → 12px   (modal, drawer)
xl     → 16px   (card besar)
full   → 9999px (badge, avatar, pill button)
```

---

### 5. Shadow (Bayangan)

```
shadow-sm   → Kartu ringan, hover state
shadow-md   → Kartu utama, dropdown
shadow-lg   → Modal, sidebar
shadow-xl   → Drawer, panel mengambang
```

---

## 🧩 KOMPONEN UI STANDAR

### Tombol (Button)

| Varian | Kegunaan | Tampilan |
|--------|----------|----------|
| Primary | Aksi utama (Simpan, Submit) | Background warna primer, teks putih |
| Secondary | Aksi pendukung | Border, background transparan |
| Ghost | Aksi tersier | Teks saja, tanpa border |
| Danger | Aksi berbahaya (Hapus) | Background merah |
| Disabled | Tidak bisa diklik | Opacity 50%, cursor not-allowed |

**Aturan Tombol:**
- Setiap halaman maksimal **1 tombol primary**
- Teks tombol harus berupa **kata kerja** (Simpan, Batal, Hapus — bukan "OK")
- Ukuran minimal tombol: **44×44px** (standar touch target mobile)
- Selalu tampilkan **loading state** saat proses berjalan

---

### Form & Input

```
Struktur Form yang Benar:

[Label]          ← Selalu di atas, bukan di dalam input
[Input Field]    ← Dengan placeholder sebagai contoh, bukan label
[Helper Text]    ← Opsional: panduan mengisi
[Error Message]  ← Merah, spesifik, di bawah input yang salah
```

**Aturan Form:**

| Aturan | Alasan |
|--------|--------|
| Label selalu terlihat, bukan placeholder saja | Placeholder hilang saat diketik |
| Validasi real-time untuk email, nomor telepon | Feedback langsung lebih baik |
| Tandai field wajib dengan `*` | Pengguna tahu mana yang harus diisi |
| Pesan error harus spesifik | "Email tidak valid" lebih baik dari "Error" |
| Gunakan input yang tepat | `type="email"`, `type="tel"`, `type="date"` |

---

### Tabel (Table)

```
Struktur Tabel yang Baik:

┌─ Header (sticky jika tabel panjang)
├─ Row ganjil: background putih
├─ Row genap: background abu muda (zebra striping)
├─ Hover: highlight ringan
└─ Actions: di kolom paling kanan
```

**Aturan Tabel:**
- Selalu tampilkan **empty state** jika data kosong
- Tabel wajib punya **pagination** jika data > 10 baris
- Kolom angka: **rata kanan**
- Kolom teks: **rata kiri**
- Sertakan **search/filter** jika data > 50 baris
- Di mobile: gunakan **card view** sebagai alternatif tabel

---

### Navigasi

```
Jenis Navigasi per Platform:

Desktop:
├─ Sidebar (untuk aplikasi kompleks, banyak menu)
└─ Top Navigation (untuk aplikasi sederhana)

Mobile:
├─ Bottom Navigation (maksimal 5 menu utama)
└─ Hamburger Menu (untuk menu yang banyak)
```

**Aturan Navigasi:**
- Halaman aktif harus **jelas tanda aktifnya**
- Jangan sembunyikan navigasi utama di dalam dropdown berlapis
- Breadcrumb wajib ada jika kedalaman halaman > 2 level
- Logo/nama app selalu bisa diklik untuk kembali ke home

---

### Kartu (Card)

```
Struktur Card:

┌──────────────────────────────┐
│  [Image/Icon]  (opsional)    │
│  Judul Kartu                 │
│  Deskripsi singkat           │
│  [Meta: tanggal, status]     │
│  [Tombol Aksi]               │
└──────────────────────────────┘
```

**Aturan Kartu:**
- Semua kartu dalam satu grid harus tingginya seragam
- Gunakan skeleton loading, bukan spinner, saat kartu sedang load
- Kartu yang bisa diklik harus ada visual feedback (hover, cursor pointer)

---

### Modal & Dialog

| Jenis | Kapan Dipakai |
|-------|---------------|
| Confirmation Dialog | Konfirmasi aksi berbahaya (hapus, kirim) |
| Form Modal | Input data tanpa pindah halaman |
| Info Modal | Menampilkan detail/preview |
| Alert Dialog | Pesan penting yang butuh perhatian |

**Aturan Modal:**
- Selalu ada tombol **tutup (×)** yang jelas
- Klik di luar modal = tutup modal (kecuali untuk aksi kritis)
- Jangan buka modal di atas modal
- Ukuran maksimal: 90% lebar layar

---

## 📱 DESAIN RESPONSIF

### Breakpoint Standar

```
xs:   < 480px   → HP kecil
sm:   480–767px → HP besar
md:   768–1023px→ Tablet
lg:   1024–1279px→ Laptop
xl:   ≥ 1280px  → Desktop besar
```

### Aturan Mobile-First

| Prinsip | Implementasi |
|---------|-------------|
| Desain dari layar kecil ke besar | Mulai dari mobile, tambahkan untuk desktop |
| Touch target minimal 44×44px | Tombol tidak boleh terlalu kecil |
| Font minimal 16px di mobile | Mencegah zoom otomatis browser |
| Tabel jadi card di mobile | Tabel tidak cocok di layar kecil |
| Hapus konten dekoratif di mobile | Prioritaskan konten utama |

---

## 🔄 STATE & FEEDBACK

Setiap elemen interaktif wajib punya minimal 4 state:

```
DEFAULT  → Tampilan normal
HOVER    → Saat mouse di atasnya (desktop)
ACTIVE   → Saat diklik/ditekan
DISABLED → Tidak bisa diinteraksi
```

Untuk data/konten, wajib ada:

```
LOADING  → Saat data sedang dimuat (skeleton/spinner)
EMPTY    → Saat tidak ada data
ERROR    → Saat terjadi kesalahan
SUCCESS  → Saat aksi berhasil
```

### Panduan Empty State

```
Struktur Empty State yang Baik:

[Ilustrasi/Ikon]    ← Visual yang relevan
[Judul]             ← "Belum ada data produk"
[Deskripsi]         ← "Mulai tambahkan produk pertama Anda"
[Tombol Aksi]       ← "Tambah Produk" (opsional)
```

> ❌ Jangan biarkan halaman kosong tanpa penjelasan.

---

## ♿ AKSESIBILITAS (A11Y)

| Standar | Implementasi |
|---------|-------------|
| Kontras warna minimal 4.5:1 | Teks di atas background harus terbaca jelas |
| Semua gambar punya `alt` text | Untuk pembaca layar (screen reader) |
| Form punya label yang terhubung | `<label for="id">` atau `aria-label` |
| Navigasi bisa dengan keyboard | Tab, Enter, Escape harus berfungsi |
| Jangan pakai warna saja sebagai info | Tambahkan ikon atau teks |
| Fokus element selalu terlihat | Jangan hapus `outline` tanpa pengganti |

---

## 🌙 TEMA GELAP (Dark Mode)

Jika aplikasi mendukung dark mode, gunakan pendekatan berikut:

```css
/* Light mode (default) */
:root {
  --bg-primary:   #FFFFFF;
  --bg-secondary: #F9FAFB;
  --text-primary: #111827;
  --text-secondary:#6B7280;
  --border:       #E5E7EB;
}

/* Dark mode */
[data-theme="dark"] {
  --bg-primary:   #0F172A;
  --bg-secondary: #1E293B;
  --text-primary: #F1F5F9;
  --text-secondary:#94A3B8;
  --border:       #334155;
}
```

> ✅ Gunakan variabel CSS sejak awal agar pergantian tema semudah mengganti satu atribut.

---

## 📋 CHECKLIST DESAIN SEBELUM CODING

Sebelum mulai coding UI, pastikan semua ini sudah ada:

- [ ] Palet warna didefinisikan (minimal: primary, neutral, success, danger)
- [ ] Skala tipografi ditentukan (H1–H4, body, small)
- [ ] Sistem spacing disepakati (4px, 8px, 16px, dll.)
- [ ] Komponen dasar dirancang (button, input, card, nav)
- [ ] Responsive breakpoint ditentukan
- [ ] Empty state setiap halaman dirancang
- [ ] Error state setiap form dirancang
- [ ] Loading state ditentukan (skeleton atau spinner)
- [ ] Aksesibilitas dasar dipastikan

---

## 🚫 ANTI-PATTERN (JANGAN DILAKUKAN)

| Anti-Pattern | Masalah | Solusi |
|-------------|---------|--------|
| Warna teks abu di background putih | Kontras rendah, sulit dibaca | Gunakan teks gelap |
| Placeholder sebagai label | Hilang saat diketik | Pakai label di atas input |
| Tombol tanpa teks (ikon saja) | Tidak jelas fungsinya | Tambah teks atau tooltip |
| Modal berlapis | Membingungkan pengguna | Gunakan halaman baru atau sidebar |
| Terlalu banyak font dan warna | Tampak tidak profesional | Maksimal 2 font, 3 warna utama |
| Animasi di mana-mana | Mengganggu fokus, memberatkan HP | Animasi hanya di momen kunci |
| Form tanpa validasi | Pengguna bingung saat salah | Selalu berikan feedback error |

---

*Versi 1.0 — AI Design System untuk aplikasi web & mobile modern.*
