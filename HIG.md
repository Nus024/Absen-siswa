# iOS Human Interface Guideline (HIG) Style System
## QR Attendance School System — Design Precision Rules

> Tujuan dokumen ini adalah memastikan seluruh UI aplikasi memiliki konsistensi visual, spacing, typography, hierarchy, dan interaction pattern seperti aplikasi native iOS modern — bukan dashboard template generik.

---

# 1. DESIGN PRINCIPLES

## Core Principles
- Clean and calm interface
- Functional before decorative
- Dense but readable information
- Touch-friendly interaction
- Minimal visual noise
- Consistent spacing system
- Strong typography hierarchy
- Fast scan workflow priority
- Native iOS feeling

## Avoid
- Gradient berlebihan
- Shadow tebal
- Card terlalu banyak
- Icon emoji
- Border keras
- Warna mencolok
- Sidebar penuh icon random
- UI seperti template admin AI
- Spacing tidak konsisten
- Typography terlalu kecil
- Terlalu banyak warna

---

# 2. TYPOGRAPHY SYSTEM

## Font Family
Gunakan:

```css
font-family:
  "SF Pro Display",
  "SF Pro Text",
  -apple-system,
  BlinkMacSystemFont,
  sans-serif;
```

## Typography Scale

| Usage | Size | Weight | Line Height |
|---|---|---|---|
| Large Title | 34px | 700 | 41px |
| Title 1 | 28px | 700 | 34px |
| Title 2 | 22px | 700 | 28px |
| Title 3 | 20px | 600 | 25px |
| Headline | 17px | 600 | 22px |
| Body | 17px | 400 | 22px |
| Callout | 16px | 400 | 21px |
| Subheadline | 15px | 400 | 20px |
| Footnote | 13px | 400 | 18px |
| Caption | 12px | 400 | 16px |

## Rules
- Jangan gunakan font < 13px
- Hindari terlalu banyak weight berbeda
- Gunakan max 3 hierarchy typography per section
- Dashboard utama gunakan:
  - Title 2
  - Headline
  - Body
- Informasi penting gunakan weight 600, bukan warna mencolok

---

# 3. SPACING SYSTEM

Gunakan sistem spacing 4pt iOS.

## Base Unit

| Token | Value |
|---|---|
| xs | 4px |
| sm | 8px |
| md | 12px |
| lg | 16px |
| xl | 20px |
| 2xl | 24px |
| 3xl | 32px |
| 4xl | 40px |

## Rules
- Jangan gunakan spacing random
- Semua margin/padding wajib mengikuti token
- Antar card utama: 16–20px
- Antar form field: 12px
- Padding page horizontal mobile: 16px
- Padding dashboard desktop: 24px
- Section vertical spacing: 32px

---

# 4. GRID & LAYOUT

## Mobile First Layout
Gunakan:
- single column priority
- thumb reachable area
- sticky action bottom
- compact navigation

## Max Width
```css
max-width: 1440px;
margin: auto;
```

## Content Width
| Area | Width |
|---|---|
| Form | 480–640px |
| Dashboard content | 1200–1440px |
| Scanner page | full screen |
| Table report | fluid |

---

# 5. BORDER RADIUS

Gunakan radius iOS modern.

| Component | Radius |
|---|---|
| Button | 12px |
| Card | 18px |
| Modal | 24px |
| Input | 14px |
| Floating Action | 999px |

## Rules
- Hindari radius terlalu kecil
- Hindari radius ekstrem berlebihan
- Konsisten seluruh aplikasi

---

# 6. COLOR SYSTEM

## Base Colors

### Light Mode
```css
--bg-primary: #F5F5F7;
--bg-secondary: #FFFFFF;
--text-primary: #111111;
--text-secondary: #6E6E73;
--separator: #D2D2D7;
--accent: #0071E3;
--success: #34C759;
--warning: #FF9F0A;
--danger: #FF3B30;
```

### Dark Mode
```css
--bg-primary: #000000;
--bg-secondary: #1C1C1E;
--text-primary: #FFFFFF;
--text-secondary: #98989D;
--separator: #38383A;
```

## Rules
- Jangan gunakan pure black untuk card
- Hindari warna terlalu saturated
- Gunakan warna hanya untuk state penting
- Default interface harus netral

---

# 7. SHADOW SYSTEM

Gunakan soft shadow ala iOS.

```css
box-shadow:
0 1px 2px rgba(0,0,0,0.04),
0 4px 12px rgba(0,0,0,0.06);
```

