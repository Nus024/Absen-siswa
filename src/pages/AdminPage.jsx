import { useState, useEffect, useRef } from 'react';
import { siswaDB, kelasDB, sesiDB, usersDB } from '../lib/localDB';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useAuth } from '../hooks/useAuth';
import * as XLSX from 'xlsx';
import { LogOut, Upload, Download, Users, BookOpen, Clock, UserCog, ChevronRight, ArrowLeft, Paintbrush, KeyRound, AlertTriangle } from 'lucide-react';
import Header from '../components/ui/Header';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

export function AdminPage({ user }) {
  const canAdmin = user?.role === 'admin';
  const { logout } = useAuth();
  const [activeView, setActiveView] = useState('menu'); // 'menu', 'kelas', 'siswa', 'sesi', 'user'

  if (activeView !== 'menu') {
    let title = '';
    let content = null;
    if (activeView === 'kelas') { title = 'Data Kelas'; content = <ManageKelas canAdmin={canAdmin} />; }
    else if (activeView === 'siswa') { title = 'Data Siswa'; content = <ManageSiswa canAdmin={canAdmin} />; }
    else if (activeView === 'sesi') { title = 'Sesi Absensi'; content = <ManageSesi canAdmin={canAdmin} />; }
    else if (activeView === 'user') { title = 'Manajemen Akun'; content = <ManageUser canAdmin={canAdmin} />; }

    return (
      <div className="stack-6">
        <Header
          title={title}
          actions={
            <Button size="sm" variant="secondary" icon={<ArrowLeft size={16} />} onClick={() => setActiveView('menu')}>
              Kembali
            </Button>
          }
        />
        {content}
      </div>
    );
  }

  // Render Menu (List-based UI)
  return (
    <div className="stack-6" style={{ maxWidth: 640, margin: '0 auto' }}>
      <Header title="Pengaturan Sistem" subtitle="Kelola data dan konfigurasi aplikasi" />

      {canAdmin && (
        <Card padding="none" style={{ overflow: 'hidden' }}>
          <div className="stack-0">
            <MenuButton icon={<BookOpen size={20} color="var(--color-primary-600)" />} title="Data Kelas" subtitle="Kelola daftar kelas dan rombongan belajar" onClick={() => setActiveView('kelas')} />
            <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0 16px' }} />
            <MenuButton icon={<Users size={20} color="var(--color-success)" />} title="Data Siswa" subtitle="Kelola data siswa dan import/export Excel" onClick={() => setActiveView('siswa')} />
            <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0 16px' }} />
            <MenuButton icon={<Clock size={20} color="var(--color-warning)" />} title="Sesi Absensi" subtitle="Kelola sesi waktu absensi harian" onClick={() => setActiveView('sesi')} />
            <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0 16px' }} />
            <MenuButton icon={<UserCog size={20} color="var(--color-info)" />} title="Manajemen Akun" subtitle="Kelola role admin dan akses pengawas" onClick={() => setActiveView('user')} />
          </div>
        </Card>
      )}

      <Card padding="none" style={{ overflow: 'hidden' }}>
        <div className="stack-0">
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-inset)', borderRadius: 10 }}>
              <Paintbrush size={20} color="var(--color-neutral-600)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Tampilan</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Edu Green Light Theme (Aktif)</div>
            </div>
          </div>
          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0 16px' }} />
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-inset)', borderRadius: 10 }}>
              <KeyRound size={20} color="var(--color-neutral-600)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Informasi Akun</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user.username} ({user.role})</div>
            </div>
          </div>
        </div>
      </Card>

      <Card padding="md" style={{ border: '1px solid #fecaca', background: '#fef2f2' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <AlertTriangle color="var(--color-danger)" size={20} />
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-danger)' }}>Danger Zone</h2>
        </div>
        <p style={{ fontSize: 13, color: '#991b1b', marginBottom: 16 }}>Tindakan ini akan menghapus semua data lokal di perangkat ini (Siswa, Kelas, Absensi, Sesi, Izin).</p>
        <Button variant="danger" fullWidth onClick={() => {
          if (window.confirm('Yakin ingin mereset semua data? Tindakan ini tidak dapat dibatalkan.')) {
            localStorage.clear();
            window.location.reload();
          }
        }}>
          Reset Database
        </Button>
      </Card>
      
      <Button variant="ghost" fullWidth icon={<LogOut size={16} />} onClick={logout} style={{ color: 'var(--color-danger)', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        Keluar dari Akun
      </Button>
    </div>
  );
}

function MenuButton({ icon, title, subtitle, onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', cursor: 'pointer', transition: 'background 0.2s' }} 
      onMouseOver={e => e.currentTarget.style.background = 'var(--color-neutral-50)'}
      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-inset)', borderRadius: 10 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{subtitle}</div>
      </div>
      <div style={{ color: 'var(--text-tertiary)' }}>
        <ChevronRight size={20} />
      </div>
    </div>
  );
}

