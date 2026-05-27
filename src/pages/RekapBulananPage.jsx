// ============================================================
// pages/RekapBulananPage.jsx — Rekap absensi bulanan
// Tabel: Nama | Tgl-1 ... Tgl-31 | H | I | S | A | D
// ============================================================
import { useState, useEffect, useMemo } from 'react';
import { absensiDB, siswaDB, kelasDB, sesiDB } from '../lib/localDB';
import { STATUS_ABSENSI, MONTHS_ID } from '../lib/constants';
import { exportRekapBulanan } from '../features/reports/exportToExcel';

export function RekapBulananPage() {
  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());
  const [kelasId, setKelasId] = useState('');
  const [kelasList, setKelasList] = useState([]);
  const [sesis, setSesis] = useState([]);
  const [absensiData, setAbsensiData] = useState([]);

  useEffect(() => {
    setKelasList(kelasDB.getAll());
    setSesis(sesiDB.getAll());
  }, []);

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

  // Map: siswa_id_tanggal → status (ambil sesi pertama)
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

  function handleExport() {
    const kelas = kelasDB.getById(kelasId);
    exportRekapBulanan({ siswas, absensiMap, sesis, bulan, tahun, namaKelas: kelas?.nama });
  }

  const tahunOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  return (
    <div>
      <div className="page-header no-print">
        <h1>Rekap Bulanan</h1>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {MONTHS_ID[bulan - 1]} {tahun}
        </span>
      </div>

      <div className="page-body">
        {/* Toolbar */}
        <div className="toolbar no-print">
          <select
            id="rekap-bulan-kelas"
            className="form-control"
            style={{ width: 'auto' }}
            value={kelasId}
            onChange={e => setKelasId(e.target.value)}
          >
            {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
          <select
            id="rekap-bulan-bulan"
            className="form-control"
            style={{ width: 'auto' }}
            value={bulan}
            onChange={e => setBulan(Number(e.target.value))}
          >
            {MONTHS_ID.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select
            id="rekap-bulan-tahun"
            className="form-control"
            style={{ width: 'auto' }}
            value={tahun}
            onChange={e => setTahun(Number(e.target.value))}
          >
            {tahunOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="toolbar-right">
            <button className="btn" onClick={() => window.print()}>🖨️ Print</button>
            <button className="btn btn-primary" onClick={handleExport}>📊 Export Excel</button>
          </div>
        </div>

        {/* Table wrapper dengan scroll horizontal */}
        <div className="card">
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="op-table" style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th style={{ position: 'sticky', left: 0, background: 'var(--bg)', zIndex: 2 }}>No</th>
                  <th style={{ position: 'sticky', left: 40, background: 'var(--bg)', zIndex: 2, minWidth: 160 }}>Nama Siswa</th>
                  {days.map(d => <th key={d} style={{ width: 32, textAlign: 'center', padding: '9px 4px' }}>{d}</th>)}
                  <th style={{ textAlign: 'center', color: 'var(--green)' }}>H</th>
                  <th style={{ textAlign: 'center', color: 'var(--blue)' }}>I</th>
                  <th style={{ textAlign: 'center', color: 'var(--orange)' }}>S</th>
                  <th style={{ textAlign: 'center', color: 'var(--red)' }}>A</th>
                  <th style={{ textAlign: 'center' }}>D</th>
                </tr>
              </thead>
              <tbody>
                {siswas.length === 0 ? (
                  <tr><td colSpan={daysInMonth + 7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>Pilih kelas untuk melihat data</td></tr>
                ) : siswas.map((siswa, idx) => {
                  const sum = getSummary(siswa.id);
                  return (
                    <tr key={siswa.id}>
                      <td style={{ position: 'sticky', left: 0, background: 'var(--white)', zIndex: 1 }}>{idx + 1}</td>
                      <td style={{ position: 'sticky', left: 40, background: 'var(--white)', zIndex: 1, fontWeight: 500 }}>
                        {siswa.nama}
                      </td>
                      {days.map(d => {
                        const st = getStatusForDay(siswa.id, d);
                        const cfg = st ? STATUS_ABSENSI[st] : null;
                        return (
                          <td key={d} style={{ textAlign: 'center', padding: '4px 2px', fontSize: 11 }}>
                            {cfg ? <span className={`badge ${cfg.badge}`} style={{ padding: '1px 4px' }}>{cfg.code}</span> : <span style={{ color: '#ddd' }}>·</span>}
                          </td>
                        );
                      })}
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--green)' }}>{sum.H}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--blue)' }}>{sum.I}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--orange)' }}>{sum.S}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--red)' }}>{sum.A}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{sum.D}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }} className="no-print">
          {Object.entries(STATUS_ABSENSI).map(([k, v]) => (
            <span key={k}><span className={`badge ${v.badge}`}>{v.code}</span> = {v.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
