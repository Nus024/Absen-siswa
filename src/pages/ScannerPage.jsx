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

    // 1. Pre-validation QR
    const isValidFormat = rawText && (rawText.startsWith('SISWA:') || rawText.includes('::'));
    if (!isValidFormat) {
      vibrate([40, 80, 40]);
      beep('error');
      showToast({ 
        type: 'error', 
        title: 'QR Tidak Valid', 
        sub: 'Format QR tidak dikenali' 
      });
      return;
    }

    // 2. Optimistic Instant Feedback (<100 ms)
    vibrate(60);
    beep('success');

    // Dapatkan nama optimis jika tersedia (format legacy NIS::NAMA)
    let optimisticName = 'Siswa Terdeteksi';
    if (rawText.includes('::')) {
      const parts = rawText.split('::');
      if (parts.length > 1 && parts[1]) optimisticName = parts[1].trim();
    } else {
      optimisticName = 'Membaca Kartu...';
    }

    // Tampilkan indikator sukses instan (green checkmark & overlay)
    setScanStatus('success');
    setToast({ 
      type: 'success', 
      title: optimisticName, 
      sub: 'Menyimpan absensi...' 
    });

    // 3. Jalankan Supabase transaksi di background (tidak di-await di main UI thread)
    (async () => {
      try {
        let token = null;
        if (rawText.startsWith('SISWA:')) {
          token = rawText.replace('SISWA:', '').trim();
        } else {
          token = rawText.trim();
        }

        if (!token) throw new Error('Token kosong');

        // Cari siswa berdasarkan token (UUID) atau NIS
        let siswa = null;
        if (token.includes('::')) {
          const nis = token.split('::')[0];
          siswa = await siswaService.getByNis(nis);
        } else {
          siswa = await siswaService.getByQrToken(token);
        }

        if (!siswa || siswa.qr_status !== 'active') {
          throw new Error('QR tidak aktif atau sudah di-reset');
        }

        const kelasNama = siswa.kelas?.nama || '—';
        const tanggal = todayStr();

        // Validasi akses pengawas
        if (user?.role === 'pengawas' && user?.tingkat_akses?.length > 0) {
          const tingkatSiswa = kelasNama.split(' ')[0];
          if (!user.tingkat_akses.includes(tingkatSiswa)) {
            throw new Error(`Tidak diizinkan absen kelas ${tingkatSiswa}`);
          }
        }

        if (mode === 'absensi') {
          const activeSesiObj = getActiveSesi(sesis);
          if (!activeSesiObj) {
            throw new Error('Sesi aktif belum dikonfigurasi');
          }

          const key = `${siswa.id}_${activeSesiObj.id}_${tanggal}`;
          if (isDuplicate(key)) {
            throw new Error('Sudah tercatat (cache)');
          }

          // Cek duplikat di database
          const alreadyScanned = await absensiService.existsScan(siswa.id, activeSesiObj.id, tanggal);
          if (alreadyScanned) {
            scanCache.set(key, Date.now());
            throw new Error('Sudah tercatat hari ini');
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

          // Perbarui toast dengan data lengkap siswa setelah sukses database
          setToast({ 
            type: 'success', 
            title: siswa.nama, 
            sub: `${kelasNama} · ${activeSesiObj.nama} (Sukses)` 
          });

        } else if (mode === 'izin_keluar') {
          const aktifList = await izinService.getAktif();
          const sudahIzin = aktifList.find(i => i.siswa_id === siswa.id);
          if (sudahIzin) {
            throw new Error('Sudah dalam izin keluar');
          }

          await izinService.create({ siswa_id: siswa.id, petugas_id: user?.id ?? null });
          
          setToast({ 
            type: 'success', 
            title: siswa.nama, 
            sub: `${kelasNama} · Izin keluar tercatat` 
          });

        } else if (mode === 'kembali') {
          const aktifList = await izinService.getAktif();
          const aktif = aktifList.find(i => i.siswa_id === siswa.id);
          if (!aktif) {
            throw new Error('Tidak ada izin keluar aktif');
          }

          await izinService.kembali(aktif.id);
          
          setToast({ 
            type: 'success', 
            title: siswa.nama, 
            sub: `${kelasNama} · Kembali ke kelas` 
          });
        }

        // Selesaikan pemrosesan dan aktifkan scanner kembali dengan cepat
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => {
          setToast(null);
          setScanStatus('scanning');
          processingRef.current = false;
          setIsProcessing(false);
        }, 1200); // 1.2 detik durasi konfirmasi sukses sebelum scan berikutnya

      } catch (err) {
        console.error('Proses latar belakang gagal:', err);
        // Mainkan suara error jika proses database bermasalah
        vibrate([40, 80, 40]);
        beep('error');

        // Ubah visual ke status error
        setScanStatus('error');
        setToast({ 
          type: 'error', 
          title: 'Gagal Menyimpan', 
          sub: err?.message || 'Periksa koneksi internet' 
        });

        // Durasi agar user dapat membaca error sebelum aktif kembali
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => {
          setToast(null);
          setScanStatus('scanning');
          processingRef.current = false;
          setIsProcessing(false);
        }, 2200);
      }
    })();
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
            <ContinuousScanner 
              onScanSuccess={handleScan} 
              active 
              paused={isProcessing || scanStatus !== 'scanning'}
            />
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
