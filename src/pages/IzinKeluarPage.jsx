// ============================================================
// pages/IzinKeluarPage.jsx — Monitoring izin keluar + Realtime
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { izinService }  from '../lib/db/izin';
import { todayStr, formatWaktu } from '../lib/constants';
import { useRealtime }  from '../hooks/useRealtime';
import Header  from '../components/ui/Header';
import Card    from '../components/ui/Card';
import Table   from '../components/ui/Table';
import Button  from '../components/ui/Button';
import Badge   from '../components/ui/Badge';

export function IzinKeluarPage() {
  const [aktif,   setAktif]   = useState([]);
  const [history, setHistory] = useState([]);
  const [tab,     setTab]     = useState('aktif');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const today = todayStr();
      const [aktifData, todayData] = await Promise.all([
        izinService.getAktif(),
        izinService.getByTanggal(today),
      ]);
      setAktif(aktifData);
      setHistory(todayData.filter(i => i.status === 'kembali'));
    } catch (err) {
      console.error('Gagal load izin:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Juga poll setiap 30 detik sebagai fallback
    const poll = setInterval(loadData, 30000);
    return () => clearInterval(poll);
  }, [loadData]);

  // Realtime subscription — reload saat ada perubahan izin_keluar
  useRealtime('izin_keluar', () => loadData());

  function getDurasi(waktu) {
    const min = Math.floor((Date.now() - new Date(waktu).getTime()) / 60000);
    if (min < 60) return `${min} mnt`;
    return `${Math.floor(min / 60)}j ${min % 60}mnt`;
  }

  function getDurasiStatus(waktu) {
    const min = Math.floor((Date.now() - new Date(waktu).getTime()) / 60000);
    if (min >= 30) return 'danger';
    if (min >= 15) return 'warning';
    return 'default';
  }

  async function handleKembali(id) {
    try {
      await izinService.kembali(id);
      await loadData();
    } catch (err) {
      alert('Gagal memperbarui: ' + (err?.message || 'Error'));
    }
  }

  const columnsAktif = [
    { key: 'index',       label: '#',           width: '50px', render: (_, __, i) => i + 1 },
    { key: 'nama',        label: 'Nama Siswa',  render: (_, row) => row.siswa?.nama || '—' },
    { key: 'kelas',       label: 'Kelas',       render: (_, row) => <Badge variant="default">{row.siswa?.kelas?.nama || row.siswa?.kelas_id || '—'}</Badge> },
    { key: 'waktu_keluar', label: 'Waktu Keluar', render: (val) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>{formatWaktu(val)}</span> },
    { key: 'durasi',      label: 'Durasi',      render: (_, row) => {
        const ds    = getDurasiStatus(row.waktu_keluar);
        const color = ds === 'danger' ? 'var(--color-danger)' : ds === 'warning' ? 'var(--color-warning)' : 'var(--text-primary)';
        return <span style={{ fontWeight: 'bold', color, fontVariantNumeric: 'tabular-nums' }}>{getDurasi(row.waktu_keluar)} {ds === 'danger' && '⚠'}</span>;
      }
    },
    { key: 'aksi', label: 'Aksi', width: '150px', render: (_, row) => (
        <Button size="sm" onClick={() => handleKembali(row.id)}>↙ Kembali</Button>
      )
    },
  ];

  const columnsHistory = [
    { key: 'index',        label: '#',             width: '50px', render: (_, __, i) => i + 1 },
    { key: 'nama',         label: 'Nama Siswa',    render: (_, row) => row.siswa?.nama || '—' },
    { key: 'kelas',        label: 'Kelas',         render: (_, row) => <Badge variant="default">{row.siswa?.kelas?.nama || '—'}</Badge> },
    { key: 'waktu_keluar', label: 'Waktu Keluar',  render: (val) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>{formatWaktu(val)}</span> },
    { key: 'waktu_kembali', label: 'Waktu Kembali', render: (val) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>{formatWaktu(val)}</span> },
    { key: 'total_durasi', label: 'Total Durasi',  render: (_, row) => {
        const durMins = row.waktu_kembali
          ? Math.floor((new Date(row.waktu_kembali) - new Date(row.waktu_keluar)) / 60000)
          : null;
        return <Badge variant="hadir">{durMins !== null ? `${durMins} mnt` : '—'}</Badge>;
      }
    },
  ];

  return (
    <div className="stack-6">
      <Header
        title="Izin Keluar"
        subtitle="Monitoring siswa keluar kelas"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }} />
            Realtime
          </div>
        }
      />

      <div className="row-3" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: 8 }}>
        {[
          { id: 'aktif',   label: 'Sedang Keluar',  count: aktif.length,   variant: 'sakit' },
          { id: 'history', label: 'Sudah Kembali',  count: history.length, variant: 'hadir' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: tab === t.id ? 'bold' : 'normal',
              color: tab === t.id ? 'var(--color-primary-600)' : 'var(--text-secondary)',
              borderBottom: tab === t.id ? '2px solid var(--color-primary-600)' : 'none',
              paddingBottom: 8, fontSize: 'var(--text-base)',
              display: 'flex', alignItems: 'center', gap: 8,
              marginRight: 16,
            }}
          >
            {t.label}
            {t.count > 0 && <Badge variant={t.variant}>{t.count}</Badge>}
          </button>
        ))}
      </div>

      <Card padding="none">
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
            <span className="spinner" /> Memuat data…
          </div>
        ) : tab === 'aktif' ? (
          <>
            <Table columns={columnsAktif} data={aktif} keyExtractor={r => r.id} emptyMessage="Tidak ada siswa yang sedang keluar" />
            {aktif.length > 0 && (
              <div style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between' }}>
                <span>{aktif.length} siswa di luar kelas</span>
                <span>Durasi merah = lebih dari 30 menit</span>
              </div>
            )}
          </>
        ) : (
          <>
            <Table columns={columnsHistory} data={history} keyExtractor={r => r.id} emptyMessage="Belum ada riwayat hari ini" />
            {history.length > 0 && (
              <div style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', borderTop: '1px solid var(--border-default)' }}>
                {history.length} siswa sudah kembali hari ini
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
