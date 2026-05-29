// ============================================================
// features/scanner/ContinuousScanner.jsx
//
// Arsitektur: getUserMedia → BarcodeDetector (native) → jsQR (fallback)
// Pattern: Singleton stream + rAF scan loop
//
// Referensi: QRIS mobile banking, WhatsApp QR, Gojek scanner
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, RefreshCw, Zap } from 'lucide-react';

/* ── Scanner states ─────────────────────────────────────────
   idle         → belum mulai
   requesting   → sedang minta permission
   loading      → permission granted, video loading
   active       → kamera aktif, scan loop berjalan
   denied       → user tolak permission
   no-camera    → tidak ada kamera
   error        → error lainnya
   paused       → tab hidden, stream pause
──────────────────────────────────────────────────────────── */

// Singleton: satu stream global agar tidak double-init
let _globalStream = null;

async function killStream() {
  if (_globalStream) {
    _globalStream.getTracks().forEach(t => t.stop());
    _globalStream = null;
  }
}

// Detect BarcodeDetector API (Chrome 83+, Samsung Browser, Edge)
const hasBarcodeDetector =
  typeof window !== 'undefined' &&
  'BarcodeDetector' in window;

let _barcodeDetector = null;
if (hasBarcodeDetector) {
  try {
    _barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
  } catch (_) {}
}

// Scan satu frame dengan BarcodeDetector atau jsQR
async function decodeFrame(canvas, ctx, video) {
  const { videoWidth: w, videoHeight: h } = video;
  if (!w || !h) return null;

  // Gambar frame video ke canvas
  canvas.width  = w;
  canvas.height = h;
  ctx.drawImage(video, 0, 0, w, h);

  // ── BarcodeDetector (native, tercepat) ──────────────────
  if (_barcodeDetector) {
    try {
      const results = await _barcodeDetector.detect(canvas);
      if (results.length > 0) return results[0].rawValue;
    } catch (_) {
      // BarcodeDetector gagal → lanjut ke jsQR
    }
  }

  // ── jsQR (fallback, kompatibel semua browser) ───────────
  const imgData = ctx.getImageData(0, 0, w, h);
  const jsQRLib = await import('jsqr');
  const jsQR = jsQRLib.default || jsQRLib;
  const code = jsQR(imgData.data, w, h, {
    inversionAttempts: 'dontInvert', // lebih cepat
  });
  return code?.data || null;
}

