import { useState, useEffect, useCallback } from 'react';
import { izinDB, siswaDB, kelasDB } from '../lib/localDB';
import { todayStr, formatWaktu } from '../lib/constants';
import Header from '../components/ui/Header';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Clock } from 'lucide-react';

export function IzinKeluarPage() {
  const [aktif, setAktif] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('aktif');
  const [tick, setTick] = useState(0);

  const loadData = useCallback(() => {
    const today = todayStr();
    setAktif(izinDB.getAktif().map(i => ({ ...i, siswa: siswaDB.getById(i.siswa_id) })));
    setHistory(izinDB.getByTanggal(today)
      .filter(i => i.status === 'kembali')
      .map(i => ({ ...i, siswa: siswaDB.getById(i.siswa_id) })));
  }, []);

  useEffect(() => {
    loadData();
    const poll = setInterval(loadData, 10000);
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
    if (min >= 30) return 'danger';
    if (min >= 15) return 'warning';
    return 'default';
  }

  function handleKembali(id) {
    izinDB.kembali(id);
    loadData();
  }

  const columnsAktif = [
    { key: 'index', label: '#', width: '50px', render: (_, __, i) => i + 1 },
    { key: 'nama', label: 'Nama Siswa', render: (_, row) => row.siswa?.nama || '—' },
    { key: 'kelas', label: 'Kelas', render: (_, row) => <Badge variant="default">{kelasDB.getById(row.siswa?.kelas_id)?.nama || '—'}</Badge> },
    { key: 'waktu_keluar', label: 'Waktu Keluar', render: (val) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>{formatWaktu(val)}</span> },
    { key: 'durasi', label: 'Durasi', render: (_, row) => {
        const ds = getDurasiStatus(row.waktu_keluar);
        const color = ds === 'danger' ? 'var(--color-danger)' : ds === 'warning' ? 'var(--color-warning)' : 'var(--text-primary)';
        return (
          <span style={{ fontWeight: 'bold', color, fontVariantNumeric: 'tabular-nums' }}>
            {getDurasi(row.waktu_keluar)} {ds === 'danger' && '⚠'}
          </span>
        );
      }
    },
    { key: 'aksi', label: 'Aksi', width: '150px', render: (_, row) => (
        <Button size="sm" onClick={() => handleKembali(row.id)}>↙ Kembali</Button>
      )
    },
  ];

  const columnsHistory = [
    { key: 'index', label: '#', width: '50px', render: (_, __, i) => i + 1 },
    { key: 'nama', label: 'Nama Siswa', render: (_, row) => row.siswa?.nama || '—' },
    { key: 'kelas', label: 'Kelas', render: (_, row) => <Badge variant="default">{kelasDB.getById(row.siswa?.kelas_id)?.nama || '—'}</Badge> },
    { key: 'waktu_keluar', label: 'Waktu Keluar', render: (val) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>{formatWaktu(val)}</span> },
    { key: 'waktu_kembali', label: 'Waktu Kembali', render: (val) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>{formatWaktu(val)}</span> },
    { key: 'total_durasi', label: 'Total Durasi', render: (_, row) => {
        const durMins = row.waktu_kembali ? Math.floor((new Date(row.waktu_kembali) - new Date(row.waktu_keluar)) / 60000) : null;
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
            Live Update
          </div>
        }
      />

      <div className="row-3" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: 8 }}>
        <button
          onClick={() => setTab('aktif')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: tab === 'aktif' ? 'bold' : 'normal',
            color: tab === 'aktif' ? 'var(--color-primary-600)' : 'var(--text-secondary)',
            borderBottom: tab === 'aktif' ? '2px solid var(--color-primary-600)' : 'none',
            paddingBottom: 8, fontSize: 'var(--text-base)', display: 'flex', alignItems: 'center', gap: 8
          }}
        >
          Sedang Keluar
          {aktif.length > 0 && <Badge variant="sakit">{aktif.length}</Badge>}
        </button>
        <button
          onClick={() => setTab('history')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: tab === 'history' ? 'bold' : 'normal',
            color: tab === 'history' ? 'var(--color-primary-600)' : 'var(--text-secondary)',
            borderBottom: tab === 'history' ? '2px solid var(--color-primary-600)' : 'none',
            paddingBottom: 8, fontSize: 'var(--text-base)', marginLeft: 16, display: 'flex', alignItems: 'center', gap: 8
          }}
        >
          Sudah Kembali
          {history.length > 0 && <Badge variant="hadir">{history.length}</Badge>}
        </button>
      </div>

      <Card padding="none">
        {tab === 'aktif' ? (
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
                <span>{history.length} siswa sudah kembali hari ini</span>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
