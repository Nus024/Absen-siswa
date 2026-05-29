// ============================================================
// pages/QRManagementPage.jsx — Premium QR management
// ============================================================
import { useState, useEffect, useMemo, useRef } from 'react';
import { Download as DownloadIcon } from 'lucide-react';
import { siswaService } from '../lib/db/siswa';
import { kelasService } from '../lib/db/kelas';
import { ConfirmDialog } from '../components/ConfirmDialog';
import Button from '../components/ui/Button';

// ── PreviewKtsModal (Menggambar KTS pada canvas) ─────────────────
function PreviewKtsModal({ siswa, onClose }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [kelasNamaStr, setKelasNamaStr] = useState('—');

  useEffect(() => {
    kelasService.getById(siswa.kelas_id)
      .then(k => setKelasNamaStr(k?.nama || '—'))
      .catch(() => {});
  }, [siswa.kelas_id]);

  useEffect(() => {
    if (!canvasRef.current) return;
    setLoading(true);
    kelasService.getById(siswa.kelas_id)
      .then(kelas => {
        const kelasNama = kelas?.nama || '—';
        const payload = siswa.qr_token || `${siswa.nis}::${siswa.nama}`;
        return import('../features/qr/ktsDraw').then(({ drawKtsCard }) => {
          drawKtsCard(canvasRef.current, {
            nis: siswa.nis, nama: siswa.nama, kelasNama, qrToken: payload
          }, () => setLoading(false));
        });
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, [siswa]);

  function downloadKts() {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeName = siswa.nama.replace(/[^a-zA-Z0-9\u00C0-\u00FF ]/g, '').trim().replace(/\s+/g, '_');
      a.href = url;
      a.download = `KTS_${safeName}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.95);
  }


  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 520, width: '90%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Kartu Tanda Siswa (KTS)</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-divider" />
        <div className="modal-body" style={{ textAlign: 'center', paddingTop: 20 }}>
          <div style={{
            background: 'var(--bg-inset)',
            borderRadius: 12,
            padding: 8,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            display: 'inline-block',
            width: '100%',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {loading && (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.7)',
                zIndex: 10
              }}>
                <span className="spinner" />
              </div>
            )}
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 6 }} />
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{siswa.nama}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              NIS: {siswa.nis} &middot; {kelasNamaStr}
            </div>
          </div>
        </div>
        <div className="modal-footer" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button variant="ghost" onClick={onClose}>Tutup</Button>
          <Button variant="primary" icon={<DownloadIcon size={16} />} onClick={downloadKts} disabled={loading}>
            Unduh KTS
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export function QRManagementPage({ user }) {
  const [kelasList, setKelasList]       = useState([]);
  const [kelasId, setKelasId]           = useState('');
  const [siswas, setSiswas]             = useState([]);
  const [search, setSearch]             = useState('');
  const [previewSiswa, setPreviewSiswa] = useState(null);
  const [loadingPrint, setLoadingPrint] = useState(false);
  const [confirmData, setConfirmData]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const canAdmin = user?.role === 'admin';

  useEffect(() => {
    kelasService.getAll().then(kls => {
      setKelasList(kls);
      if (kls.length > 0) setKelasId(kls[0].id);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!kelasId) return;
    setLoading(true);
    siswaService.getByKelas(kelasId)
      .then(setSiswas)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [kelasId]);

  const filtered = useMemo(() => {
    if (!search) return siswas;
    const q = search.toLowerCase();
    return siswas.filter(s => s.nama.toLowerCase().includes(q) || s.nis.includes(q));
  }, [siswas, search]);

  async function handlePrintSatu(siswa) {
    const kelas = await kelasService.getById(siswa.kelas_id);
    const { drawKtsCard } = await import('../features/qr/ktsDraw');

    const canvas = document.createElement('canvas');
    drawKtsCard(canvas, {
      nis: siswa.nis,
      nama: siswa.nama,
      kelasNama: kelas?.nama || '—',
      qrToken: siswa.qr_token || `${siswa.nis}::${siswa.nama}`
    }, () => {
      const cardDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const w = window.open('', '_blank', 'width=520,height=380');
      w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
        <title>KTS — ${siswa.nama}</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family:-apple-system, sans-serif; display:flex; justify-content:center; padding:0; background:#fff; }
          .card-img { width:8.6cm; height:5.4cm; display:block; object-fit:contain; }
          @media print { @page { size: 8.6cm 5.4cm; margin:0; } }
        </style></head>
        <body>
          <img src="${cardDataUrl}" alt="KTS Card" class="card-img">
          <script>window.onload=()=>{ window.print(); setTimeout(()=>window.close(), 100); };<\/script>
        </body></html>`);
      w.document.close();
    });
  }

  async function handlePrintKelas() {
    setLoadingPrint(true);
    const kelas = await kelasService.getById(kelasId);
    const { drawKtsCard } = await import('../features/qr/ktsDraw');
    const canvas = document.createElement('canvas');

    const renderedCards = [];
    for (const siswa of siswas) {
      await new Promise((resolve) => {
        drawKtsCard(canvas, {
          nis: siswa.nis,
          nama: siswa.nama,
          kelasNama: kelas?.nama || '—',
          qrToken: siswa.qr_token || `${siswa.nis}::${siswa.nama}`
        }, () => {
          renderedCards.push({
            nama: siswa.nama,
            dataUrl: canvas.toDataURL('image/jpeg', 0.92)
          });
          resolve();
        });
      });
    }

    setLoadingPrint(false);

    const w = window.open('', '_blank', 'width=960,height=720');
    w.document.write(`<!DOCTYPE html><html lang="id"><head>
      <meta charset="UTF-8">
      <title>Cetak KTS Kelas — ${kelas?.nama}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:-apple-system,sans-serif; background:#fff; padding:1.5cm 1cm; }
        .grid { display:flex; flex-wrap:wrap; gap:0.4cm 0.6cm; justify-content:flex-start; }
        .card-img {
          width:8.6cm; height:5.4cm; border:1px solid #e5e7eb; border-radius:6px;
          page-break-inside:avoid; display:block;
        }
        @media print { @page{ margin:1cm; } }
      </style></head>
      <body><div class="grid">
        ${renderedCards.map(c => `<img src="${c.dataUrl}" alt="KTS ${c.nama}" class="card-img">`).join('')}
      </div>
      <script>window.onload=()=>{ window.print(); };<\/script></body></html>`);
    w.document.close();
  }

  function handleRegenerate(siswa) {
    setConfirmData({
      title: 'Reset QR Code',
      message: `Reset QR untuk ${siswa.nama}? QR lama tidak akan berlaku lagi.`,
      onConfirm: async () => {
        try {
          await siswaService.regenerateQr(siswa.id, user?.id);
          const fresh = await siswaService.getByKelas(kelasId);
          setSiswas(fresh);
        } catch (err) {
          alert('Gagal reset QR: ' + (err?.message || 'Error'));
        }
        setConfirmData(null);
      }
    });
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Manajemen KTS &amp; QR</h1>
        </div>
        <div className="page-header-actions">
          <button
            id="btn-cetak-kelas"
            className="btn btn-primary"
            onClick={handlePrintKelas}
            disabled={loadingPrint || siswas.length === 0}
          >
            {loadingPrint
              ? <><span className="spinner" />&ensp;Menyiapkan…</>
              : <>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Cetak KTS Kelas ({siswas.length})
                </>
            }
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="toolbar">
          <select id="qr-kelas-filter" className="field-input" style={{ width: 'auto', height: 34 }}
            value={kelasId} onChange={e => setKelasId(e.target.value)}>
            {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
          <input id="qr-search" className="field-input" type="text"
            placeholder="Cari nama atau NIS…" style={{ width: 220, height: 34 }}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="td-num">#</th>
                  <th>NIS</th>
                  <th>Nama Siswa</th>
                  <th>Kelas</th>
                  <th>Status QR</th>
                  <th>Scan Terakhir</th>
                  <th style={{ minWidth: 160 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="empty">
                      <div className="empty-icon">⊞</div>
                      <div className="empty-title">Tidak ada data</div>
                    </div>
                  </td></tr>
                ) : filtered.map((siswa, idx) => {
                  const kelas = kelasList.find(k => k.id === siswa.kelas_id);
                  return (
                    <tr key={siswa.id}>
                      <td className="td-num">{idx + 1}</td>
                      <td className="td-nis">{siswa.nis}</td>
                      <td className="td-name">{siswa.nama}</td>
                      <td><span className="chip">{kelas?.nama || '—'}</span></td>
                      <td>
                        <span className={siswa.qr_status === 'active' ? 'pill pill-active' : 'pill pill-inactive'}>
                          {siswa.qr_status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="td-meta">
                        {siswa.last_scan_at
                          ? new Date(siswa.last_scan_at).toLocaleString('id-ID', {
                              day: '2-digit', month: 'short',
                              hour: '2-digit', minute: '2-digit',
                            })
                          : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                      </td>
                      <td>
                        <div className="td-actions">
                          <button id={`btn-preview-${siswa.id}`} className="btn btn-sm"
                            onClick={() => setPreviewSiswa(siswa)}>
                            Preview
                          </button>
                          <button id={`btn-print-${siswa.id}`} className="btn btn-sm"
                            onClick={() => handlePrintSatu(siswa)}>
                            Cetak
                          </button>
                          {canAdmin && (
                            <button id={`btn-regen-${siswa.id}`} className="btn btn-sm btn-danger-ghost"
                              onClick={() => handleRegenerate(siswa)} title="Reset QR">
                              Reset
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="card-footer">
            <span>{filtered.length} dari {siswas.length} siswa</span>
            <span>Layout cetak KTS 8.6 × 5.4 cm &middot; ~10 kartu/halaman A4</span>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewSiswa && (
        <PreviewKtsModal siswa={previewSiswa} onClose={() => setPreviewSiswa(null)} />
      )}

      <ConfirmDialog
        isOpen={!!confirmData}
        title={confirmData?.title}
        message={confirmData?.message}
        onConfirm={confirmData?.onConfirm}
        onCancel={() => setConfirmData(null)}
      />
    </div>
  );
}