export function ContinuousScanner({ onScanSuccess, active = true }) {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const ctxRef      = useRef(null);
  const rafRef      = useRef(null);
  const lastScanRef = useRef({ text: '', at: 0 }); // debounce
  const mountedRef  = useRef(false);
  const streamRef   = useRef(null);

  const [status, setStatus]   = useState('idle');
  const [errMsg, setErrMsg]   = useState('');
  const [torch, setTorch]     = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  // ── Scan loop ──────────────────────────────────────────
  const startScanLoop = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !ctxRef.current) return;

    let lastFrameTime = 0;
    const TARGET_FPS  = 15; // 15fps — cukup cepat, hemat baterai
    const FRAME_MS    = 1000 / TARGET_FPS;

    const loop = async (now) => {
      if (!mountedRef.current) return;

      // Throttle ke TARGET_FPS
      if (now - lastFrameTime >= FRAME_MS) {
        lastFrameTime = now;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          try {
            const decoded = await decodeFrame(canvas, ctxRef.current, video);
            if (decoded) {
              const last = lastScanRef.current;
              const now2 = Date.now();
              // Debounce: abaikan QR sama dalam 2 detik
              if (decoded !== last.text || now2 - last.at > 2000) {
                lastScanRef.current = { text: decoded, at: now2 };
                onScanSuccess?.(decoded);
              }
            }
          } catch (_) {
            // frame error — skip, lanjut
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  }, [onScanSuccess]);

  // ── Start camera ───────────────────────────────────────
  const startCamera = useCallback(async () => {
    if (!mountedRef.current) return;
    setStatus('requesting');
    setErrMsg('');

    // 1. Validasi Environment (HTTPS)
    if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setStatus('error');
      setErrMsg('Akses kamera ditolak oleh browser karena tidak menggunakan koneksi aman (HTTPS).');
      return;
    }

    // 2. Validasi Dukungan Browser
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      setStatus('error');
      setErrMsg('Browser ini tidak mendukung fitur kamera. Silakan gunakan Chrome atau Safari versi terbaru.');
      return;
    }

    try {
      // Hentikan stream lama jika ada
      await killStream();

      // Constraints: prioritas kamera belakang
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width:  { ideal: 1280, max: 1920 },
          height: { ideal: 720,  max: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      _globalStream = stream;
      streamRef.current = stream;

      if (!mountedRef.current) {
        killStream();
        return;
      }

      // Cek torch support
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = videoTrack?.getCapabilities?.();
      if (capabilities?.torch) setTorchSupported(true);

      // Pasang stream ke video element
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;

      setStatus('loading');

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.play()
            .then(resolve)
            .catch(reject);
        };
        video.onerror = reject;
        // Timeout safety
        setTimeout(reject, 8000);
      });

      if (!mountedRef.current) return;
      setStatus('active');
      startScanLoop();

    } catch (err) {
      if (!mountedRef.current) return;

      const name = err?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setStatus('denied');
        setErrMsg('Pastikan izin kamera telah diaktifkan di pengaturan perangkat dan browser Anda.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setStatus('no-camera');
        setErrMsg('Kamera tidak ditemukan di perangkat ini.');
      } else if (name === 'NotReadableError') {
        setStatus('error');
        setErrMsg('Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi tersebut lalu coba lagi.');
      } else if (name === 'OverconstrainedError') {
        // Retry dengan constraints lebih longgar
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false,
          });
          _globalStream = stream;
          streamRef.current = stream;
          const video = videoRef.current;
          if (video && mountedRef.current) {
            video.srcObject = stream;
            await video.play();
            setStatus('active');
            startScanLoop();
          }
        } catch (_) {
          setStatus('error');
          setErrMsg('Kamera tidak dapat diinisialisasi. Coba muat ulang halaman.');
        }
      } else {
        setStatus('error');
        setErrMsg('Gagal mengakses kamera. Silakan coba lagi atau muat ulang halaman.');
      }
    }
  }, [startScanLoop]);

  // ── Stop & cleanup ─────────────────────────────────────
  const stopScanner = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    _globalStream = null;
  }, []);

  // ── Toggle torch (flashlight) ──────────────────────────
  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track || !torchSupported) return;
    try {
      const newTorch = !torch;
      await track.applyConstraints({ advanced: [{ torch: newTorch }] });
      setTorch(newTorch);
    } catch (_) {}
  }, [torch, torchSupported]);

  // ── Visibility API: pause/resume saat tab hidden ───────
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else {
        if (status === 'active') startScanLoop();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [status, startScanLoop]);

  // ── Mount/unmount ──────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    // Setup canvas context sekali
    if (canvasRef.current) {
      ctxRef.current = canvasRef.current.getContext('2d', {
        willReadFrequently: true, // perf hint untuk readPixels
      });
    }

    if (active) startCamera();

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(rafRef.current);
      stopScanner();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pause/resume saat `active` prop berubah ────────────
  useEffect(() => {
    if (!mountedRef.current) return;
    if (active && (status === 'idle' || status === 'paused')) {
      startCamera();
    } else if (!active) {
      stopScanner();
      setStatus('paused');
    }
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ─────────────────────────────────────────────
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#000' }}>
      {/* Video element — HIDDEN, tapi tetap di DOM */}
      {/* Perlu di-render selalu agar ref tersedia */}
      <video
        ref={videoRef}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          display: status === 'active' || status === 'loading' ? 'block' : 'none',
        }}
        playsInline
        muted
        autoPlay
        disablePictureInPicture
        disableRemotePlayback
      />

      {/* Canvas hidden — hanya untuk decoding */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Torch button — hanya muncul saat kamera aktif & torch tersedia */}
      {status === 'active' && torchSupported && (
        <button
          onClick={toggleTorch}
          aria-label={torch ? 'Matikan flash' : 'Nyalakan flash'}
          style={{
            position: 'absolute',
            top: 16, right: 16,
            zIndex: 20,
            width: 40, height: 40,
            borderRadius: '50%',
            border: 'none',
            background: torch ? 'rgba(255,204,0,0.25)' : 'rgba(0,0,0,0.35)',
            color: torch ? '#FFCC00' : 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Zap size={18} strokeWidth={2} fill={torch ? '#FFCC00' : 'none'} />
        </button>
      )}

      {/* State overlays */}
      {status === 'requesting' && <ScannerOverlay icon={<Camera size={36} strokeWidth={1.5} />} title="Minta izin kamera…" desc="Izinkan akses kamera di popup browser" spinner />}
      {status === 'loading'    && <ScannerOverlay icon={<Camera size={36} strokeWidth={1.5} />} title="Mengaktifkan kamera…" spinner />}
      {status === 'denied'     && <ScannerOverlay icon={<CameraOff size={36} strokeWidth={1.5} />} title="Kamera tidak diizinkan" desc={errMsg} retry onRetry={startCamera} />}
      {status === 'no-camera'  && <ScannerOverlay icon={<CameraOff size={36} strokeWidth={1.5} />} title="Kamera tidak ditemukan" desc={errMsg} />}
      {status === 'error'      && <ScannerOverlay icon={<CameraOff size={36} strokeWidth={1.5} />} title="Gagal mengakses kamera" desc={errMsg} retry onRetry={startCamera} />}
    </div>
  );
}

// ── Overlay state UI ─────────────────────────────────────────
function ScannerOverlay({ icon, title, desc, spinner, retry, onRetry }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      color: '#fff',
      gap: 16,
      padding: '32px',
      textAlign: 'center',
      zIndex: 15,
    }}>
      <div style={{ 
        color: 'rgba(255,255,255,0.9)', 
        background: 'rgba(255,255,255,0.1)',
        padding: 16,
        borderRadius: 20,
        marginBottom: 4
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.3px', marginBottom: 6 }}>{title}</div>
        {desc && (
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4, maxWidth: 280, margin: '0 auto' }}>
            {desc}
          </div>
        )}
      </div>
      {spinner && (
        <div style={{
          width: 24, height: 24,
          border: '2.5px solid rgba(255,255,255,0.2)',
          borderTopColor: '#fff',
          borderRadius: '50%',
          animation: 'spin 0.65s linear infinite',
          marginTop: 8,
        }} />
      )}
      {retry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: 12,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 24px',
            borderRadius: 100,
            border: 'none',
            background: '#fff',
            color: '#000',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'transform 0.1s',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <RefreshCw size={16} strokeWidth={2.5} />
          Coba Lagi
        </button>
      )}
    </div>
  );
}