## Rules
- Shadow sangat subtle
- Jangan gunakan shadow keras
- Hindari glow effect

---

# 8. NAVIGATION SYSTEM

## Sidebar Desktop
- Width: 240px
- Floating feel
- Semi-transparent background
- Active state soft highlight
- Max 1 icon + label

## Bottom Navigation Mobile
- Height: 72px
- Blur background
- Floating style
- Max 5 items
- Large touch target

## Navigation Rules
- Maksimal 2 level hierarchy
- Jangan nested menu kompleks
- Scanner harus bisa diakses 1 tap

---

# 9. BUTTON SYSTEM

## Primary Button
```css
height: 48px;
padding: 0 20px;
font-size: 17px;
font-weight: 600;
border-radius: 12px;
```

## Secondary Button
- transparent background
- soft border
- neutral color

## Rules
- Semua button minimum height 44px
- Touch target minimum 44x44
- Hindari button terlalu kecil

---

# 10. INPUT SYSTEM

## Input Style
```css
height: 52px;
padding: 0 16px;
border-radius: 14px;
font-size: 16px;
```

## Rules
- Input jangan terlalu tipis
- Gunakan subtle border
- Focus state gunakan accent soft
- Error state jangan terlalu merah mencolok

---

# 11. TABLE SYSTEM

## Table Rules
- Dense but readable
- Sticky header
- Zebra subtle rows
- Horizontal scroll mobile
- Rounded container

## Height
```css
row-height: 52px;
```

## Typography
- Header: 13px semibold
- Cell: 14–15px regular

---

# 12. CARD SYSTEM

## Rules
- Gunakan card hanya jika perlu grouping
- Hindari nested card
- Hindari card dalam card

## Padding
```css
padding: 20px;
```

---

# 13. SCANNER UX RULES

## Scanner Priority
Scanner adalah fitur utama.

## Rules
- Kamera langsung aktif
- Auto focus
- Auto detect QR
- Feedback instan
- Tidak perlu klik tambahan
- Setelah scan langsung siap scan berikutnya

## Feedback
### Success
- Haptic vibration
- Sound soft click
- Green confirmation < 1 second

### Duplicate
- Yellow warning
- Auto dismiss

### Error
- Red minimal alert
- Jangan popup besar

---

# 14. ANIMATION SYSTEM

## Duration
| Type | Duration |
|---|---|
| Fast | 120ms |
| Normal | 180ms |
| Modal | 240ms |

## Easing
```css
cubic-bezier(0.25, 0.1, 0.25, 1);
```

## Rules
- Hindari animation berlebihan
- Fokus smoothness
- Prioritaskan responsiveness

---

# 15. ICON SYSTEM

## Gunakan
- Lucide
- SF Symbols style
- Outline icons

## Rules
- Consistent stroke width
- Hindari emoji
- Hindari icon filled campur outline

---

# 16. DASHBOARD RULES

## Dashboard harus:
- cepat dibaca
- fokus data penting
- tidak terlalu banyak widget
- compact namun elegan

## Hindari:
- card analytics berlebihan
- chart tidak penting
- empty spacing besar

## Prioritas:
1. status scan realtime
2. siswa belum hadir
3. izin keluar
4. quick actions
5. rekap singkat

---

# 17. RESPONSIVE RULES

## Mobile
- priority platform
- scanner optimized
- bottom nav
- compact spacing

## Tablet
- split layout
- sidebar collapse

## Desktop
- wider table
- multi panel dashboard

---

# 18. PERFORMANCE UI RULES

## Rules
- Hindari animation berat
- Hindari glassmorphism berlebihan
- Hindari blur besar
- Gunakan lazy loading
- Skeleton loading minimal
- Optimasi render tabel besar

---

# 19. DESIGN CONSISTENCY RULES

WAJIB:
- Semua radius konsisten
- Semua spacing konsisten
- Semua typography konsisten
- Semua button konsisten
- Semua icon konsisten
- Semua interaction predictable

DILARANG:
- Random spacing
- Random font size
- Random color
- Random shadow
- Random animation

---

# 20. FINAL DESIGN GOAL

Aplikasi harus terasa seperti:
- sistem internal Apple Education
- software operasional sekolah premium
- native iPadOS productivity app

BUKAN:
- template dashboard admin
- hasil generator AI
- template Tailwind umum
- clone SaaS startup
- UI penuh card dan gradient