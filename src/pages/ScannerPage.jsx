import { useState, useCallback, useRef, useEffect } from 'react';
import { ContinuousScanner } from '../features/scanner/ContinuousScanner';
import { queueScan } from '../features/scanner/OfflineQueue';
import { siswaDB, absensiDB, sesiDB, izinDB, kelasDB } from '../lib/localDB';
import { parseQR, todayStr, formatWaktu, SCAN_MODES } from '../lib/constants';
import { Wifi, WifiOff } from 'lucide-react';
import Header from '../components/ui/Header';
import QRScanner from '../components/ui/QRScanner';
import Button from '../components/ui/Button';

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
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  let active = null;
  for (const s of sesis) {
    if (timeStr >= s.jam_mulai) active = s;
  }
  if (!active) active = sesis[0];
  return active;
}

export function ScannerPage({ user }) {
  const [mode, setMode] = useState('absensi');
  const [sesis, setSesis] = useState([]);
  const [toast, setToast] = useState(null);
  const [scanStatus, setScanStatus] = useState('scanning'); // 'scanning' | 'success' | 'error' | 'idle'
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const up = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  useEffect(() => {
    const list = sesiDB.getAll().sort((a, b) => a.urutan - b.urutan);
    setSesis(list);
  }, []);

  const showToast = useCallback((payload) => {
    clearTimeout(toastTimerRef.current);
    setToast(payload);
    setScanStatus(payload.type); // 'success' or 'error' (warning maps to error visuals for scanner)
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      setScanStatus('scanning');
    }, 2400);
  }, []);

  const handleScan = useCallback(async (rawText) => {
    const token = parseQR(rawText);
    if (!token) return;

    const siswa = siswaDB.getByQrToken(token);

    if (!siswa || siswa.qr_status !== 'active') {
      vibrate([40, 80, 40]);
      beep('error');
      showToast({ type: 'error', title: 'QR Tidak Dikenali', sub: 'QR tidak valid atau sudah direset' });
      return;
    }

    const kelas = kelasDB.getById(siswa.kelas_id);
    const tanggal = todayStr();

    if (user?.role === 'pengawas' && user?.tingkat_akses?.length > 0) {
      const tingkatSiswa = kelas?.nama.split(' ')[0];
      if (!user.tingkat_akses.includes(tingkatSiswa)) {
        vibrate([40, 80, 40]);
        beep('error');
        showToast({ type: 'error', title: 'Akses Ditolak', sub: `Anda tidak diizinkan absen siswa kelas ${tingkatSiswa}` });
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
      
      const selectedSesi = activeSesiObj.id;
      const key = `${siswa.id}_${selectedSesi}_${tanggal}`;
      const alreadyScanned = isDuplicate(key) || absensiDB.existsScan(siswa.id, selectedSesi, tanggal);

      if (alreadyScanned) {
        scanCache.set(key, Date.now());
        vibrate([40, 60, 40]);
        beep('error');
        showToast({ type: 'error', title: siswa.nama, sub: `${kelas?.nama} · Sudah tercatat` });
        return;
      }

      scanCache.set(key, Date.now());

      if (isOnline) {
        absensiDB.create({ siswa_id: siswa.id, sesi_id: selectedSesi, tanggal });
      } else {
        await queueScan({ siswa_id: siswa.id, sesi_id: selectedSesi, tanggal, waktu_scan: new Date().toISOString() });
      }

      siswaDB.update(siswa.id, { last_scan_at: new Date().toISOString() });

      vibrate(60);
      beep('success');
      showToast({ type: 'success', title: siswa.nama, sub: `${kelas?.nama} · ${activeSesiObj.nama}` });

    } else if (mode === 'izin_keluar') {
      if (izinDB.getAktif().find(i => i.siswa_id === siswa.id)) {
        vibrate([40, 60, 40]);
        beep('error');
        showToast({ type: 'error', title: siswa.nama, sub: `${kelas?.nama} · Sudah dalam izin keluar` });
        return;
      }
      izinDB.create({ siswa_id: siswa.id, petugas_id: user?.id });
      vibrate(60);
      beep('success');
      showToast({ type: 'success', title: siswa.nama, sub: `${kelas?.nama} · Izin keluar tercatat` });

    } else if (mode === 'kembali') {
      const aktif = izinDB.getAktif().find(i => i.siswa_id === siswa.id);
      if (!aktif) {
        vibrate([40, 60, 40]);
        beep('error');
        showToast({ type: 'error', title: siswa.nama, sub: `${kelas?.nama} · Tidak ada izin keluar aktif` });
        return;
      }
      izinDB.kembali(aktif.id);
      vibrate(60);
      beep('success');
      showToast({ type: 'success', title: siswa.nama, sub: `${kelas?.nama} · Kembali ke kelas` });
    }
  }, [mode, sesis, isOnline, user, showToast]);

  const currentMode = SCAN_MODES?.find(m => m.id === mode) || { label: mode };
  const activeSesiObj = getActiveSesi(sesis);
  
  let modeDisplay = currentMode.label;
  if (mode === 'absensi' && activeSesiObj) modeDisplay = `Sesi Aktif: ${activeSesiObj.nama}`;

  return (
    <div className="stack-6" style={{ height: '100%' }}>
      <Header
        title="Scanner QR"
        subtitle={modeDisplay}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: isOnline ? 'var(--color-primary-600)' : 'var(--color-neutral-500)', background: isOnline ? 'var(--color-primary-50)' : 'var(--color-neutral-100)', padding: '6px 12px', borderRadius: 999 }}>
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            {isOnline ? 'Online' : 'Offline'}
          </div>
        }
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <QRScanner status={scanStatus} message={toast ? `${toast.title} - ${toast.sub}` : 'Arahkan ke QR Code siswa'}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <ContinuousScanner onScanSuccess={handleScan} active />
          </div>
        </QRScanner>
      </div>

      <div className="grid-3" style={{ marginTop: 'auto' }}>
        {(SCAN_MODES || [
          { id: 'absensi', label: 'Absensi' },
          { id: 'izin_keluar', label: 'Izin' },
          { id: 'kembali', label: 'Kembali' },
        ]).map(m => (
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
