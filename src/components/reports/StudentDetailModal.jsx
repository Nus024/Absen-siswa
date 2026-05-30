import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { absensiService } from '../../lib/db/absensi';
import { exportDetailSiswa } from '../../features/reports/exportToExcel';
import { STATUS_ABSENSI } from '../../lib/constants';
import DatePicker from '../ui/DatePicker';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Download, X } from 'lucide-react';

export default function StudentDetailModal({ siswa, sesis, defaultBulan, defaultTahun, onClose }) {
  const pad = (n) => String(n).padStart(2, '0');
  
  // Hitung awal/akhir bulan default
  const lastDay = new Date(defaultTahun, defaultBulan, 0).getDate();
  const defaultStart = `${defaultTahun}-${pad(defaultBulan)}-01`;
  const defaultEnd = `${defaultTahun}-${pad(defaultBulan)}-${pad(lastDay)}`;

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [absensiList, setAbsensiList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load data absensi ketika range tanggal berubah
  useEffect(() => {
    if (!siswa?.id || !startDate || !endDate) return;
    setLoading(true);
    absensiService.getBySiswaDateRange(siswa.id, startDate, endDate)
      .then(setAbsensiList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [siswa?.id, startDate, endDate]);

  const getDatesInRange = (startStr, endStr) => {
    const dates = [];
    const curr = new Date(startStr + 'T00:00:00');
    const end = new Date(endStr + 'T00:00:00');
    while (curr <= end) {
      dates.push(curr.toLocaleDateString('sv-SE'));
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  // Matriks log lengkap (hari & sesi)
  const displayRows = useMemo(() => {
    if (!startDate || !endDate) return [];
    const dates = getDatesInRange(startDate, endDate);
    
    const recordMap = {};
    absensiList.forEach(a => {
      recordMap[`${a.tanggal}_${a.sesi_id}`] = a;
    });

    const rows = [];
    dates.forEach(date => {
      sesis.forEach(sesi => {
        const rec = recordMap[`${date}_${sesi.id}`];
        rows.push({
          date,
          sesiId: sesi.id,
          sesiNama: sesi.nama,
          status: rec?.status || null,
          waktuScan: rec?.waktu_scan 
            ? new Date(rec.waktu_scan).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) 
            : '—',
          catatan: rec?.catatan || '—'
        });
      });
    });
    return rows;
  }, [startDate, endDate, absensiList, sesis]);

  // Kalkulasi summary berdasarkan matriks lengkap
  const summary = useMemo(() => {
    let H = 0, I = 0, S = 0, A = 0;
    displayRows.forEach(r => {
      if (r.status === 'hadir') H++;
      else if (r.status === 'izin') I++;
      else if (r.status === 'sakit') S++;
      else if (r.status === 'alpha') A++;
    });
    return { H, I, S, A };
  }, [displayRows]);

  const handleExport = () => {
    exportDetailSiswa({ siswa, displayRows, startDate, endDate });
  };

  const formatTanggalIndo = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return createPortal(
    <div className="modal-scrim" onClick={onClose}>
      <style dangerouslySetInnerHTML={{__html: `
        .modal-filter-bar {
          display: flex;
          gap: 12px;
          align-items: center;
          background: var(--color-neutral-50);
          padding: 12px;
          border-radius: 8px;
          flex-wrap: wrap;
        }
        .modal-filter-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .modal-filter-label {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--text-secondary);
        }
        .modal-filter-btn {
          margin-left: auto;
        }
        .modal-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        @media (max-width: 640px) {
          .modal-filter-bar {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            padding: 10px;
          }
          .modal-filter-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          .modal-filter-item > div {
            width: 100%;
          }
          .modal-filter-btn {
            grid-column: 1 / 3;
            width: 100%;
            margin-left: 0;
          }
          .modal-filter-btn button {
            width: 100% !important;
            justify-content: center;
          }
          .modal-stats-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}} />
      <div className="modal-panel" style={{ maxWidth: 720, width: '95%', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'visible' }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Rincian Absensi Individu</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
              {siswa.nama} ({siswa.nis}) — Kelas: {siswa.kelas_nama || '—'}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-divider" />

        {/* Body */}
        <div className="modal-body stack-4" style={{ flex: 1, paddingBottom: 16, overflow: 'visible' }}>
          
          {/* Controls: Date Filter */}
          <div className="modal-filter-bar">
            <div className="modal-filter-item">
              <span className="modal-filter-label">Mulai:</span>
              <DatePicker value={startDate} onChange={setStartDate} align="left" />
            </div>
            
            <div className="modal-filter-item">
              <span className="modal-filter-label">Selesai:</span>
              <DatePicker value={endDate} onChange={setEndDate} align="right" />
            </div>

            <div className="modal-filter-btn">
              <Button size="sm" onClick={handleExport} icon={<Download size={14} />}>Excel</Button>
            </div>
          </div>

          {/* Stats Summary Cards */}
          <div className="modal-stats-grid">
            <div style={{ background: 'var(--color-primary-50)', padding: 10, borderRadius: 8, textAlign: 'center', border: '1px solid var(--color-primary-100)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-primary-700)', textTransform: 'uppercase' }}>Hadir</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary-800)' }}>{summary.H}</div>
            </div>
            <div style={{ background: '#eff6ff', padding: 10, borderRadius: 8, textAlign: 'center', border: '1px solid #dbeafe' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>Izin</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1e40af' }}>{summary.I}</div>
            </div>
            <div style={{ background: '#fffbeb', padding: 10, borderRadius: 8, textAlign: 'center', border: '1px solid #fef3c7' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Sakit</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#92400e' }}>{summary.S}</div>
            </div>
            <div style={{ background: '#fef2f2', padding: 10, borderRadius: 8, textAlign: 'center', border: '1px solid #fee2e2' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>Alpha</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#991b1b' }}>{summary.A}</div>
            </div>
          </div>

          {/* Table Container */}
          <div style={{ border: '1px solid var(--border-default)', borderRadius: 8, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
                <span className="spinner" /> Memuat rincian…
              </div>
            ) : (
              <div style={{ maxHeight: 280, overflowY: 'auto', overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 500, borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-neutral-50)', borderBottom: '1px solid var(--border-default)', fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Hari, Tanggal</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Sesi</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Waktu Scan</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayRows.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ada data pada periode ini</td></tr>
                    ) : displayRows.map((r, idx) => (
                      <tr key={`${r.date}_${r.sesiId}`} style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
                        <td style={{ padding: '8px 12px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{formatTanggalIndo(r.date)}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{r.sesiNama}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          {r.status ? (
                            <Badge variant={r.status}>{STATUS_ABSENSI[r.status]?.code}</Badge>
                          ) : (
                            <span style={{ color: 'var(--color-neutral-300)' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{r.waktuScan}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.catatan}>{r.catatan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        <div className="modal-divider" />

        {/* Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 24px' }}>
          <Button onClick={onClose} variant="ghost">Tutup</Button>
        </div>

      </div>
    </div>,
    document.body
  );
}
