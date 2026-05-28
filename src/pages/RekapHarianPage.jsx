import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { absensiDB, siswaDB, kelasDB, sesiDB } from '../lib/localDB';
import { STATUS_ABSENSI, todayStr, formatTanggal, DAYS_ID } from '../lib/constants';
import { exportRekapHarian } from '../features/reports/exportToExcel';
import { Download, Printer, Search } from 'lucide-react';
import Header from '../components/ui/Header';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import Select from '../components/ui/Select';
import DatePicker from '../components/ui/DatePicker';

const STATUS_CONFIG = {
  hadir:      { code: 'H', label: 'Hadir',      variant: 'hadir' },
  izin:       { code: 'I', label: 'Izin',       variant: 'izin' },
  sakit:      { code: 'S', label: 'Sakit',      variant: 'sakit' },
  alpha:      { code: 'A', label: 'Alpha',      variant: 'alpha' },
  dispensasi: { code: 'D', label: 'Disp.',      variant: 'terlambat' },
};

function StatusPopover({ cellRef, current, onSelect, onClose }) {
  const popRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, above: false });

  useEffect(() => {
    if (!cellRef?.current) return;
    const rect = cellRef.current.getBoundingClientRect();
    const popH = 52;
    const spaceBelow = window.innerHeight - rect.bottom;
    const above = spaceBelow < popH + 12;

    setPos({
      top: above ? rect.top + window.scrollY - popH - 6 : rect.bottom + window.scrollY + 6,
      left: Math.min(rect.left + window.scrollX + rect.width / 2 - 40, window.innerWidth - 120),
      above,
    });
  }, [cellRef]);

  useEffect(() => {
    function handler(e) {
      if (popRef.current && !popRef.current.contains(e.target) && cellRef.current && !cellRef.current.contains(e.target)) {
        onClose();
      }
    }
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 80);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [onClose, cellRef]);

  return (
    <div
      ref={popRef}
      style={{
        position: 'absolute', top: pos.top, left: pos.left,
        background: 'var(--bg-card)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
        padding: 'var(--space-2)', display: 'flex', gap: 'var(--space-1)', zIndex: 100
      }}
    >
      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
        <button
          key={key}
          onClick={() => { onSelect(key); onClose(); }}
          style={{
            border: 'none', background: current === key ? 'var(--color-neutral-100)' : 'transparent',
            padding: '4px 8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            fontSize: 'var(--text-xs)', fontWeight: 'bold'
          }}
          title={cfg.label}
        >
          {cfg.code}
        </button>
      ))}
    </div>
  );
}