// ── Siswa ─────────────────────────────────────────────────────
function ManageSiswa({ canAdmin }) {
  const [list, setList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [kelasFilter, setKelasFilter] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ nis: '', nama: '', kelas_id: '' });
  const [err, setErr] = useState('');
  const [confirmData, setConfirmData] = useState(null);
  const fileInputRef = useRef(null);

  function load() { setList(siswaDB.getAll()); setKelasList(kelasDB.getAll()); }
  useEffect(() => { load(); }, []);

  const filtered = list.filter(s => {
    const okKelas = !kelasFilter || s.kelas_id === kelasFilter;
    const okSearch = !search || s.nama.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search);
    return okKelas && okSearch;
  });

  function openNew() {
    setForm({ nis: '', nama: '', kelas_id: kelasFilter || (kelasList[0]?.id || '') });
    setErr(''); setModal('new');
  }

  function openEdit(s) {
    setForm({ nis: s.nis, nama: s.nama, kelas_id: s.kelas_id });
    setErr(''); setModal(s);
  }

  function save() {
    if (!form.nis.trim() || !form.nama.trim() || !form.kelas_id) { setErr('Semua field wajib diisi'); return; }
    if (modal === 'new') {
      if (list.find(s => s.nis === form.nis.trim())) { setErr('NIS sudah terdaftar'); return; }
      siswaDB.create(form);
    } else {
      siswaDB.update(modal.id, form);
    }
    load(); setModal(null);
  }

  function del(s) {
    setConfirmData({
      title: 'Hapus Siswa', message: `Hapus siswa "${s.nama}"?`,
      onConfirm: () => { siswaDB.delete(s.id); load(); setConfirmData(null); }
    });
  }

  function downloadTemplate() {
    const ws = XLSX.utils.json_to_sheet([{ NIS: '1001', Nama: 'Budi Santoso' }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Siswa");
    XLSX.writeFile(wb, "Template_Data_Siswa.xlsx");
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!kelasFilter) { alert('Pilih kelas terlebih dahulu di filter sebelum import data!'); e.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        let importedCount = 0;
        data.forEach(row => {
          const nis = String(row.NIS || row.nis || '').trim();
          const nama = String(row.Nama || row.nama || '').trim();
          if (nis && nama && !list.find(s => s.nis === nis)) {
            siswaDB.create({ nis, nama, kelas_id: kelasFilter });
            importedCount++;
          }
        });
        alert(`Berhasil mengimport ${importedCount} siswa baru ke kelas ini.`);
        load();
      } catch (error) { alert('Gagal membaca file Excel.'); }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  }

  const columns = [
    { key: 'index', label: '#', width: '50px', render: (_, __, i) => i + 1 },
    { key: 'nis', label: 'NIS', width: '100px' },
    { key: 'nama', label: 'Nama Siswa' },
    { key: 'kelas', label: 'Kelas', render: (_, row) => <Badge variant="default">{kelasDB.getById(row.kelas_id)?.nama || '—'}</Badge> },
    { key: 'qr', label: 'QR', render: (_, row) => <Badge variant={row.qr_status === 'active' ? 'hadir' : 'default'}>{row.qr_status === 'active' ? 'Aktif' : 'Nonaktif'}</Badge> },
    ...(canAdmin ? [{
      key: 'aksi', label: 'Aksi', width: '150px', align: 'center', render: (_, row) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => del(row)}>Hapus</Button>
        </div>
      )
    }] : [])
  ];

  return (
    <div className="stack-6">
      <Card padding="sm">
        <div className="row-4" style={{ flexWrap: 'wrap' }}>
          <select className="field-input" style={{ width: 'auto', minWidth: '150px', height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--bg-card)' }} value={kelasFilter} onChange={e => setKelasFilter(e.target.value)}>
            <option value="">Semua Kelas</option>
            {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
          {canAdmin && (
            <>
              <Button size="md" variant="ghost" onClick={downloadTemplate} icon={<Download size={16} />}>Template</Button>
              <input type="file" accept=".xlsx, .xls" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImport} />
              <Button size="md" variant="ghost" onClick={() => fileInputRef.current?.click()} icon={<Upload size={16} />}>Import</Button>
              <Button size="md" variant="primary" onClick={openNew}>+ Tambah Siswa</Button>
            </>
          )}
        </div>
        <div style={{ marginTop: 16 }}>
          <Input placeholder="Cari nama atau NIS…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </Card>
      
      <Table columns={columns} data={filtered} keyExtractor={r => r.id} emptyMessage="Tidak ada data siswa" />
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textAlign: 'right' }}>{filtered.length} dari {list.length} siswa</div>

      {modal && (
        <div className="modal-scrim" onClick={() => setModal(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modal === 'new' ? 'Tambah Siswa Baru' : 'Edit Siswa'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-divider" />
            <div className="modal-body stack-4">
              {err && <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>⚠ {err}</div>}
              <Input label="NIS" value={form.nis} onChange={e => setForm(f => ({ ...f, nis: e.target.value }))} />
              <Input label="Nama Lengkap" value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} />
              <div className="field">
                <label className="field-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold' }}>Kelas</label>
                <select className="field-input" style={{ width: '100%', height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--bg-card)' }} value={form.kelas_id} onChange={e => setForm(f => ({ ...f, kelas_id: e.target.value }))}>
                  {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <Button variant="ghost" onClick={() => setModal(null)}>Batal</Button>
              <Button variant="primary" onClick={save}>{modal === 'new' ? 'Tambah' : 'Simpan'}</Button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog isOpen={!!confirmData} title={confirmData?.title} message={confirmData?.message} onConfirm={confirmData?.onConfirm} onCancel={() => setConfirmData(null)} />
    </div>
  );
}

// ── Kelas ─────────────────────────────────────────────────────
function ManageKelas({ canAdmin }) {
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ nama: '' });
  const [err, setErr] = useState('');
  const [confirmData, setConfirmData] = useState(null);

  function load() { setList(kelasDB.getAll()); }
  useEffect(() => { load(); }, []);

  function save() {
    if (!form.nama.trim()) { setErr('Nama kelas wajib diisi'); return; }
    if (modal === 'new') kelasDB.create(form); else kelasDB.update(modal.id, form);
    load(); setModal(null);
  }

  function del(k) {
    const cnt = siswaDB.getByKelas(k.id).length;
    if (cnt > 0) { alert(`Tidak bisa menghapus kelas yang masih memiliki ${cnt} siswa.`); return; }
    setConfirmData({ title: 'Hapus Kelas', message: `Hapus kelas "${k.nama}"?`, onConfirm: () => { kelasDB.delete(k.id); load(); setConfirmData(null); } });
  }

  const columns = [
    { key: 'index', label: '#', width: '50px', render: (_, __, i) => i + 1 },
    { key: 'nama', label: 'Nama Kelas' },
    { key: 'jumlah', label: 'Jumlah Siswa', render: (_, row) => <Badge variant="default">{siswaDB.getByKelas(row.id).length} siswa</Badge> },
    ...(canAdmin ? [{
      key: 'aksi', label: 'Aksi', width: '150px', align: 'center', render: (_, row) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Button size="sm" variant="secondary" onClick={() => { setForm({ nama: row.nama }); setErr(''); setModal(row); }}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => del(row)}>Hapus</Button>
        </div>
      )
    }] : [])
  ];

  return (
    <div className="stack-6">
      {canAdmin && <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Button variant="primary" onClick={() => { setForm({ nama: '' }); setErr(''); setModal('new'); }}>+ Tambah Kelas</Button></div>}
      <Table columns={columns} data={list} keyExtractor={r => r.id} emptyMessage="Belum ada kelas" />
      
      {modal && (
        <div className="modal-scrim" onClick={() => setModal(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">{modal === 'new' ? 'Tambah Kelas' : 'Edit Kelas'}</h3><button className="modal-close" onClick={() => setModal(null)}>✕</button></div>
            <div className="modal-divider" />
            <div className="modal-body stack-4">
              {err && <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>⚠ {err}</div>}
              <Input label="Nama Kelas" placeholder="Contoh: X IPA 1" value={form.nama} onChange={e => setForm({ nama: e.target.value })} />
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}><Button variant="ghost" onClick={() => setModal(null)}>Batal</Button><Button variant="primary" onClick={save}>{modal === 'new' ? 'Tambah' : 'Simpan'}</Button></div>
          </div>
        </div>
      )}
      <ConfirmDialog isOpen={!!confirmData} title={confirmData?.title} message={confirmData?.message} onConfirm={confirmData?.onConfirm} onCancel={() => setConfirmData(null)} />
    </div>
  );
}

