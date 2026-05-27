// ============================================================
// pages/ScannerPage.jsx — Professional fullscreen QR scanner
// iOS/QRIS mobile scanner feel
// ============================================================
import { useState, useCallback, useRef, useEffect } from 'react';
import { ContinuousScanner } from '../features/scanner/ContinuousScanner';
import { queueScan } from '../features/scanner/OfflineQueue';
import { siswaDB, absensiDB, sesiDB, izinDB, kelasDB } from '../lib/localDB';
import { parseQR, todayStr, formatWaktu, SCAN_MODES } from '../lib/constants';
import { CheckCircle, AlertCircle, XCircle, Wifi, WifiOff } from 'lucide-react';

/* ── Duplicate scan guard ───────────────────────────────── */
const scanCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 menit
function isDuplicate(key) {
  const t = scanCache.get(key);
  return t && Date.now() - t < CACHE_TTL;
}

/* ── Beep ───────────────────────────────────────────────── */
let _audioCtx = null;
function beep(type = 'success') {
  try {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = _audioCtx.createOscillator();
    const g = _audioCtx.createGain();
    o.connect(g);
    g.connect(_audioCtx.destination);
    if (type === 'success') {
      o.frequency.setValueAtTime(880, _audioCtx.currentTime);
      g.gain.setValueAtTime(0.18, _audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + 0.12);
      o.start(_audioCtx.currentTime);
      o.stop(_audioCtx.currentTime + 0.12);
    } else {
      o.frequency.setValueAtTime(330, _audioCtx.currentTime);
      g.gain.setValueAtTime(0.1, _audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + 0.18);
      o.start(_audioCtx.currentTime);
      o.stop(_audioCtx.currentTime + 0.18);
    }
  } catch (_) {}
}

function vibrate(pattern) {
  try { navigator.vibrate?.(pattern); } catch (_) {}
}

