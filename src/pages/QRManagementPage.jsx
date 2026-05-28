// ============================================================
// pages/QRManagementPage.jsx — Premium QR management
// ============================================================
import { useState, useEffect, useMemo } from 'react';
import { siswaDB, kelasDB } from '../lib/localDB';
import { generateQRDataUrl, generateQRBatch } from '../features/qr/QRGenerator';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function QRManagementPage({ user }) {
  const [kelasList, setKelasList]     = useState([]);
  const [kelasId, setKelasId]         = useState('');
  const [siswas, setSiswas]           = useState([]);
  const [search, setSearch]           = useState('');
  const [previewSiswa, setPreviewSiswa] = useState(null);
  const [previewQr, setPreviewQr]     = useState('');
  const [loadingPrint, setLoadingPrint] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const canAdmin = user?.role === 'admin';

  useEffect(() => {
    const kls = kelasDB.getAll();
    setKelasList(kls);
    if (kls.length > 0) setKelasId(kls[0].id);
  }, []);

  useEffect(() => {
    if (!kelasId) return;
    setSiswas(siswaDB.getByKelas(kelasId));
  }, [kelasId]);

  const filtered = useMemo(() => {
    if (!search) return siswas;
    const q = search.toLowerCase();
    return siswas.filter(s => s.nama.toLowerCase().includes(q) || s.nis.includes(q));
  }, [siswas, search]);

  async function openPreview(siswa) {
    const url = await generateQRDataUrl(siswa.qr_token, 256);
    setPreviewQr(url);
    setPreviewSiswa(siswa);
  }

  async function handlePrintSatu(siswa) {
    const kelas = kelasDB.getById(siswa.kelas_id);
    const qrUrl = await generateQRDataUrl(siswa.qr_token, 200);
    const w = window.open('', '_blank', 'width=320,height=450');
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
      <title>QR — ${siswa.nama}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: -apple-system, sans-serif; display:flex; justify-content:center; padding:10px; background:#fff; }
        .card { width:6.5cm; border:1px solid #ddd; border-radius:8px; padding:14px; text-align:center; }
        .school { font-size:6.5pt; color:#888; text-transform:uppercase; letter-spacing:0.5px; }
        hr { border:none; border-top:1px solid #eee; margin:6px 0; }
        img { width:3cm; height:3cm; margin:8px auto; display:block; }
        .name { font-size:10pt; font-weight:700; margin-top:6px; color:#1C1C1E; }
        .nis { font-size:8.5pt; color:#6E6E73; margin-top:2px; font-family:monospace; }
        .kelas { font-size:9pt; color:#1C1C1E; font-weight:500; margin-top:2px; }
        @media print { @page { margin:0.5cm; } }
      </style></head>
      <body><div class="card">
        <div class="school">Kartu Absensi Siswa</div>
        <hr><img src="${qrUrl}" alt="QR">
        <div class="name">${siswa.nama}</div>
        <div class="nis">NIS ${siswa.nis}</div>
        <div class="kelas">${kelas?.nama || ''}</div>
      </div>
      <script>window.onload=()=>window.print();</script></body></html>`);
    w.document.close();
  }

  async function handlePrintKelas() {
    setLoadingPrint(true);
    const kelas = kelasDB.getById(kelasId);
    const data  = await generateQRBatch(siswas);
    setLoadingPrint(false);
    const w = window.open('', '_blank', 'width=960,height=720');
    w.document.write(`<!DOCTYPE html><html lang="id"><head>
      <meta charset="UTF-8">
      <title>Cetak QR — ${kelas?.nama}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:-apple-system,sans-serif; background:#fff; }
        .grid { display:flex; flex-wrap:wrap; padding:4px; gap:4px; }
        .card {
          width:6.5cm; height:9cm; border:1px solid #ddd; border-radius:8px;
          margin:2px; padding:12px; text-align:center;
          page-break-inside:avoid; display:flex; flex-direction:column;
          align-items:center; justify-content:center; gap:4px;
        }
        .school { font-size:6.5pt; color:#888; text-transform:uppercase; letter-spacing:0.5px; }
        hr { width:80%; border:none; border-top:1px solid #eee; margin:3px auto; }
        img { width:2.8cm; height:2.8cm; }
        .name { font-size:10pt; font-weight:700; color:#1C1C1E; margin-top:4px; }
        .nis { font-size:8pt; color:#6E6E73; font-family:monospace; }
        .kelas { font-size:9pt; font-weight:500; color:#1C1C1E; }
        @media print { @page{margin:0.5cm;} }
      </style></head>
      <body><div class="grid">
        ${data.map(s => `<div class="card">
          <div class="school">Kartu Absensi Siswa</div>
          <hr>
          <img src="${s.qrDataUrl}" alt="QR ${s.nama}">
          <div class="name">${s.nama}</div>
          <div class="nis">NIS ${s.nis}</div>
          <div class="kelas">${kelas?.nama || ''}</div>
        </div>`).join('')}
      </div>
      <script>window.onload=()=>window.print();</script></body></html>`);
    w.document.close();
  }

  function handleRegenerate(siswa) {
    setConfirmData({
      title: 'Reset QR Code',
      message: `Reset QR untuk ${siswa.nama}? QR lama tidak akan berlaku lagi.`,
      onConfirm: () => {
        siswaDB.regenerateQr(siswa.id);
        setSiswas(siswaDB.getByKelas(kelasId));
        setConfirmData(null);
      }
    });
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Manajemen QR</h1>
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
                  Cetak QR Kelas ({siswas.length})
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
                  const kelas = kelasDB.getById(siswa.kelas_id);
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
                            onClick={() => openPreview(siswa)}>
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
            <span>Layout cetak 6.5 × 9 cm · ~12 kartu/halaman A4</span>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewSiswa && (
        <div className="modal-scrim" onClick={() => setPreviewSiswa(null)}>
          <div className="modal-panel" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Preview QR Code</h3>
              <button className="modal-close" onClick={() => setPreviewSiswa(null)}>✕</button>
            </div>
            <div className="modal-divider" />
            <div className="modal-body" style={{ textAlign: 'center' }}>
              {/* Card mock */}
              <div style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                background: 'var(--bg-inset)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px 28px',
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Kartu Absensi Siswa
                </div>
                <div style={{ width: 1, height: 1, borderTop: '1px solid var(--border-subtle)', alignSelf: 'stretch' }} />
                {previewQr && (
                  <img src={previewQr} alt="QR"
                    style={{ width: 180, height: 180, borderRadius: 8, display: 'block' }} />
                )}
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                  {previewSiswa.nama}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                  NIS {previewSiswa.nis}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {kelasDB.getById(previewSiswa.kelas_id)?.nama}
                </div>
              </div>
              <div style={{
                fontSize: 11,
                color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-mono)',
                wordBreak: 'break-all',
                background: 'var(--bg-inset)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'left',
                border: '1px solid var(--border-subtle)',
              }}>
                SISWA:{previewSiswa.qr_token}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setPreviewSiswa(null)}>Tutup</button>
              <button className="btn btn-primary" onClick={() => handlePrintSatu(previewSiswa)}>
                Cetak Kartu
              </button>
            </div>
          </div>
        </div>
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
