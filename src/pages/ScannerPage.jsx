// ============================================================
// pages/ScannerPage.jsx — QR Scanner dengan Supabase realtime
// ============================================================
import { useState, useCallback, useRef, useEffect } from 'react';
import { ContinuousScanner } from '../features/scanner/ContinuousScanner';
import { siswaService }  from '../lib/db/siswa';
import { absensiService } from '../lib/db/absensi';
import { sesiService }   from '../lib/db/sesi';
import { izinService }   from '../lib/db/izin';
import { parseQR, todayStr, SCAN_MODES } from '../lib/constants';
import { Wifi, WifiOff } from 'lucide-react';
import QRScanner from '../components/ui/QRScanner';
import Button from '../components/ui/Button';

// Cache mencegah scan duplikat dalam 5 menit (hanya di memori tab ini)
const scanCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function isDuplicate(key) {
  const t = scanCache.get(key);
  return t && Date.now() - t < CACHE_TTL;
}

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
  const [toast, setToast]         = useState(null);
  const [scanStatus, setScanStatus] = useState('scanning');
  const [isOnline, setIsOnline]   = useState(navigator.onLine);
  const [isProcessing, setIsProcessing] = useState(false);
  const toastTimerRef = useRef(null);
  const processingRef = useRef(false); // guard against concurrent scans

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

  const showToast = useCallback((payload) => {
    clearTimeout(toastTimerRef.current);
    setToast(payload);
    setScanStatus(payload.type);
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      setScanStatus('scanning');
      processingRef.current = false;
      setIsProcessing(false);
    }, 2400);
  }, []);

  const handleScan = useCallback(async (rawText) => {
    // Cegah concurrent scan
    if (processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);

    try {
      const token = parseQR(rawText);
      if (!token) {
        processingRef.current = false;
        setIsProcessing(false);
        return;
      }

      // Cari siswa berdasarkan token (UUID) atau NIS (format NIS::NAMA)
      let siswa = null;
      if (token.includes('::')) {
        // Format lama: NIS::NAMA — lookup by NIS
        const nis = token.split('::')[0];
        siswa = await siswaService.getByNis(nis);
      } else {
        // Format baru: UUID token
        siswa = await siswaService.getByQrToken(token);
      }

      if (!siswa || siswa.qr_status !== 'active') {
        vibrate([40, 80, 40]);
        beep('error');
        showToast({ type: 'error', title: 'QR Tidak Dikenali', sub: 'QR tidak valid atau sudah direset' });
        return;
      }

      const kelas   = siswa.kelas;
      const kelasNama = kelas?.nama || '—';
      const tanggal = todayStr();

      // Validasi akses pengawas
      if (user?.role === 'pengawas' && user?.tingkat_akses?.length > 0) {
        const tingkatSiswa = kelasNama.split(' ')[0];
        if (!user.tingkat_akses.includes(tingkatSiswa)) {
          vibrate([40, 80, 40]);
          beep('error');
          showToast({ type: 'error', title: 'Akses Ditolak', sub: `Tidak diizinkan absen kelas ${tingkatSiswa}` });
          return;
        }
      }

      if (mode === 'absensi') {
        const activeSesiObj = getActiveSesi(sesis);
        if (!activeSesiObj) {
          vibrate([40]);
          showToast({ type: 'error', title: 'Sesi Belum Diatur', sub: 'Tambahkan sesi di pengaturan' });
          return;
        }

        const key = `${siswa.id}_${activeSesiObj.id}_${tanggal}`;
        if (isDuplicate(key)) {
          vibrate([40, 60, 40]);
          beep('error');
          showToast({ type: 'error', title: siswa.nama, sub: `${kelasNama} · Sudah tercatat (cache)` });
          return;
        }

        // Cek duplikat di database
        const alreadyScanned = await absensiService.existsScan(siswa.id, activeSesiObj.id, tanggal);
        if (alreadyScanned) {
          scanCache.set(key, Date.now());
          vibrate([40, 60, 40]);
          beep('error');
          showToast({ type: 'error', title: siswa.nama, sub: `${kelasNama} · Sudah tercatat` });
          return;
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

        vibrate(60);
        beep('success');
        showToast({ type: 'success', title: siswa.nama, sub: `${kelasNama} · ${activeSesiObj.nama}` });

      } else if (mode === 'izin_keluar') {
        const aktifList = await izinService.getAktif();
        const sudahIzin = aktifList.find(i => i.siswa_id === siswa.id);
        if (sudahIzin) {
          vibrate([40, 60, 40]);
          beep('error');
          showToast({ type: 'error', title: siswa.nama, sub: `${kelasNama} · Sudah dalam izin keluar` });
          return;
        }

        await izinService.create({ siswa_id: siswa.id, petugas_id: user?.id ?? null });
        vibrate(60);
        beep('success');
        showToast({ type: 'success', title: siswa.nama, sub: `${kelasNama} · Izin keluar tercatat` });

      } else if (mode === 'kembali') {
        const aktifList = await izinService.getAktif();
        const aktif = aktifList.find(i => i.siswa_id === siswa.id);
        if (!aktif) {
          vibrate([40, 60, 40]);
          beep('error');
          showToast({ type: 'error', title: siswa.nama, sub: `${kelasNama} · Tidak ada izin keluar aktif` });
          return;
        }

        await izinService.kembali(aktif.id);
        vibrate(60);
        beep('success');
        showToast({ type: 'success', title: siswa.nama, sub: `${kelasNama} · Kembali ke kelas` });
      }

    } catch (err) {
      console.error('Scan error:', err);
      beep('error');
      showToast({ type: 'error', title: 'Gagal Menyimpan', sub: err?.message || 'Periksa koneksi internet' });
    }
  }, [mode, sesis, user, showToast]);

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
          status={isProcessing ? 'loading' : scanStatus}
          message={toast ? `${toast.title} — ${toast.sub}` : 'Arahkan ke QR Code siswa'}
        >
          <div style={{ position: 'absolute', inset: 0 }}>
            <ContinuousScanner onScanSuccess={handleScan} active />
          </div>
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