export function ScannerPage({ user }) {
  const [mode, setMode]                 = useState('absensi');
  const [selectedSesi, setSelectedSesi] = useState(null);
  const [sesis, setSesis]               = useState([]);
  const [toast, setToast]               = useState(null);
  const [isOnline, setIsOnline]         = useState(navigator.onLine);
  const toastTimerRef = useRef(null);

  // Track online state
  useEffect(() => {
    const up   = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    window.addEventListener('online',  up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  // Load sesi
  useEffect(() => {
    const list = sesiDB.getAll().sort((a, b) => a.urutan - b.urutan);
    setSesis(list);
    if (list.length > 0) setSelectedSesi(list[0].id);
  }, []);

  // Show result toast
  const showToast = useCallback((payload) => {
    clearTimeout(toastTimerRef.current);
    setToast(payload);
    toastTimerRef.current = setTimeout(() => setToast(null), 2400);
  }, []);

  // Main scan handler
  const handleScan = useCallback(async (rawText) => {
    const token = parseQR(rawText);
    if (!token) return;

    const siswa = siswaDB.getByQrToken(token);

    // QR tidak dikenali
    if (!siswa || siswa.qr_status !== 'active') {
      vibrate([40, 80, 40]);
      beep('error');
      showToast({ type: 'error', title: 'QR Tidak Dikenali', sub: 'QR tidak valid atau sudah direset' });
      return;
    }

    const kelas   = kelasDB.getById(siswa.kelas_id);
    const tanggal = todayStr();

    // ── Mode: Absensi ──────────────────────────────────────
    if (mode === 'absensi') {
      if (!selectedSesi) {
        vibrate([40]);
        showToast({ type: 'warning', title: 'Pilih Sesi', sub: 'Gunakan dropdown sesi di bawah' });
        return;
      }

      const key = `${siswa.id}_${selectedSesi}_${tanggal}`;
      const alreadyScanned = isDuplicate(key) || absensiDB.existsScan(siswa.id, selectedSesi, tanggal);

      if (alreadyScanned) {
        scanCache.set(key, Date.now());
        vibrate([40, 60, 40]);
        beep('error');
        showToast({
          type: 'warning',
          title: siswa.nama,
          sub: `${kelas?.nama} · Sudah tercatat`,
        });
        return;
      }

      scanCache.set(key, Date.now());

      if (isOnline) {
        absensiDB.create({ siswa_id: siswa.id, sesi_id: selectedSesi, tanggal });
      } else {
        await queueScan({ siswa_id: siswa.id, sesi_id: selectedSesi, tanggal, waktu_scan: new Date().toISOString() });
      }

      siswaDB.update(siswa.id, { last_scan_at: new Date().toISOString() });

      const sesiNama = sesis.find(s => s.id === selectedSesi)?.nama || '';
      vibrate(60);
      beep('success');
      showToast({
        type: 'success',
        title: siswa.nama,
        sub: `${kelas?.nama} · ${sesiNama}`,
        time: formatWaktu(new Date().toISOString()),
      });

    // ── Mode: Izin Keluar ──────────────────────────────────
    } else if (mode === 'izin_keluar') {
      if (izinDB.getAktif().find(i => i.siswa_id === siswa.id)) {
        vibrate([40, 60, 40]);
        beep('error');
        showToast({ type: 'warning', title: siswa.nama, sub: `${kelas?.nama} · Sudah dalam izin keluar` });
        return;
      }
      izinDB.create({ siswa_id: siswa.id, petugas_id: user?.id });
      vibrate(60);
      beep('success');
      showToast({ type: 'success', title: siswa.nama, sub: `${kelas?.nama} · Izin keluar tercatat`, time: formatWaktu(new Date().toISOString()) });

    // ── Mode: Kembali ──────────────────────────────────────
    } else if (mode === 'kembali') {
      const aktif = izinDB.getAktif().find(i => i.siswa_id === siswa.id);
      if (!aktif) {
        vibrate([40, 60, 40]);
        beep('error');
        showToast({ type: 'warning', title: siswa.nama, sub: `${kelas?.nama} · Tidak ada izin keluar aktif` });
        return;
      }
      izinDB.kembali(aktif.id);
      vibrate(60);
      beep('success');
      showToast({ type: 'success', title: siswa.nama, sub: `${kelas?.nama} · Kembali ke kelas`, time: formatWaktu(new Date().toISOString()) });
    }
  }, [mode, selectedSesi, sesis, isOnline, user, showToast]);

  const currentMode = SCAN_MODES?.find(m => m.id === mode) || { label: mode };

  return (
    <div className="scanner-shell">
      {/* ── Camera layer ────────────────────────────────── */}
      <div className="scanner-camera">
        <ContinuousScanner onScanSuccess={handleScan} active />
      </div>

      {/* ── Dark gradient overlays ───────────────────────── */}
      <div className="scanner-grad-top"    aria-hidden="true" />
      <div className="scanner-grad-bottom" aria-hidden="true" />

      {/* ── Top HUD ─────────────────────────────────────── */}
      <div className="scanner-hud-top">
        <div>
          <div className="scanner-app-title">Scanner QR</div>
          <div className="scanner-mode-label">{currentMode.label}</div>
        </div>
        <div className={`scanner-conn-pill ${isOnline ? 'online' : 'offline'}`}>
          {isOnline
            ? <Wifi size={11} strokeWidth={2.5} />
            : <WifiOff size={11} strokeWidth={2.5} />}
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      {/* ── Viewfinder ──────────────────────────────────── */}
      <div className="scanner-viewfinder" aria-hidden="true">
        <div className="scan-box">
          {/* 4 corner brackets via pseudo-elements + siblings */}
          <span className="corner tl" /><span className="corner tr" />
          <span className="corner bl" /><span className="corner br" />
          <div className="scan-beam" />
        </div>
        <p className="scan-hint">Arahkan ke QR Code siswa</p>
      </div>

      {/* ── Bottom controls ──────────────────────────────── */}
      <div className="scanner-controls">
        {/* Sesi selector — hanya mode absensi */}
        {mode === 'absensi' && (
          <div className="sesi-row">
            <span className="sesi-label">SESI</span>
            <div className="sesi-select-wrap">
              <select
                id="scanner-sesi"
                className="sesi-select"
                value={selectedSesi || ''}
                onChange={e => setSelectedSesi(e.target.value)}
              >
                {sesis.length === 0 && <option value="">Memuat sesi…</option>}
                {sesis.map(s => (
                  <option key={s.id} value={s.id}>{s.nama} · {s.jam_mulai}</option>
                ))}
              </select>
              <span className="sesi-arrow">▾</span>
            </div>
          </div>
        )}

        {/* Mode buttons */}
        <div className="mode-group">
          {(SCAN_MODES || [
            { id: 'absensi',    label: 'Absensi'  },
            { id: 'izin_keluar',label: 'Izin'     },
            { id: 'kembali',    label: 'Kembali'  },
          ]).map(m => (
            <button
              key={m.id}
              id={`mode-${m.id}`}
              className={`mode-btn${mode === m.id ? ' active' : ''}`}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Result Toast ─────────────────────────────────── */}
      {toast && <ScanToast {...toast} />}
    </div>
  );
}

/* ── Toast component ──────────────────────────────────────── */
function ScanToast({ type, title, sub, time }) {
  const Icon = type === 'success' ? CheckCircle
             : type === 'warning' ? AlertCircle
             : XCircle;

  const colors = {
    success: { icon: '#34C759', border: 'rgba(52,199,89,0.25)' },
    warning: { icon: '#FF9F0A', border: 'rgba(255,159,10,0.25)' },
    error:   { icon: '#FF453A', border: 'rgba(255,69,58,0.25)'  },
  }[type] || {};

  return (
    <div className="scan-toast" style={{ borderColor: colors.border }}>
      <div className="toast-icon-wrap" style={{ color: colors.icon }}>
        <Icon size={22} strokeWidth={2} />
      </div>
      <div className="toast-body">
        <div className="toast-title">{title}</div>
        {sub  && <div className="toast-sub">{sub}</div>}
        {time && <div className="toast-time">{time}</div>}
      </div>
    </div>
  );
}
