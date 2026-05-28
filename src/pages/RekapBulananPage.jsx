import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { absensiDB, siswaDB, kelasDB, sesiDB } from '../lib/localDB';
import { STATUS_ABSENSI, MONTHS_ID } from '../lib/constants';
import { exportRekapBulanan } from '../features/reports/exportToExcel';
import { Download, Printer } from 'lucide-react';
import Header from '../components/ui/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Select from '../components/ui/Select';

export function RekapBulananPage({ user }) {
  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());
  const [kelasId, setKelasId] = useState('');
  const [kelasList, setKelasList] = useState([]);
  const [sesis, setSesis] = useState([]);
  const [absensiData, setAbsensiData] = useState([]);

  useEffect(() => {
    let allKelas = kelasDB.getAll();
    if (user?.role === 'pengawas' && user?.tingkat_akses?.length > 0) {
      allKelas = allKelas.filter(k => user.tingkat_akses.includes(k.nama.split(' ')[0]));
    }
    setKelasList(allKelas);
    setSesis(sesiDB.getAll());
  }, [user]);

  useEffect(() => {
    if (kelasList.length > 0 && !kelasId) setKelasId(kelasList[0].id);
  }, [kelasList]);

  useEffect(() => {
    if (!kelasId) return;
    const all = absensiDB.getByMonth(tahun, bulan);
    setAbsensiData(all);
  }, [bulan, tahun, kelasId]);

  const siswas = useMemo(() => {
    if (!kelasId) return [];
    const kelas = kelasDB.getById(kelasId);
    return siswaDB.getByKelas(kelasId).map(s => ({ ...s, kelas_nama: kelas?.nama || '' }));
  }, [kelasId]);

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
    const dateStr = `${tahun}-${bulan.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
    return absensiMap[`${siswaId}_${dateStr}`] || null;
  }

  function getSummary(siswaId) {
    let H = 0, I = 0, S = 0, A = 0, D = 0;
    days.forEach(d => {
      const st = getStatusForDay(siswaId, d);
      if (!st) return;
      if (st === 'hadir') H++;
      else if (st === 'izin') I++;
      else if (st === 'sakit') S++;
      else if (st === 'alpha') A++;
      else if (st === 'dispensasi') D++;
    });
    return { H, I, S, A, D };
  }

  const tahunOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);
  const kelas = kelasDB.getById(kelasId);

  return (
    <div className="stack-6">
      <Header
        title="Rekap Absensi Bulanan"
        subtitle={`${MONTHS_ID[bulan - 1]} ${tahun}`}
        actions={
          <div className="row-3">
            <Button size="sm" variant="ghost" onClick={() => window.print()} icon={<Printer size={16} />}>Cetak</Button>
            <Button size="sm" onClick={() => exportRekapBulanan({ siswas, absensiMap, sesis, bulan, tahun, namaKelas: kelas?.nama })} icon={<Download size={16} />}>Excel</Button>
          </div>
        }
      />

      <div style={{
        display: 'inline-flex',
        background: 'var(--color-neutral-100)',
        padding: '3px',
        borderRadius: '8px',
        alignSelf: 'flex-start',
      }}>
        <Link to="/rekap-harian" style={{
          padding: '6px 14px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          textDecoration: 'none',
          background: 'transparent',
          color: 'var(--text-secondary)',
          transition: 'all 150ms'
        }}>Harian</Link>
        <Link to="/rekap-bulanan" style={{
          padding: '6px 14px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          textDecoration: 'none',
          background: 'var(--bg-card)',
          color: 'var(--color-primary-600)',
          boxShadow: 'var(--shadow-xs)',
          transition: 'all 150ms'
        }}>Bulanan</Link>
      </div>

      {/* Toolbar */}
      <div style={{
        background: 'var(--color-neutral-50)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        <Select
          value={kelasId}
          onChange={setKelasId}
          options={kelasList.map(k => ({ value: k.id, label: k.nama }))}
        />
        <Select
          value={bulan}
          onChange={setBulan}
          options={MONTHS_ID.map((m, i) => ({ value: i + 1, label: m }))}
        />
        <Select
          value={tahun}
          onChange={setTahun}
          options={tahunOptions.map(y => ({ value: y, label: String(y) }))}
        />
      </div>

      <Card padding="none">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ background: 'var(--color-neutral-50)', borderBottom: '1px solid var(--border-default)', textTransform: 'uppercase', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', position: 'sticky', left: 0, background: 'var(--color-neutral-50)', zIndex: 2 }}>#</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', position: 'sticky', left: 40, background: 'var(--color-neutral-50)', zIndex: 2 }}>Nama Siswa</th>
                {days.map(d => <th key={d} style={{ padding: 'var(--space-3) 4px', textAlign: 'center' }}>{d}</th>)}
                <th style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'center', color: 'var(--color-success)' }}>H</th>
                <th style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'center', color: 'var(--color-info)' }}>I</th>
                <th style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'center', color: 'var(--color-warning)' }}>S</th>
                <th style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'center', color: 'var(--color-danger)' }}>A</th>
                <th style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'center' }}>D</th>
              </tr>
            </thead>
            <tbody>
              {siswas.length === 0 ? (
                <tr><td colSpan={daysInMonth + 7} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ada siswa</td></tr>
              ) : siswas.map((siswa, idx) => {
                const sum = getSummary(siswa.id);
                return (
                  <tr key={siswa.id} style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', position: 'sticky', left: 0, background: 'var(--bg-card)', zIndex: 1 }}>{idx + 1}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', position: 'sticky', left: 40, background: 'var(--bg-card)', zIndex: 1 }}>{siswa.nama}</td>
                    {days.map(d => {
                      const st = getStatusForDay(siswa.id, d);
                      return (
                        <td key={d} style={{ padding: '4px', textAlign: 'center' }}>
                          {st ? <Badge variant={st === 'dispensasi' ? 'terlambat' : st}>{STATUS_ABSENSI[st]?.code}</Badge> : <span style={{ color: 'var(--color-neutral-300)' }}>·</span>}
                        </td>
                      );
                    })}
                    <td style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-success)' }}>{sum.H}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-info)' }}>{sum.I}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-warning)' }}>{sum.S}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-danger)' }}>{sum.A}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'center', fontWeight: 'bold' }}>{sum.D}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {createPortal(
        <div className="print-container">
          <div className="print-header">
            <h1 className="print-title">Rekap Absensi Bulanan — {(localStorage.getItem('school_name') || 'Absensi QR').toUpperCase()}</h1>
            <div className="print-meta-grid">
              <span className="print-meta-label">Kelas:</span>
              <span>{kelas?.nama || '—'}</span>
              <span className="print-meta-label">Bulan / Tahun:</span>
              <span>{MONTHS_ID[bulan - 1]} {tahun}</span>
            </div>
          </div>
          
          <table className="print-table">
            <thead>
              <tr>
                <th className="center" style={{ width: '40px', textAlign: 'center' }}>NO</th>
                <th style={{ width: '120px' }}>NIS</th>
                <th>NAMA SISWA</th>
                <th className="center" style={{ width: '60px', textAlign: 'center' }}>H</th>
                <th className="center" style={{ width: '60px', textAlign: 'center' }}>I</th>
                <th className="center" style={{ width: '60px', textAlign: 'center' }}>S</th>
                <th className="center" style={{ width: '60px', textAlign: 'center' }}>A</th>
              </tr>
            </thead>
            <tbody>
              {siswas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="center" style={{ textAlign: 'center' }}>Tidak ada data</td>
                </tr>
              ) : (
                siswas.map((siswa, idx) => {
                  const sum = getSummary(siswa.id);
                  return (
                    <tr key={siswa.id}>
                      <td className="center" style={{ textAlign: 'center' }}>{idx + 1}</td>
                      <td>{siswa.nis}</td>
                      <td>{siswa.nama}</td>
                      <td className="center" style={{ textAlign: 'center' }}>{sum.H}</td>
                      <td className="center" style={{ textAlign: 'center' }}>{sum.I}</td>
                      <td className="center" style={{ textAlign: 'center' }}>{sum.S}</td>
                      <td className="center" style={{ textAlign: 'center' }}>{sum.A}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>,
        document.body
      )}
    </div>
  );
}