// ── Sesi ──────────────────────────────────────────────────────
function ManageSesi({ canAdmin }) {
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ nama: '', jam_mulai: '07:00', jam_selesai: '08:00', urutan: 1 });
  const [err, setErr] = useState('');

  function load() { setList(sesiDB.getAll().sort((a, b) => a.urutan - b.urutan)); }
  useEffect(() => { load(); }, []);

  function save() {
    if (!form.nama.trim()) { setErr('Nama sesi wajib diisi'); return; }
    if (modal === 'new') sesiDB.create(form); else sesiDB.update(modal.id, form);
    load(); setModal(null);
  }

  const columns = [
    { key: 'urutan', label: 'Urutan', align: 'center', width: '80px', render: (val) => <Badge variant="izin">{val}</Badge> },
    { key: 'nama', label: 'Nama Sesi' },
    { key: 'jam_mulai', label: 'Jam Mulai', render: (val) => <span style={{ fontFamily: 'var(--font-mono)' }}>{val}</span> },
    { key: 'jam_selesai', label: 'Jam Selesai', render: (val) => <span style={{ fontFamily: 'var(--font-mono)' }}>{val}</span> },
    ...(canAdmin ? [{
      key: 'aksi', label: 'Aksi', width: '150px', align: 'center', render: (_, row) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Button size="sm" variant="secondary" onClick={() => { setForm({ nama: row.nama, jam_mulai: row.jam_mulai, jam_selesai: row.jam_selesai, urutan: row.urutan }); setErr(''); setModal(row); }}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => { if(confirm(`Hapus sesi "${row.nama}"?`)) { sesiDB.delete(row.id); load(); } }}>Hapus</Button>
        </div>
      )
    }] : [])
  ];

  return (
    <div className="stack-6">
      {canAdmin && list.length < 5 && <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Button variant="primary" onClick={() => { setForm({ nama: '', jam_mulai: '07:00', jam_selesai: '08:00', urutan: list.length + 1 }); setErr(''); setModal('new'); }}>+ Tambah Sesi</Button></div>}
      <Table columns={columns} data={list} keyExtractor={r => r.id} emptyMessage="Belum ada sesi" />
      
      {modal && (
        <div className="modal-scrim" onClick={() => setModal(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">{modal === 'new' ? 'Tambah Sesi' : 'Edit Sesi'}</h3><button className="modal-close" onClick={() => setModal(null)}>✕</button></div>
            <div className="modal-divider" />
            <div className="modal-body stack-4">
              {err && <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>⚠ {err}</div>}
              <Input label="Nama Sesi" placeholder="Contoh: Masuk Pagi" value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} />
              <div className="grid-2">
                <Input type="time" label="Jam Mulai" value={form.jam_mulai} onChange={e => setForm(f => ({ ...f, jam_mulai: e.target.value }))} />
                <Input type="time" label="Jam Selesai" value={form.jam_selesai} onChange={e => setForm(f => ({ ...f, jam_selesai: e.target.value }))} />
              </div>
              <Input type="number" min={1} max={5} label="Urutan" value={form.urutan} onChange={e => setForm(f => ({ ...f, urutan: Number(e.target.value) }))} hint="Menentukan urutan kolom di tabel rekap" />
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}><Button variant="ghost" onClick={() => setModal(null)}>Batal</Button><Button variant="primary" onClick={save}>{modal === 'new' ? 'Tambah' : 'Simpan'}</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── User / Akun ──────────────────────────────────────────────
function ManageUser({ canAdmin }) {
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ nama: '', username: '', password: '', role: 'pengawas', tingkat_akses: [] });
  const [err, setErr] = useState('');
  
  function load() { setList(usersDB.getAll()); }
  useEffect(() => { load(); }, []);

  function openNew() { setForm({ nama: '', username: '', password: '', role: 'pengawas', tingkat_akses: [] }); setErr(''); setModal('new'); }
  function openEdit(u) { setForm({ nama: u.nama, username: u.username, password: u.password, role: u.role, tingkat_akses: u.tingkat_akses || [] }); setErr(''); setModal(u); }

  function save() {
    if (!form.nama.trim() || !form.username.trim() || !form.password.trim()) { setErr('Nama, Username, dan Password wajib diisi'); return; }
    if (modal === 'new') {
      if (list.find(u => u.username === form.username.trim())) { setErr('Username sudah digunakan'); return; }
      usersDB.create(form);
    } else { usersDB.update(modal.id, form); }
    load(); setModal(null);
  }

  function toggleTingkat(tingkat) {
    setForm(f => {
      const arr = f.tingkat_akses || [];
      if (arr.includes(tingkat)) return { ...f, tingkat_akses: arr.filter(t => t !== tingkat) };
      return { ...f, tingkat_akses: [...arr, tingkat] };
    });
  }

  const columns = [
    { key: 'index', label: '#', width: '50px', render: (_, __, i) => i + 1 },
    { key: 'nama', label: 'Nama' },
    { key: 'username', label: 'Username' },
    { key: 'role', label: 'Role', render: (val) => <Badge variant={val === 'admin' ? 'izin' : 'default'}>{val}</Badge> },
    { key: 'akses', label: 'Akses Kelas', render: (_, row) => row.role === 'pengawas' ? ((row.tingkat_akses && row.tingkat_akses.length > 0) ? row.tingkat_akses.map(t => `Kls ${t}`).join(', ') : 'Semua') : 'Semua' },
    ...(canAdmin ? [{
      key: 'aksi', label: 'Aksi', width: '150px', align: 'center', render: (_, row) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>Edit</Button>
          {row.username !== 'admin' && <Button size="sm" variant="danger" onClick={() => { if(confirm(`Hapus akun "${row.username}"?`)) { usersDB.delete(row.id); load(); } }}>Hapus</Button>}
        </div>
      )
    }] : [])
  ];

  return (
    <div className="stack-6">
      {canAdmin && <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Button variant="primary" onClick={openNew}>+ Tambah Akun</Button></div>}
      <Table columns={columns} data={list} keyExtractor={r => r.id} emptyMessage="Tidak ada data akun" />

      {modal && (
        <div className="modal-scrim" onClick={() => setModal(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">{modal === 'new' ? 'Tambah Akun' : 'Edit Akun'}</h3><button className="modal-close" onClick={() => setModal(null)}>✕</button></div>
            <div className="modal-divider" />
            <div className="modal-body stack-4">
              {err && <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>⚠ {err}</div>}
              <Input label="Nama Lengkap" value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} />
              <div className="grid-2">
                <Input label="Username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} disabled={modal !== 'new' && form.username === 'admin'} />
                <Input label="Password" type="text" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold' }}>Role</label>
                <select className="field-input" style={{ width: '100%', height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--bg-card)' }} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} disabled={modal !== 'new' && form.username === 'admin'}>
                  <option value="pengawas">Pengawas</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {form.role === 'pengawas' && (
                <div style={{ marginTop: 8 }}>
                  <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold' }}>Akses Jenjang Kelas</label>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 8 }}>Pilih "Semua Tingkat" jika diizinkan mengabsen semua kelas.</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-neutral-100)', padding: '6px 12px', borderRadius: 100, fontSize: 13, cursor: 'pointer', fontWeight: form.tingkat_akses?.length === 0 ? '600' : '400' }}>
                      <input type="checkbox" checked={!form.tingkat_akses || form.tingkat_akses.length === 0} onChange={() => setForm({ ...form, tingkat_akses: [] })} /> Semua Tingkat
                    </label>
                    {['X', 'XI', 'XII'].map(t => (
                      <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-neutral-100)', padding: '6px 12px', borderRadius: 100, fontSize: 13, cursor: 'pointer', fontWeight: form.tingkat_akses?.includes(t) ? '600' : '400' }}>
                        <input type="checkbox" checked={form.tingkat_akses?.includes(t) || false} onChange={() => toggleTingkat(t)} /> Kelas {t}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}><Button variant="ghost" onClick={() => setModal(null)}>Batal</Button><Button variant="primary" onClick={save}>{modal === 'new' ? 'Tambah' : 'Simpan'}</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}
