// ============================================================
// pages/RekapHarianPage.jsx
// Direct manipulation · Inline popover editing · No action column
// ============================================================
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { absensiDB, siswaDB, kelasDB, sesiDB } from '../lib/localDB';
import { STATUS_ABSENSI, todayStr, formatTanggal, DAYS_ID } from '../lib/constants';
import { exportRekapHarian } from '../features/reports/exportToExcel';
import { Download, Printer } from 'lucide-react';

/* ── Status configuration ────────────────────────────────── */
const STATUS_CONFIG = {
  hadir:      { code: 'H', label: 'Hadir',      cls: 'sp-H' },
  izin:       { code: 'I', label: 'Izin',       cls: 'sp-I' },
  sakit:      { code: 'S', label: 'Sakit',      cls: 'sp-S' },
  alpha:      { code: 'A', label: 'Alpha',      cls: 'sp-A' },
  dispensasi: { code: 'D', label: 'Disp.',      cls: 'sp-D' },
};

/* ── Inline Status Popover ───────────────────────────────── */
/*
  Mounts at document.body via a portal-like absolute positioning.
  Appears near the clicked cell, auto-dismisses on outside click.
*/
function StatusPopover({ cellRef, current, onSelect, onClose }) {
  const popRef = useRef(null);

  // Position calculation
  const [pos, setPos] = useState({ top: 0, left: 0, above: false });

  useEffect(() => {
    if (!cellRef?.current) return;
    const rect = cellRef.current.getBoundingClientRect();
    const popH = 52; // estimated popover height
    const spaceBelow = window.innerHeight - rect.bottom;
    const above = spaceBelow < popH + 12;

    setPos({
      top: above
        ? rect.top + window.scrollY - popH - 6
        : rect.bottom + window.scrollY + 6,
      left: Math.min(
        rect.left + window.scrollX + rect.width / 2,
        window.innerWidth - 180
      ),
      above,
    });
  }, [cellRef]);

  // Outside click
  useEffect(() => {
    function handler(e) {
      if (popRef.current && !popRef.current.contains(e.target) &&
          cellRef.current && !cellRef.current.contains(e.target)) {
        onClose();
      }
    }
    // Small delay so the opening click doesn't immediately close
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 80);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [onClose, cellRef]);

  // Keyboard dismiss
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      ref={popRef}
      className={`status-popover${pos.above ? ' pop-above' : ''}`}
      style={{ top: pos.top, left: pos.left }}
      role="menu"
    >
      <div className="pop-arrow" />
      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
        <button
          key={key}
          className={`pop-option ${cfg.cls}${current === key ? ' is-current' : ''}`}
          onClick={() => { onSelect(key); onClose(); }}
          role="menuitem"
        >
          <span className="pop-code">{cfg.code}</span>
          <span className="pop-label">{cfg.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ── Attendance Cell (single sesi) ───────────────────────── */
function AttendanceCell({ siswa, sesi, record, canEdit, onUpdate }) {
  const [open, setOpen] = useState(false);
  const cellRef = useRef(null);
  const status = record?.status || 'alpha';
  const cfg    = STATUS_CONFIG[status] || STATUS_CONFIG.alpha;
  const hasNote = !!record?.catatan;

  function handleSelect(newStatus) {
    onUpdate(siswa, sesi, record, newStatus);
  }

  return (
    <td className="td-center atn-cell" ref={cellRef}>
      <button
        className={`sp-pill ${cfg.cls}${canEdit ? ' sp-interactive' : ''}`}
        onClick={canEdit ? () => setOpen(v => !v) : undefined}
        disabled={!canEdit}
        title={canEdit ? `${cfg.label} — klik untuk ubah` : cfg.label}
        aria-haspopup={canEdit ? 'menu' : undefined}
        aria-expanded={open}
      >
        {cfg.code}
        {hasNote && <span className="sp-note-dot" aria-hidden="true" />}
      </button>

      {open && canEdit && (
        <StatusPopover
          cellRef={cellRef}
          current={status}
          onSelect={handleSelect}
          onClose={() => setOpen(false)}
        />
      )}
    </td>
  );
}

/* ── Summary bar ─────────────────────────────────────────── */
function SummaryBar({ summary }) {
  return (
    <div className="summary-bar no-print">
      <div className="summary-total">
        <span className="summary-total-num">{summary.total}</span>
        <span className="summary-total-label">siswa</span>
      </div>
      <div className="summary-sep" />
      {[
        { key: 'H', label: 'Hadir',      cls: 'sp-H' },
        { key: 'I', label: 'Izin',       cls: 'sp-I' },
        { key: 'S', label: 'Sakit',      cls: 'sp-S' },
        { key: 'A', label: 'Alpha',      cls: 'sp-A' },
        { key: 'D', label: 'Disp.',      cls: 'sp-D' },
      ].map(i => (
        <div key={i.key} className="summary-item">
          <span className={`summary-val ${i.cls}`}>{summary[i.key]}</span>
          <span className="summary-lbl">{i.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */
export function RekapHarianPage({ user }) {
  const [tanggal, setTanggal]         = useState(todayStr());
  const [kelasId, setKelasId]         = useState('');
  const [kelasList, setKelasList]     = useState([]);
  const [sesis, setSesis]             = useState([]);
  const [absensiData, setAbsensiData] = useState([]);
  const [search, setSearch]           = useState('');

  const canEdit = ['admin', 'wali_kelas'].includes(user?.role);

  useEffect(() => {
    setKelasList(kelasDB.getAll());
    setSesis(sesiDB.getAll().sort((a, b) => a.urutan - b.urutan));
  }, []);

  useEffect(() => {
    if (kelasList.length > 0 && !kelasId) setKelasId(kelasList[0].id);
  }, [kelasList]);

  useEffect(() => { if (kelasId) loadData(); }, [tanggal, kelasId]);

  function loadData() {
    setAbsensiData(absensiDB.getByTanggalKelas(tanggal, kelasId));
  }

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

  // Inline update — no modal needed
  const handleUpdate = useCallback((siswa, sesi, existing, newStatus) => {
    if (existing) {
      absensiDB.update(existing.id, { status: newStatus, updated_by: user?.id });
    } else {
      absensiDB.create({
        siswa_id: siswa.id,
        sesi_id: sesi.id,
        tanggal,
        status: newStatus,
        catatan: '',
      });
    }
    // Optimistic refresh
    setAbsensiData(absensiDB.getByTanggalKelas(tanggal, kelasId));
  }, [tanggal, kelasId, user]);

  function handleExport() {
    const kelas = kelasDB.getById(kelasId);
    const absensiByDate = {};
    absensiData.forEach(a => {
      absensiByDate[`${a.siswa_id}_${a.sesi_id}_${tanggal}`] = a.status;
    });
    exportRekapHarian({ siswas, absensiByDate, sesis, tanggal, namaKelas: kelas?.nama });
  }

  const hari    = new Date(tanggal + 'T00:00:00');
  const hariStr = `${DAYS_ID[hari.getDay()]}, ${formatTanggal(tanggal + 'T00:00:00')}`;
  const kelas   = kelasDB.getById(kelasId);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header no-print">
        <div className="page-header-left">
          <h1 className="page-title">Rekap Harian</h1>
          <span className="page-subtitle">{hariStr}</span>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-sm no-print" onClick={() => window.print()}>
            <Printer size={13} strokeWidth={1.8} />Cetak
          </button>
          <button className="btn btn-sm btn-primary no-print" onClick={handleExport}>
            <Download size={13} strokeWidth={1.8} />Excel
          </button>
        </div>
      </div>

      <div className="page-content">

        {/* Compact Toolbar */}
        <div className="toolbar no-print">
          <select
            id="rekap-kelas"
            className="field-input"
            value={kelasId}
            onChange={e => setKelasId(e.target.value)}
          >
            {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
          <input
            id="rekap-tanggal"
            type="date"
            className="field-input"
            value={tanggal}
            onChange={e => setTanggal(e.target.value)}
          />
          <div className="toolbar-sep" />
          <input
            id="rekap-search"
            type="text"
            className="field-input"
            placeholder="Cari nama…"
            style={{ width: 150 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Summary */}
        <SummaryBar summary={summary} />

        {/* Table card */}
        <div className="card">
          {/* Card meta row */}
          <div className="rh-table-head">
            <div className="rh-table-head-left">
              <span className="rh-kelas-badge">{kelas?.nama || '—'}</span>
              <span className="rh-row-count">{filtered.length} siswa</span>
              {canEdit && (
                <span className="rh-edit-hint no-print">Ketuk badge untuk ubah status</span>
              )}
            </div>
            {/* Legend */}
            <div className="rh-legend no-print">
              {Object.entries(STATUS_CONFIG).map(([k, cfg]) => (
                <span key={k} className="rh-legend-item">
                  <span className={`sp-pill ${cfg.cls}`}>{cfg.code}</span>
                  <span>{cfg.label}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="table-wrap">
            <table className="data-table rh-table">
              <thead>
                <tr>
                  <th className="th-num">#</th>
                  <th className="th-nis">NIS</th>
                  <th>Nama Siswa</th>
                  {sesis.map(s => (
                    <th key={s.id} className="th-center th-sesi">
                      <div className="sesi-header">
                        <span className="sesi-name">{s.nama}</span>
                        {s.jam_mulai && <span className="sesi-jam">{s.jam_mulai}</span>}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3 + sesis.length}>
                      <div className="empty" style={{ padding: '40px 24px' }}>
                        <div className="empty-title">Tidak ada siswa</div>
                        <div className="empty-desc">Pilih kelas atau ubah pencarian</div>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((sw, idx) => {
                  // Primary status untuk hierarchy hint
                  const firstRec = sesis.map(se => absensiMap[`${sw.id}_${se.id}`]).find(Boolean);
                  const primarySt = firstRec?.status;

                  return (
                    <tr key={sw.id}>
                      <td className="td-num">{idx + 1}</td>
                      <td className="td-nis">{sw.nis}</td>
                      <td>
                        <div className="rh-student">
                          <span className="rh-student-name">{sw.nama}</span>
                          {primarySt && primarySt !== 'hadir' && (
                            <span className="rh-student-note">
                              {STATUS_CONFIG[primarySt]?.label}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Attendance cells — NO separate action column */}
                      {sesis.map(sesi => {
                        const rec = absensiMap[`${sw.id}_${sesi.id}`];
                        return (
                          <AttendanceCell
                            key={sesi.id}
                            siswa={sw}
                            sesi={sesi}
                            record={rec}
                            canEdit={canEdit}
                            onUpdate={handleUpdate}
                          />
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="card-footer">
            <span className="cf-count">{filtered.length}/{siswas.length} siswa</span>
            <span className="cf-date">{hariStr}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
