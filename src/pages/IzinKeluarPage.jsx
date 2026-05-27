// ============================================================
// pages/IzinKeluarPage.jsx — Premium exit monitoring
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { izinDB, siswaDB, kelasDB } from '../lib/localDB';
import { todayStr, formatWaktu } from '../lib/constants';

export function IzinKeluarPage() {
  const [aktif, setAktif]     = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab]         = useState('aktif');
  const [tick, setTick]       = useState(0); // Force re-render for live durations

  const loadData = useCallback(() => {
    const today = todayStr();
    setAktif(izinDB.getAktif().map(i => ({ ...i, siswa: siswaDB.getById(i.siswa_id) })));
    setHistory(izinDB.getByTanggal(today)
      .filter(i => i.status === 'kembali')
      .map(i => ({ ...i, siswa: siswaDB.getById(i.siswa_id) })));
  }, []);

  useEffect(() => {
    loadData();
    const poll     = setInterval(loadData, 10000);
    const liveTick = setInterval(() => setTick(t => t + 1), 30000);
    return () => { clearInterval(poll); clearInterval(liveTick); };
  }, [loadData]);

  function getDurasi(waktu) {
    const min = Math.floor((Date.now() - new Date(waktu).getTime()) / 60000);
    if (min < 60) return `${min} mnt`;
    return `${Math.floor(min / 60)}j ${min % 60}mnt`;
  }

  function getDurasiStatus(waktu) {
    const min = Math.floor((Date.now() - new Date(waktu).getTime()) / 60000);
    if (min >= 30) return 'red';
    if (min >= 15) return 'orange';
    return 'normal';
  }

  function handleKembali(id) {
    izinDB.kembali(id);
    loadData();
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Izin Keluar</h1>
          {aktif.length > 0 && (
            <span className="pill pill-keluar" style={{ fontSize: 12 }}>
              {aktif.length} sedang keluar
            </span>
          )}
        </div>
        <div className="page-header-actions">
          <div className="notice">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
            Polling 10 detik
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Tab bar */}
        <div className="tab-bar">
          <button
            className={`tab-item${tab === 'aktif' ? ' active' : ''}`}
            onClick={() => setTab('aktif')}
          >
            Sedang Keluar
            {aktif.length > 0 && (
              <span style={{
                marginLeft: 6, background: 'var(--orange)', color: '#fff',
                borderRadius: 20, padding: '1px 6px', fontSize: 11, fontWeight: 700,
              }}>{aktif.length}</span>
            )}
          </button>
          <button
            className={`tab-item${tab === 'history' ? ' active' : ''}`}
            onClick={() => setTab('history')}
          >
            Sudah Kembali
            {history.length > 0 && (
              <span style={{
                marginLeft: 6, background: 'var(--green)', color: '#fff',
                borderRadius: 20, padding: '1px 6px', fontSize: 11, fontWeight: 700,
              }}>{history.length}</span>
            )}
          </button>
        </div>

        {/* Sedang Keluar */}
        {tab === 'aktif' && (
          <div className="card">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="td-num">#</th>
                    <th>Nama Siswa</th>
                    <th>Kelas</th>
                    <th>Waktu Keluar</th>
                    <th>Durasi</th>
                    <th style={{ width: 140 }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {aktif.length === 0 ? (
                    <tr><td colSpan={6}>
                      <div className="empty">
                        <div className="empty-icon">✓</div>
                        <div className="empty-title">Semua siswa di kelas</div>
                        <div className="empty-desc">Tidak ada siswa yang sedang keluar</div>
                      </div>
                    </td></tr>
                  ) : aktif.map((item, idx) => {
                    const kelas = kelasDB.getById(item.siswa?.kelas_id);
                    const ds = getDurasiStatus(item.waktu_keluar);
                    return (
                      <tr key={item.id}>
                        <td className="td-num">{idx + 1}</td>
                        <td className="td-name">{item.siswa?.nama || '—'}</td>
                        <td>
                          <span className="chip">{kelas?.nama || '—'}</span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                          {formatWaktu(item.waktu_keluar)}
                        </td>
                        <td>
                          <span style={{
                            fontWeight: 700,
                            fontSize: 13,
                            fontVariantNumeric: 'tabular-nums',
                            color: ds === 'red' ? 'var(--red-dark)'
                                 : ds === 'orange' ? 'var(--orange-dark)'
                                 : 'var(--text-primary)',
                          }}>
                            {getDurasi(item.waktu_keluar)}
                          </span>
                          {ds === 'red' && (
                            <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--red-dark)' }}>⚠</span>
                          )}
                        </td>
                        <td>
                          <button
                            id={`btn-kembali-${item.id}`}
                            className="btn btn-sm btn-primary"
                            onClick={() => handleKembali(item.id)}
                          >
                            ↙ Tandai Kembali
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {aktif.length > 0 && (
              <div className="card-footer">
                <span>{aktif.length} siswa di luar kelas</span>
                <span>Durasi merah = lebih dari 30 menit</span>
              </div>
            )}
          </div>
        )}

        {/* Sudah Kembali */}
        {tab === 'history' && (
          <div className="card">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="td-num">#</th>
                    <th>Nama Siswa</th>
                    <th>Kelas</th>
                    <th>Waktu Keluar</th>
                    <th>Waktu Kembali</th>
                    <th>Total Durasi</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr><td colSpan={6}>
                      <div className="empty">
                        <div className="empty-icon">📋</div>
                        <div className="empty-title">Belum ada riwayat hari ini</div>
                      </div>
                    </td></tr>
                  ) : history.map((item, idx) => {
                    const kelas   = kelasDB.getById(item.siswa?.kelas_id);
                    const durMins = item.waktu_kembali
                      ? Math.floor((new Date(item.waktu_kembali) - new Date(item.waktu_keluar)) / 60000)
                      : null;
                    return (
                      <tr key={item.id}>
                        <td className="td-num">{idx + 1}</td>
                        <td className="td-name">{item.siswa?.nama || '—'}</td>
                        <td><span className="chip">{kelas?.nama || '—'}</span></td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                          {formatWaktu(item.waktu_keluar)}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                          {formatWaktu(item.waktu_kembali)}
                        </td>
                        <td>
                          <span className="pill pill-kembali">
                            {durMins !== null ? `${durMins} mnt` : '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {history.length > 0 && (
              <div className="card-footer">
                <span>{history.length} siswa sudah kembali hari ini</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