function AttendanceCell({ siswa, sesi, record, canEdit, onUpdate }) {
  const [open, setOpen] = useState(false);
  const cellRef = useRef(null);
  const status = record?.status || 'alpha';
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.alpha;

  return (
    <div ref={cellRef} style={{ display: 'inline-block' }}>
      <button
        style={{ background: 'transparent', border: 'none', cursor: canEdit ? 'pointer' : 'default', padding: 0 }}
        onClick={canEdit ? () => setOpen(v => !v) : undefined}
        title={cfg.label}
      >
        <Badge variant={cfg.variant}>{cfg.code}</Badge>
      </button>

      {open && canEdit && (
        <StatusPopover cellRef={cellRef} current={status} onSelect={(newStatus) => onUpdate(siswa, sesi, record, newStatus)} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

export function RekapHarianPage({ user }) {
  const [tanggal, setTanggal] = useState(todayStr());
  const [kelasId, setKelasId] = useState('');
  const [kelasList, setKelasList] = useState([]);
  const [sesis, setSesis] = useState([]);
  const [absensiData, setAbsensiData] = useState([]);
  const [search, setSearch] = useState('');

  const canEdit = ['admin', 'wali_kelas'].includes(user?.role);

  useEffect(() => {
    let allKelas = kelasDB.getAll();
    if (user?.role === 'pengawas' && user?.tingkat_akses?.length > 0) {
      allKelas = allKelas.filter(k => user.tingkat_akses.includes(k.nama.split(' ')[0]));
    }
    setKelasList(allKelas);
    setSesis(sesiDB.getAll().sort((a, b) => a.urutan - b.urutan));
  }, [user]);

  useEffect(() => { if (kelasList.length > 0 && !kelasId) setKelasId(kelasList[0].id); }, [kelasList]);
  useEffect(() => { if (kelasId) loadData(); }, [tanggal, kelasId]);

  function loadData() { setAbsensiData(absensiDB.getByTanggalKelas(tanggal, kelasId)); }

  const siswas = useMemo(() => {
    if (!kelasId) return [];
    return siswaDB.getByKelas(kelasId);
  }, [kelasId]);

  const filtered = useMemo(() => {
    if (!search) return siswas;
    const q = search.toLowerCase();
    return siswas.filter(s => s.nama.toLowerCase().includes(q) || s.nis.includes(q));
  }, [siswas, search]);

  const absensiMap = useMemo(() => {
    const m = {};
    absensiData.forEach(a => { m[`${a.siswa_id}_${a.sesi_id}`] = a; });
    return m;
  }, [absensiData]);

  const summary = useMemo(() => {
    const s = { H: 0, I: 0, S: 0, A: 0, D: 0 };
    siswas.forEach(sw => {
      const first = sesis.map(se => absensiMap[`${sw.id}_${se.id}`]).find(Boolean);
      const st = first?.status;
      if (!st) { s.A++; return; }
      const code = STATUS_CONFIG[st]?.code || 'A';
      s[code] = (s[code] || 0) + 1;
    });
    return { ...s, total: siswas.length };
  }, [siswas, sesis, absensiMap]);

  const handleUpdate = useCallback((siswa, sesi, existing, newStatus) => {
    if (existing) {
      absensiDB.update(existing.id, { status: newStatus, updated_by: user?.id });
    } else {
      absensiDB.create({ siswa_id: siswa.id, sesi_id: sesi.id, tanggal, status: newStatus, catatan: '' });
    }
    setAbsensiData(absensiDB.getByTanggalKelas(tanggal, kelasId));
  }, [tanggal, kelasId, user]);

  const hariStr = `${DAYS_ID[new Date(tanggal + 'T00:00:00').getDay()]}, ${formatTanggal(tanggal + 'T00:00:00')}`;
  const kelas = kelasDB.getById(kelasId);

  const columns = [
    { key: 'index', label: '#', width: '50px', render: (_, __, i) => i + 1 },
    { key: 'nis', label: 'NIS', width: '100px' },
    { key: 'nama', label: 'Nama Siswa' },
    ...sesis.map(s => ({
      key: `sesi_${s.id}`,
      label: s.nama,
      align: 'center',
      render: (_, row) => (
        <AttendanceCell siswa={row} sesi={s} record={absensiMap[`${row.id}_${s.id}`]} canEdit={canEdit} onUpdate={handleUpdate} />
      )
    }))
  ];

  return (
    <div className="stack-6">
      <Header
        title="Rekap Absensi Harian"
        subtitle={hariStr}
        actions={
          <div className="row-3">
            <Button size="sm" variant="ghost" onClick={() => window.print()} icon={<Printer size={16} />}>Cetak</Button>
            <Button size="sm" onClick={() => exportRekapHarian({ siswas, absensiByDate: {}, sesis, tanggal, namaKelas: kelas?.nama })} icon={<Download size={16} />}>Excel</Button>
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
          background: 'var(--bg-card)',
          color: 'var(--color-primary-600)',
          boxShadow: 'var(--shadow-xs)',
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
          background: 'transparent',
          color: 'var(--text-secondary)',
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
        <DatePicker
          value={tanggal}
          onChange={setTanggal}
        />
        <div style={{ flex: 1, minWidth: 200 }}>
          <Input icon={<Search size={16} />} placeholder="Cari nama atau NIS…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid-stats">
        <StatCard label="Hadir" value={summary.H} color="green" icon={<span style={{fontWeight:'bold'}}>H</span>} />
        <StatCard label="Izin" value={summary.I} color="blue" icon={<span style={{fontWeight:'bold'}}>I</span>} />
        <StatCard label="Sakit" value={summary.S} color="amber" icon={<span style={{fontWeight:'bold'}}>S</span>} />
        <StatCard label="Alpha" value={summary.A} color="red" icon={<span style={{fontWeight:'bold'}}>A</span>} />
      </div>

      <Table
        columns={columns}
        data={filtered}
        keyExtractor={row => row.id}
        emptyMessage="Pilih kelas atau tidak ada siswa"
      />

      {createPortal(
        <div className="print-container">
          <div className="print-header">
            <h1 className="print-title">Rekap Absensi Harian — {(localStorage.getItem('school_name') || 'Absensi QR').toUpperCase()}</h1>
            <div className="print-meta-grid">
              <span className="print-meta-label">Kelas:</span>
              <span>{kelas?.nama || '—'}</span>
              <span className="print-meta-label">Hari / Tanggal:</span>
              <span>{hariStr}</span>
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="center" style={{ textAlign: 'center' }}>Tidak ada data</td>
                </tr>
              ) : (
                filtered.map((sw, idx) => {
                  let H = 0, I = 0, S = 0, A = 0;
                  sesis.forEach(se => {
                    const rec = absensiMap[`${sw.id}_${se.id}`];
                    const st = rec?.status;
                    if (st === 'hadir') H++;
                    else if (st === 'izin') I++;
                    else if (st === 'sakit') S++;
                    else if (st === 'dispensasi') H++; // dispensasi counts as Hadir
                    else A++; // default/alpha
                  });
                  return (
                    <tr key={sw.id}>
                      <td className="center" style={{ textAlign: 'center' }}>{idx + 1}</td>
                      <td>{sw.nis}</td>
                      <td>{sw.nama}</td>
                      <td className="center" style={{ textAlign: 'center' }}>{H}</td>
                      <td className="center" style={{ textAlign: 'center' }}>{I}</td>
                      <td className="center" style={{ textAlign: 'center' }}>{S}</td>
                      <td className="center" style={{ textAlign: 'center' }}>{A}</td>
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
