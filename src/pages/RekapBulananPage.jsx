// ============================================================
// pages/RekapBulananPage.jsx — Rekap bulanan via Google Sheets REST API
// ============================================================
import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { kelasService }   from '../lib/db/kelas';
import { siswaService }   from '../lib/db/siswa';
import { sesiService }    from '../lib/db/sesi';
import { absensiService } from '../lib/db/absensi';
import { STATUS_ABSENSI, MONTHS_ID } from '../lib/constants';
import { exportRekapBulanan } from '../features/reports/exportToExcel';
import { Download, Printer } from 'lucide-react';
import StudentDetailModal from '../components/reports/StudentDetailModal';
import BulkExportModal from '../components/reports/BulkExportModal';
import Header  from '../components/ui/Header';
import Card    from '../components/ui/Card';
import Button  from '../components/ui/Button';
import Badge   from '../components/ui/Badge';
import Select  from '../components/ui/Select';

export function RekapBulananPage({ user }) {
  const now = new Date();
  const [bulan, setBulan]         = useState(now.getMonth() + 1);
  const [tahun, setTahun]         = useState(now.getFullYear());
  const [kelasId, setKelasId]     = useState('');
  const [kelasList, setKelasList] = useState([]);
  const [sesis, setSesis]         = useState([]);
  const [siswas, setSiswas]       = useState([]);
  const [absensiData, setAbsensiData] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [selectedSiswaIdForDetail, setSelectedSiswaIdForDetail] = useState(null);
  const [selectedSiswaIds, setSelectedSiswaIds] = useState([]);
  const [openBulkExportModal, setOpenBulkExportModal] = useState(false);

  // Load kelas & sesi awal
  useEffect(() => {
    async function init() {
      try {
        const [allKelas, allSesi] = await Promise.all([
          kelasService.getAll(),
          sesiService.getAll(),
        ]);
        let kelas = allKelas;
        if (user?.role === 'pengawas' && user?.tingkat_akses?.length > 0) {
          kelas = allKelas.filter(k => user.tingkat_akses.includes(k.nama.split(' ')[0]));
        }
        setKelasList(kelas);
        setSesis(allSesi);
        if (kelas.length > 0) setKelasId(kelas[0].id);
      } catch (err) { console.error(err); }
    }
    init();
  }, [user]);

  // Load siswa saat kelas berubah
  useEffect(() => {
    if (!kelasId) return;
    siswaService.getByKelas(kelasId).then(data => {
      setSiswas(data);
      setSelectedSiswaIds([]);
    }).catch(console.error);
  }, [kelasId]);

  // Load absensi bulan ini
  useEffect(() => {
    if (!kelasId) return;
    setLoading(true);
    absensiService.getByMonth(tahun, bulan)
      .then(data => {
        // Filter hanya siswa di kelas yang dipilih
        const siswaIds = new Set(siswas.map(s => s.id));
        setAbsensiData(data.filter(a => siswaIds.has(a.siswa_id)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bulan, tahun, kelasId, siswas]);

  const daysInMonth = new Date(tahun, bulan, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const absensiMap = useMemo(() => {
    const map = {};
    absensiData.forEach(a => {
      const key = `${a.siswa_id}_${a.tanggal}`;
      if (!map[key]) map[key] = a.status;
    });
    return map;
  }, [absensiData]);

  function getStatusForDay(siswaId, day) {
    const dateStr = `${tahun}-${bulan.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return absensiMap[`${siswaId}_${dateStr}`] || null;
  }

  function getSummary(siswaId) {
    let H = 0, I = 0, S = 0, A = 0;
    days.forEach(d => {
      const st = getStatusForDay(siswaId, d);
      if (!st) return;
      if (st === 'hadir') H++;
      else if (st === 'izin') I++;
      else if (st === 'sakit') S++;
      else if (st === 'alpha') A++;
    });
    return { H, I, S, A };
  }

  const tahunOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);
  const kelas = kelasList.find(k => k.id === kelasId);

  const handleSelectSiswa = (siswaId) => {
    setSelectedSiswaIds(prev =>
      prev.includes(siswaId) ? prev.filter(id => id !== siswaId) : [...prev, siswaId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSiswaIds.length === siswas.length) {
      setSelectedSiswaIds([]);
    } else {
      setSelectedSiswaIds(siswas.map(s => s.id));
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    const kelasNama = kelas?.nama ? kelas.nama.replace(/\s+/g, '_') : 'Semua_Kelas';
    const bulanNama = MONTHS_ID[bulan - 1];
    document.title = `Rekap_Absensi_Bulanan_${kelasNama}_${bulanNama}_${tahun}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="stack-6">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: landscape;
            margin: 8mm;
          }
          .print-container {
            display: block !important;
            width: 100%;
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8px !important;
          }
          .print-table th, .print-table td {
            padding: 3px 2px !important;
            border: 1px solid #000 !important;
            text-align: center;
          }
          .print-table th:nth-child(3), .print-table td:nth-child(3) {
            text-align: left;
            padding-left: 4px !important;
          }
        }
      `}} />
      <div className="desktop-header-wrap">
        <Header title="Rekap Absensi Bulanan" subtitle={`${MONTHS_ID[bulan - 1]} ${tahun}`}
          actions={
            <div className="row-3">
              <Button size="sm" variant="secondary" onClick={() => setOpenBulkExportModal(true)} icon={<Download size={16} />}>Ekspor Rincian</Button>
              <Button size="sm" variant="ghost" onClick={handlePrint} icon={<Printer size={16} />}>Cetak</Button>
              <Button size="sm" onClick={() => exportRekapBulanan({ siswas, absensiMap, sesis, bulan, tahun, namaKelas: kelas?.nama })} icon={<Download size={16} />}>Excel</Button>
            </div>
          }
        />
      </div>

      <div className="mobile-header-controls">
        <div className="mobile-segmented-pill">
          <Link to="/rekap-harian" className="inactive">HARIAN</Link>
          <Link to="/rekap-bulanan" className="active">BULANAN</Link>
        </div>
        <div className="mobile-action-buttons">
          <Button size="sm" variant="secondary" onClick={() => setOpenBulkExportModal(true)} icon={<Download size={16} />}>Rincian</Button>
          <Button size="sm" variant="ghost" onClick={handlePrint} icon={<Printer size={16} />}>Cetak</Button>
          <Button size="sm" onClick={() => exportRekapBulanan({ siswas, absensiMap, sesis, bulan, tahun, namaKelas: kelas?.nama })} icon={<Download size={16} />}>Excel</Button>
        </div>
      </div>

      <div className="desktop-segmented-wrap" style={{ display: 'inline-flex', background: 'var(--color-neutral-100)', padding: '3px', borderRadius: '8px', alignSelf: 'flex-start' }}>
        <Link to="/rekap-harian" style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', textDecoration: 'none', background: 'transparent', color: 'var(--text-secondary)' }}>Harian</Link>
        <Link to="/rekap-bulanan" style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', textDecoration: 'none', background: 'var(--bg-card)', color: 'var(--color-primary-600)', boxShadow: 'var(--shadow-xs)' }}>Bulanan</Link>
      </div>

      <div className="toolbar toolbar-monthly">
        <Select value={kelasId} onChange={setKelasId} options={kelasList.map(k => ({ value: k.id, label: k.nama }))} />
        <Select value={bulan}   onChange={v => setBulan(Number(v))}  options={MONTHS_ID.map((m, i) => ({ value: i + 1, label: m }))} />
        <Select value={tahun}   onChange={v => setTahun(Number(v))}  options={tahunOptions.map(y => ({ value: y, label: String(y) }))} />
      </div>

      <Card padding="none">
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
            <span className="spinner" /> Memuat data…
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ background: 'var(--color-neutral-50)', borderBottom: '1px solid var(--border-default)', textTransform: 'uppercase', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', position: 'sticky', left: 0, background: 'var(--color-neutral-50)', zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input type="checkbox" checked={selectedSiswaIds.length === siswas.length && siswas.length > 0} onChange={handleSelectAll} style={{ cursor: 'pointer' }} />
                      <span>#</span>
                    </div>
                  </th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', position: 'sticky', left: 40, background: 'var(--color-neutral-50)', zIndex: 2 }}>Nama Siswa</th>
                  {days.map(d => <th key={d} style={{ padding: 'var(--space-3) 4px', textAlign: 'center' }}>{d}</th>)}
                  <th style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'center', color: 'var(--color-success)' }}>H</th>
                  <th style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'center', color: 'var(--color-info)' }}>I</th>
                  <th style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'center', color: 'var(--color-warning)' }}>S</th>
                  <th style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'center', color: 'var(--color-danger)' }}>A</th>
                </tr>
              </thead>
              <tbody>
                {siswas.length === 0 ? (
                  <tr><td colSpan={daysInMonth + 6} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ada siswa</td></tr>
                ) : siswas.map((siswa, idx) => {
                  const sum = getSummary(siswa.id);
                  return (
                    <tr key={siswa.id} style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
                      <td style={{ padding: 'var(--space-3) var(--space-4)', position: 'sticky', left: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input type="checkbox" checked={selectedSiswaIds.includes(siswa.id)} onChange={() => handleSelectSiswa(siswa.id)} style={{ cursor: 'pointer' }} />
                          <span>{idx + 1}</span>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)', position: 'sticky', left: 40, background: 'var(--bg-card)', zIndex: 1 }}>
                        <button
                          onClick={() => setSelectedSiswaIdForDetail(siswa.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-primary-600)',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            padding: 0,
                            textAlign: 'left',
                            fontWeight: 'inherit',
                            fontFamily: 'inherit',
                            fontSize: 'inherit'
                          }}
                        >
                          {siswa.nama}
                        </button>
                      </td>
                      {days.map(d => {
                        const st = getStatusForDay(siswa.id, d);
                        return (
                          <td key={d} style={{ padding: '4px', textAlign: 'center' }}>
                            {st ? <Badge variant={st}>{STATUS_ABSENSI[st]?.code}</Badge>
                                : <span style={{ color: 'var(--color-neutral-400)' }}>-</span>}
                          </td>
                        );
                      })}
                      <td style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-success)' }}>{sum.H}</td>
                      <td style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-info)' }}>{sum.I}</td>
                      <td style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-warning)' }}>{sum.S}</td>
                      <td style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-danger)' }}>{sum.A}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {createPortal(
        <div className="print-container">
          <div className="print-header">
            <h1 className="print-title">Rekap Absensi Bulanan — {(localStorage.getItem('school_name') || 'Absensi QR').toUpperCase()}</h1>
            <div className="print-meta-grid">
              <span className="print-meta-label">Kelas:</span><span>{kelas?.nama || '—'}</span>
              <span className="print-meta-label">Bulan / Tahun:</span><span>{MONTHS_ID[bulan - 1]} {tahun}</span>
            </div>
          </div>
          <table className="print-table">
            <thead>
              <tr>
                <th style={{ width: '30px', textAlign: 'center' }}>NO</th>
                <th style={{ width: '80px', textAlign: 'center' }}>NIS</th>
                <th style={{ textAlign: 'left' }}>NAMA SISWA</th>
                {days.map(d => (
                  <th key={d} style={{ width: '18px', textAlign: 'center' }}>{d}</th>
                ))}
                <th style={{ width: '22px', textAlign: 'center' }}>H</th>
                <th style={{ width: '22px', textAlign: 'center' }}>I</th>
                <th style={{ width: '22px', textAlign: 'center' }}>S</th>
                <th style={{ width: '22px', textAlign: 'center' }}>A</th>
              </tr>
            </thead>
            <tbody>
              {siswas.length === 0 ? (
                <tr><td colSpan={days.length + 7} style={{ textAlign: 'center' }}>Tidak ada data</td></tr>
              ) : siswas.map((siswa, idx) => {
                const sum = getSummary(siswa.id);
                return (
                  <tr key={siswa.id}>
                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ textAlign: 'center' }}>{siswa.nis}</td>
                    <td>{siswa.nama}</td>
                    {days.map(d => {
                      const st = getStatusForDay(siswa.id, d);
                      const codes = { hadir: 'H', izin: 'I', sakit: 'S', alpha: 'A' };
                      const val = st ? (codes[st] || '-') : '-';
                      return (
                        <td key={d} style={{ textAlign: 'center' }}>{val}</td>
                      );
                    })}
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{sum.H}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{sum.I}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{sum.S}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{sum.A}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>,
        document.body
      )}

      {/* Detail Siswa Modal */}
      {selectedSiswaIdForDetail && (
        <StudentDetailModal
          siswa={siswas.find(s => s.id === selectedSiswaIdForDetail)}
          sesis={sesis}
          defaultBulan={bulan}
          defaultTahun={tahun}
          onClose={() => setSelectedSiswaIdForDetail(null)}
        />
      )}

      {/* Bulk Export Modal */}
      {openBulkExportModal && (
        <BulkExportModal
          siswas={siswas}
          selectedSiswaIds={selectedSiswaIds}
          sesis={sesis}
          defaultBulan={bulan}
          defaultTahun={tahun}
          onClose={() => setOpenBulkExportModal(false)}
          onClearSelection={() => setSelectedSiswaIds([])}
        />
      )}
    </div>
  );
}
