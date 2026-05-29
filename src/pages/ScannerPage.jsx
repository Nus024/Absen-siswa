// ============================================================
// pages/ScannerPage.jsx — QR Scanner dengan Supabase realtime
// ============================================================
import { useState, useCallback, useRef, useEffect } from 'react';
import { ContinuousScanner } from '../features/scanner/ContinuousScanner';
import { siswaService }  from '../lib/db/siswa';
import { absensiService } from '../lib/db/absensi';
import { sesiService }   from '../lib/db/sesi';
import { izinService }   from '../lib/db/izin';
import { todayStr, SCAN_MODES } from '../lib/constants';
import { Wifi, WifiOff } from 'lucide-react';
import { audioService } from '../lib/audioService';
import { ScannerFeedbackOverlay } from '../features/scanner/ScannerFeedbackOverlay';

// Base Warning & App Error Classes for sound-routing taxonomy
class WarningError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WarningError';
  }
}

class AppError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AppError';
  }
}

class DuplicateScanError extends WarningError {
  constructor(message) {
    super(message);
    this.name = 'DuplicateScanError';
  }
}

class InvalidQrError extends AppError {
  constructor(message) {
    super(message);
    this.name = 'InvalidQrError';
  }
}

class InactiveQrError extends AppError {
  constructor(message) {
    super(message);
    this.name = 'InactiveQrError';
  }
}

class SessionNotFoundError extends AppError {
  constructor(message) {
    super(message);
    this.name = 'SessionNotFoundError';
  }
}

class AccessDeniedError extends AppError {
  constructor(message) {
    super(message);
    this.name = 'AccessDeniedError';
  }
}
import QRScanner from '../components/ui/QRScanner';
import Button from '../components/ui/Button';

// Cache mencegah scan duplikat dalam 5 menit (hanya di memori tab ini)
const scanCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function isDuplicate(key) {
  const t = scanCache.get(key);
  return t && Date.now() - t < CACHE_TTL;
}

// beep() logic has been moved to lib/audioService.js

function vibrate(pattern) {
  try { navigator.vibrate?.(pattern); } catch (_) {}
}

function getActiveSesi(sesis) {
  if (!sesis || sesis.length === 0) return null;
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  const timeStr = `${h}:${m}`;
  let active = null;
  for (const s of sesis) {
    if (timeStr >= s.jam_mulai) active = s;
  }
  if (!active) active = sesis[0];
  return active;
}

export function ScannerPage({ user }) {
  const [mode, setMode]           = useState('absensi');
  const [sesis, setSesis]         = useState([]);
  const [isOnline, setIsOnline]   = useState(navigator.onLine);
  const [isProcessing, setIsProcessing] = useState(false);
  // Dedicated scanner feedback state (replaces old toast + scanStatus)
  const [scanFeedback, setScanFeedback] = useState({
    visible: false,
    type: 'success',     // 'success' | 'warning' | 'error'
    title: '',
    subtitle: '',
  });
  const feedbackTimerRef = useRef(null);
  const processingRef    = useRef(false); // guard against concurrent scans

  useEffect(() => {
    const up   = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  useEffect(() => {
    sesiService.getAll()
      .then(list => setSesis(list))
      .catch(err => console.error('Gagal load sesi:', err));
  }, []);

  /**
   * Show the scanner feedback overlay for a given duration then auto-dismiss.
   * @param {'success'|'warning'|'error'} type
   * @param {string} title
   * @param {string} subtitle
   * @param {number} duration  ms before auto-dismiss
   */
  const showFeedback = useCallback((type, title, subtitle, duration) => {
    clearTimeout(feedbackTimerRef.current);
    setScanFeedback({ visible: true, type, title, subtitle });
    feedbackTimerRef.current = setTimeout(() => {
      setScanFeedback(prev => ({ ...prev, visible: false }));
      processingRef.current = false;
      setIsProcessing(false);
    }, duration);
  }, []);

  const handleScan = useCallback(async (rawText) => {
    // Cegah concurrent scan
    if (processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);

    // 1. Pre-validation QR (Mendukung UUID murni, SISWA:UUID, dan NIS::NAMA legacy)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawText);
    const isSiswaUuid = rawText && rawText.startsWith('SISWA:') && 
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawText.substring(6));
    const isLegacy = rawText && rawText.includes('::');
    
    const isValidFormat = rawText && (isUuid || isSiswaUuid || isLegacy);
    if (!isValidFormat) {
      vibrate([40, 80, 40]);
      audioService.playError();
      showFeedback('error', 'QR Tidak Valid', 'Format QR tidak dikenali', 1000);
      return;
    }

    // 2. Optimistic Instant Feedback (<100 ms)
    vibrate(60);
    audioService.playDetected(); // only audible if enableDetectedSound = true

    // 3. Jalankan Supabase transaksi di background (tidak di-await di main UI thread)
    (async () => {
      try {
        let token = null;
        if (isSiswaUuid) {
          token = rawText.substring(6).trim(); // Ekstrak UUID dari prefix "SISWA:"
        } else if (isUuid) {
          token = rawText.trim(); // UUID murni langsung
        } else if (isLegacy) {
          token = rawText.trim(); // Token legacy (NIS::NAMA)
        }

        if (!token) throw new InvalidQrError('Token kosong');

        // Cari siswa berdasarkan token (UUID) atau NIS
        let siswa = null;
        if (token.includes('::')) {
          const nis = token.split('::')[0];
          siswa = await siswaService.getByNis(nis);
        } else {
          siswa = await siswaService.getByQrToken(token);
        }

        if (!siswa || siswa.qr_status !== 'active') {
          throw new InactiveQrError('QR tidak aktif atau sudah di-reset');
        }

        const kelasNama = siswa.kelas?.nama || '—';
        const tanggal = todayStr();

        // Validasi akses pengawas
        if (user?.role === 'pengawas' && user?.tingkat_akses?.length > 0) {
          const tingkatSiswa = kelasNama.split(' ')[0];
          if (!user.tingkat_akses.includes(tingkatSiswa)) {
            throw new AccessDeniedError(`Tidak diizinkan absen kelas ${tingkatSiswa}`);
          }
        }

        if (mode === 'absensi') {
          const activeSesiObj = getActiveSesi(sesis);
          if (!activeSesiObj) {
            throw new SessionNotFoundError('Sesi aktif belum dikonfigurasi');
          }

          const key = `${siswa.id}_${activeSesiObj.id}_${tanggal}`;
          if (isDuplicate(key)) {
            throw new DuplicateScanError('Sudah tercatat (cache)');
          }

          // Cek duplikat di database
          const alreadyScanned = await absensiService.existsScan(siswa.id, activeSesiObj.id, tanggal);
          if (alreadyScanned) {
            scanCache.set(key, Date.now());
            throw new DuplicateScanError('Sudah tercatat hari ini');
          }

          scanCache.set(key, Date.now());

          // Simpan ke Supabase
          await absensiService.create({
            siswa_id:   siswa.id,
            sesi_id:    activeSesiObj.id,
            tanggal,
            petugas_id: user?.id ?? null,
          });

          // Update last_scan_at
          siswaService.updateLastScan(siswa.id).catch(() => {});

          // Tampilkan feedback sukses dengan nama lengkap siswa
          audioService.playSuccess();
          showFeedback('success', siswa.nama, kelasNama, 1500);
          return; // early return — cleanup handled by showFeedback timer

        } else if (mode === 'izin_keluar') {
          const aktifList = await izinService.getAktif();
          const sudahIzin = aktifList.find(i => i.siswa_id === siswa.id);
          if (sudahIzin) {
            throw new DuplicateScanError('Sudah dalam izin keluar');
          }

          await izinService.create({ siswa_id: siswa.id, petugas_id: user?.id ?? null });
          audioService.playSuccess();
          showFeedback('success', siswa.nama, `${kelasNama} · Izin keluar tercatat`, 1500);
          return;

        } else if (mode === 'kembali') {
          const aktifList = await izinService.getAktif();
          const aktif = aktifList.find(i => i.siswa_id === siswa.id);
          if (!aktif) {
            throw new DuplicateScanError('Tidak ada izin keluar aktif');
          }

          await izinService.kembali(aktif.id);
          audioService.playSuccess();
          showFeedback('success', siswa.nama, `${kelasNama} · Kembali ke kelas`, 1500);
          return;
        }

        // Fallback: jika mode tidak cocok, lepas lock saja
        processingRef.current = false;
        setIsProcessing(false);

      } catch (err) {
        console.error('Proses latar belakang gagal:', err);
        vibrate([40, 80, 40]);
        if (err instanceof WarningError) {
          audioService.playWarning();
          showFeedback('warning', 'Sudah Tercatat', err?.message || 'Duplikat scan', 1200);
        } else {
          audioService.playError();
          showFeedback('error', 'Absensi Gagal', err?.message || 'Periksa koneksi internet', 1000);
        }
      }
    })();
  }, [mode, sesis, user, showFeedback]);

  const currentMode   = SCAN_MODES?.find(m => m.id === mode) || { label: mode };
  const activeSesiObj = getActiveSesi(sesis);
  let modeDisplay = currentMode.label;
  if (mode === 'absensi' && activeSesiObj) modeDisplay = `Sesi Aktif: ${activeSesiObj.nama}`;

  return (
    <div className="stack-6" style={{ height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>Scanner QR</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>{modeDisplay}</p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
          color: isOnline ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
          background: isOnline ? 'var(--color-primary-50)' : 'var(--color-neutral-100)',
          padding: '6px 12px', borderRadius: 999
        }}>
          {isOnline ? <Wifi size={15} /> : <WifiOff size={15} />}
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <QRScanner
          status={isProcessing ? 'loading' : 'scanning'}
          message={scanFeedback.visible ? '' : 'Arahkan ke QR Code siswa'}
        >
          {/* Scanner — always mounted, never restarts */}
          <div style={{ position: 'absolute', inset: 0, opacity: scanFeedback.visible ? 0.35 : 1, transition: 'opacity 180ms ease' }}>
            <ContinuousScanner
              onScanSuccess={handleScan}
              active
              paused={isProcessing}
            />
          </div>

          {/* Feedback overlay — purely presentational */}
          <ScannerFeedbackOverlay
            visible={scanFeedback.visible}
            type={scanFeedback.type}
            title={scanFeedback.title}
            subtitle={scanFeedback.subtitle}
          />
        </QRScanner>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        {SCAN_MODES.map(m => (
          <Button
            key={m.id}
            variant={mode === m.id ? 'primary' : 'ghost'}
            onClick={() => setMode(m.id)}
            fullWidth
          >
            {m.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
