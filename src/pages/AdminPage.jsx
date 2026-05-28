import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { siswaDB, kelasDB, sesiDB, usersDB } from '../lib/localDB';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useAuth } from '../hooks/useAuth';
import * as XLSX from 'xlsx';
import { LogOut, Upload, Download, Users, BookOpen, Clock, UserCog, ChevronRight, ArrowLeft, Paintbrush, KeyRound, AlertTriangle, QrCode, Pencil, Trash2, Settings } from 'lucide-react';
import Header from '../components/ui/Header';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

// ── Modal QR (komponen terpisah agar canvas selalu ada di DOM) ──
function QRModal({ siswa, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    // Payload deterministik: NIS::NAMA — tidak berubah selama NIS & NAMA sama
    const payload = `${siswa.nis}::${siswa.nama}`;
    QRCode.toCanvas(canvasRef.current, payload, {
      width: 280,
      margin: 2,
      color: { dark: '#1a2e1a', light: '#ffffff' },
    }).catch(console.error);
  }, [siswa]);

  function downloadQR() {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeName = siswa.nama.replace(/[^a-zA-Z0-9\u00C0-\u00FF ]/g, '').trim().replace(/\s+/g, '_');
      a.href = url;
      a.download = `QR_${safeName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  const kelasNama = kelasDB.getById(siswa.kelas_id)?.nama || '—';

  return createPortal(
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 380, textAlign: 'center' }}>
        <div className="modal-header">
          <h3 className="modal-title">QR Code Siswa</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-divider" />
        <div className="modal-body stack-4" style={{ alignItems: 'center', paddingTop: 24 }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            display: 'inline-block',
          }}>
            <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 8 }} />
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{siswa.nama}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              NIS: {siswa.nis}&nbsp;|&nbsp;{kelasNama}
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Scan QR ini untuk absensi otomatis
          </div>
        </div>
        <div className="modal-footer" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button variant="ghost" onClick={onClose}>Tutup</Button>
          <Button variant="primary" icon={<Download size={16} />} onClick={downloadQR}>
            Unduh PNG
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── ModalPortal: render modal ke document.body ─────────────────
function ModalPortal({ children }) {
  return createPortal(children, document.body);
}

// ── AdminPage ──────────────────────────────────────────────────
export function AdminPage({ user }) {
  const canAdmin = user?.role === 'admin';
  const { logout } = useAuth();
  const [activeView, setActiveView] = useState('menu');
  const [confirmData, setConfirmData] = useState(null);

  const [schoolName, setSchoolName] = useState(() => localStorage.getItem('school_name') || 'Absensi QR');
  const [schoolLogo, setSchoolLogo] = useState(() => localStorage.getItem('school_logo') || '');

  function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      alert('Ukuran berkas logo maksimal 1MB!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target.result;
      setSchoolLogo(base64);
      localStorage.setItem('school_logo', base64);
      window.dispatchEvent(new Event('app_settings_changed'));
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveLogo() {
    setSchoolLogo('');
    localStorage.removeItem('school_logo');
    window.dispatchEvent(new Event('app_settings_changed'));
  }

  function handleNameChange(val) {
    setSchoolName(val);
    localStorage.setItem('school_name', val);
    window.dispatchEvent(new Event('app_settings_changed'));
  }

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

      {canAdmin && (
        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-inset)', borderRadius: 10, flexShrink: 0 }}>
              <Settings size={20} color="var(--color-primary-600)" />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Identitas Sekolah & Aplikasi</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Kustomisasi nama dan logo sekolah pada sistem</p>
            </div>
          </div>
          
          <div className="stack-4">
            <Input
              label="Nama Sekolah / Aplikasi"
              value={schoolName}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="Contoh: Absensi QR"
            />
            
            <div className="field">
              <label className="field-label">Logo Sekolah</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  border: '1.5px solid var(--border-default)',
                  background: 'var(--bg-inset)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  {schoolLogo ? (
                    <img src={schoolLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 20, fontWeight: 'bold', color: 'var(--text-muted)' }}>
                      {schoolName ? schoolName.charAt(0).toUpperCase() : 'A'}
                    </span>
                  )}
                </div>
                <div className="stack-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="school-logo-input"
                    style={{ display: 'none' }}
                    onChange={handleLogoChange}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="sm" variant="secondary" onClick={() => document.getElementById('school-logo-input')?.click()}>
                      Unggah Logo
                    </Button>
                    {schoolLogo && (
                      <Button size="sm" variant="ghost" style={{ color: 'var(--color-danger)', borderColor: '#fecaca' }} onClick={handleRemoveLogo}>
                        Hapus
                      </Button>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Format JPG/PNG, maks. 1MB.</div>
                </div>
              </div>
            </div>
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
          setConfirmData({
            title: 'Reset Database',
            message: 'Yakin ingin mereset semua data? Tindakan ini akan menghapus semua data lokal di perangkat ini (Siswa, Kelas, Absensi, Sesi, Izin) dan tidak dapat dibatalkan.',
            onConfirm: () => {
              localStorage.clear();
              window.location.reload();
            }
          });
        }}>
          Reset Database
        </Button>
      </Card>

      <Button variant="ghost" fullWidth icon={<LogOut size={16} />} onClick={logout} style={{ color: 'var(--color-danger)', background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        Keluar dari Akun
      </Button>
      <ConfirmDialog
        isOpen={!!confirmData}
        title={confirmData?.title}
        message={confirmData?.message}
        onConfirm={confirmData?.onConfirm}
        onCancel={() => setConfirmData(null)}
      />
    </div>
  );
}

function MenuButton({ icon, title, subtitle, onClick }) {
  return (
    <div onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', cursor: 'pointer', transition: 'background 0.2s' }}
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

// ── Siswa ──────────────────────────────────────────────────────
function ManageSiswa({ canAdmin }) {
  const [list, setList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [kelasFilter, setKelasFilter] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);       // null | 'new' | siswaObj
  const [form, setForm] = useState({ nis: '', nama: '', kelas_id: '' });
  const [err, setErr] = useState('');
  const [confirmData, setConfirmData] = useState(null);
  const [qrSiswa, setQrSiswa] = useState(null);  // null | siswaObj
  const [bulkLoading, setBulkLoading] = useState(false);
  const fileInputRef = useRef(null);

  function load() {
    setList(siswaDB.getAll());
    setKelasList(kelasDB.getAll());
  }
  useEffect(() => { load(); }, []);

  const filtered = list.filter(s => {
    const okKelas = !kelasFilter || s.kelas_id === kelasFilter;
    const okSearch = !search || s.nama.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search);
    return okKelas && okSearch;
  });

  function openNew() {
    setForm({ nis: '', nama: '', kelas_id: kelasFilter || (kelasList[0]?.id || '') });
    setErr('');
    setModal('new');
  }

  function openEdit(s) {
    setForm({ nis: s.nis, nama: s.nama, kelas_id: s.kelas_id });
    setErr('');
    setModal(s);
  }

  function save() {
    if (!form.nis.trim() || !form.nama.trim() || !form.kelas_id) { setErr('Semua field wajib diisi'); return; }
    if (modal === 'new') {
      if (list.find(s => s.nis === form.nis.trim())) { setErr('NIS sudah terdaftar'); return; }
      siswaDB.create(form);
    } else {
      siswaDB.update(modal.id, form);
    }
    load();
    setModal(null);
  }

  function del(s) {
    setConfirmData({
      title: 'Hapus Siswa',
      message: `Hapus siswa "${s.nama}"?`,
      onConfirm: () => { siswaDB.delete(s.id); load(); setConfirmData(null); },
    });
  }

  function downloadTemplate() {
    const ws = XLSX.utils.json_to_sheet([{ NIS: '1001', Nama: 'Budi Santoso' }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Siswa');
    XLSX.writeFile(wb, 'Template_Data_Siswa.xlsx');
  }

  async function downloadSemuaQR() {
    if (filtered.length === 0) { alert('Tidak ada siswa untuk di-generate QR.'); return; }
    setBulkLoading(true);
    try {
      const zip = new JSZip();

      // Generate semua QR sebagai PNG blob secara paralel
      await Promise.all(
        filtered.map(async (siswa) => {
          // Payload sama dengan single generate: NIS::NAMA
          const dataURL = await QRCode.toDataURL(`${siswa.nis}::${siswa.nama}`, {
            width: 300,
            margin: 2,
            color: { dark: '#1a2e1a', light: '#ffffff' },
          });
          // dataURL → base64 → tambah ke ZIP
          const base64 = dataURL.split(',')[1];
          const safeName = siswa.nama.replace(/[^a-zA-Z0-9\u00C0-\u00FF ]/g, '').trim().replace(/\s+/g, '_');
          zip.file(`QR_${safeName}.png`, base64, { base64: true });
        })
      );

      // Generate ZIP dan download
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const label = kelasFilter
        ? (kelasDB.getById(kelasFilter)?.nama || 'Kelas').replace(/\s+/g, '_')
        : 'Semua_Kelas';
      a.href = url;
      a.download = `QR_Siswa_${label}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Gagal generate QR massal.');
    } finally {
      setBulkLoading(false);
    }
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
      } catch { alert('Gagal membaca file Excel.'); }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  }

  const columns = [
    { key: 'no',    label: '#',          width: '50px',  render: (_, __, i) => i + 1 },
    { key: 'nis',   label: 'NIS',        width: '110px' },
    { key: 'nama',  label: 'Nama Siswa' },
    { key: 'kelas', label: 'Kelas',      render: (_, row) => <Badge variant="default">{kelasDB.getById(row.kelas_id)?.nama || '—'}</Badge> },
    {
      key: 'qr', label: 'QR Code', width: '120px', align: 'center',
      render: (_, row) => (
        <Button size="sm" variant="secondary"
          style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
          onClick={() => setQrSiswa(row)}
        >
          <QrCode size={14} /> Generate
        </Button>
      ),
    },
    ...(canAdmin ? [{
      key: 'aksi', label: 'Aksi', width: '100px', align: 'center',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          <Button size="sm" variant="secondary" icon={<Pencil size={14} />} onClick={() => openEdit(row)} title="Edit Siswa" />
          <Button size="sm" variant="danger"    icon={<Trash2 size={14} />} onClick={() => del(row)} title="Hapus Siswa" />
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="stack-6">
      <Card padding="sm">
        <div className="row-4" style={{ flexWrap: 'wrap' }}>
          <select
            className="field-input"
            style={{ width: 'auto', minWidth: 150, height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--bg-card)' }}
            value={kelasFilter}
            onChange={e => setKelasFilter(e.target.value)}
          >
            <option value="">Semua Kelas</option>
            {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>

          <Button
            size="md" variant="ghost"
            icon={<QrCode size={16} />}
            loading={bulkLoading}
            onClick={downloadSemuaQR}
            disabled={filtered.length === 0 || bulkLoading}
            title={`Download ${filtered.length} QR siswa sebagai ZIP`}
          >
            {bulkLoading ? `Generating ${filtered.length} QR…` : `Download QR (${filtered.length}) .zip`}
          </Button>

          {canAdmin && (
            <>
              <Button size="md" variant="ghost" onClick={downloadTemplate} icon={<Download size={16} />}>Template</Button>
              <input type="file" accept=".xlsx,.xls" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImport} />
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
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textAlign: 'right' }}>
        {filtered.length} dari {list.length} siswa
      </div>

      {/* Modal Tambah / Edit Siswa */}
      {modal && (
        <ModalPortal>
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
                  <label className="field-label">Kelas</label>
                  <select
                    className="field-input"
                    value={form.kelas_id}
                    onChange={e => setForm(f => ({ ...f, kelas_id: e.target.value }))}
                  >
                    {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setModal(null)}>Batal</Button>
                <Button variant="primary" onClick={save}>{modal === 'new' ? 'Tambah' : 'Simpan'}</Button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      <ConfirmDialog
        isOpen={!!confirmData}
        title={confirmData?.title}
        message={confirmData?.message}
        onConfirm={confirmData?.onConfirm}
        onCancel={() => setConfirmData(null)}
      />

      {/* QR Modal — komponen terpisah agar canvas selalu di DOM */}
      {qrSiswa && <QRModal siswa={qrSiswa} onClose={() => setQrSiswa(null)} />}
    </div>
  );
}

// ── Kelas ──────────────────────────────────────────────────────
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
    if (cnt > 0) {
      setConfirmData({
        title: 'Tidak Bisa Menghapus',
        message: `Tidak bisa menghapus kelas yang masih memiliki ${cnt} siswa.`,
        isAlertOnly: true,
      });
      return;
    }
    setConfirmData({ title: 'Hapus Kelas', message: `Hapus kelas "${k.nama}"?`, onConfirm: () => { kelasDB.delete(k.id); load(); setConfirmData(null); } });
  }

  const columns = [
    { key: 'no',     label: '#',            width: '50px',  render: (_, __, i) => i + 1 },
    { key: 'nama',   label: 'Nama Kelas' },
    { key: 'jumlah', label: 'Jumlah Siswa',                 render: (_, row) => <Badge variant="default">{siswaDB.getByKelas(row.id).length} siswa</Badge> },
    ...(canAdmin ? [{
      key: 'aksi', label: 'Aksi', width: '100px', align: 'center',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          <Button size="sm" variant="secondary" icon={<Pencil size={14} />} onClick={() => { setForm({ nama: row.nama }); setErr(''); setModal(row); }} title="Edit Kelas" />
          <Button size="sm" variant="danger"    icon={<Trash2 size={14} />} onClick={() => del(row)} title="Hapus Kelas" />
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="stack-6">
      {canAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={() => { setForm({ nama: '' }); setErr(''); setModal('new'); }}>+ Tambah Kelas</Button>
        </div>
      )}
      <Table columns={columns} data={list} keyExtractor={r => r.id} emptyMessage="Belum ada kelas" />

      {modal && (
        <ModalPortal>
          <div className="modal-scrim" onClick={() => setModal(null)}>
            <div className="modal-panel" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">{modal === 'new' ? 'Tambah Kelas' : 'Edit Kelas'}</h3>
                <button className="modal-close" onClick={() => setModal(null)}>✕</button>
              </div>
              <div className="modal-divider" />
              <div className="modal-body stack-4">
                {err && <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>⚠ {err}</div>}
                <Input label="Nama Kelas" placeholder="Contoh: X IPA 1" value={form.nama} onChange={e => setForm({ nama: e.target.value })} />
              </div>
              <div className="modal-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setModal(null)}>Batal</Button>
                <Button variant="primary" onClick={save}>{modal === 'new' ? 'Tambah' : 'Simpan'}</Button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
      <ConfirmDialog isOpen={!!confirmData} title={confirmData?.title} message={confirmData?.message} onConfirm={confirmData?.onConfirm} onCancel={() => setConfirmData(null)} isAlertOnly={confirmData?.isAlertOnly} />
    </div>
  );
}

// ── Sesi ───────────────────────────────────────────────────────
function ManageSesi({ canAdmin }) {
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ nama: '', jam_mulai: '07:00', jam_selesai: '08:00', urutan: 1 });
  const [err, setErr] = useState('');
  const [confirmData, setConfirmData] = useState(null);

  function delSesi(s) {
    setConfirmData({
      title: 'Hapus Sesi',
      message: `Hapus sesi "${s.nama}"? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: () => { sesiDB.delete(s.id); load(); setConfirmData(null); },
    });
  }

  function load() { setList(sesiDB.getAll()); }
  useEffect(() => { load(); }, []);

  function save() {
    if (!form.nama.trim()) { setErr('Nama sesi wajib diisi'); return; }
    if (modal === 'new') sesiDB.create(form); else sesiDB.update(modal.id, form);
    load(); setModal(null);
  }

  const columns = [
    { key: 'urutan',      label: 'Urutan',     align: 'center', width: '80px',  render: (val) => <Badge variant="izin">{val}</Badge> },
    { key: 'nama',        label: 'Nama Sesi' },
    { key: 'jam_mulai',   label: 'Jam Mulai',                                    render: (val) => <span style={{ fontFamily: 'var(--font-mono)' }}>{val}</span> },
    { key: 'jam_selesai', label: 'Jam Selesai',                                  render: (val) => <span style={{ fontFamily: 'var(--font-mono)' }}>{val}</span> },
    ...(canAdmin ? [{
      key: 'aksi', label: 'Aksi', width: '100px', align: 'center',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          <Button size="sm" variant="secondary" icon={<Pencil size={14} />} onClick={() => { setForm({ nama: row.nama, jam_mulai: row.jam_mulai, jam_selesai: row.jam_selesai, urutan: row.urutan }); setErr(''); setModal(row); }} title="Edit Sesi" />
          <Button size="sm" variant="danger"    icon={<Trash2 size={14} />} onClick={() => delSesi(row)} title="Hapus Sesi" />
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="stack-6">
      {canAdmin && list.length < 5 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={() => { setForm({ nama: '', jam_mulai: '07:00', jam_selesai: '08:00', urutan: list.length + 1 }); setErr(''); setModal('new'); }}>
            + Tambah Sesi
          </Button>
        </div>
      )}
      <Table columns={columns} data={list} keyExtractor={r => r.id} emptyMessage="Belum ada sesi" />

      {modal && (
        <ModalPortal>
          <div className="modal-scrim" onClick={() => setModal(null)}>
            <div className="modal-panel" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">{modal === 'new' ? 'Tambah Sesi' : 'Edit Sesi'}</h3>
                <button className="modal-close" onClick={() => setModal(null)}>✕</button>
              </div>
              <div className="modal-divider" />
              <div className="modal-body stack-4">
                {err && <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>⚠ {err}</div>}
                <Input label="Nama Sesi" placeholder="Contoh: Masuk Pagi" value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} />
                <div className="grid-2">
                  <Input type="time" label="Jam Mulai"   value={form.jam_mulai}   onChange={e => setForm(f => ({ ...f, jam_mulai: e.target.value }))} />
                  <Input type="time" label="Jam Selesai" value={form.jam_selesai} onChange={e => setForm(f => ({ ...f, jam_selesai: e.target.value }))} />
                </div>
                <Input type="number" min={1} max={5} label="Urutan" value={form.urutan} onChange={e => setForm(f => ({ ...f, urutan: Number(e.target.value) }))} hint="Menentukan urutan kolom di tabel rekap" />
              </div>
              <div className="modal-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setModal(null)}>Batal</Button>
                <Button variant="primary" onClick={save}>{modal === 'new' ? 'Tambah' : 'Simpan'}</Button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
      <ConfirmDialog isOpen={!!confirmData} title={confirmData?.title} message={confirmData?.message} onConfirm={confirmData?.onConfirm} onCancel={() => setConfirmData(null)} isAlertOnly={confirmData?.isAlertOnly} />
    </div>
  );
}

// ── User / Akun ────────────────────────────────────────────────
function ManageUser({ canAdmin }) {
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(null);       // null | 'new' | userObj
  const [pwModal, setPwModal] = useState(null);   // null | userObj  → ganti password
  const [form, setForm] = useState({ nama: '', username: '', password: '', role: 'pengawas', tingkat_akses: [] });
  const [pwForm, setPwForm] = useState({ password: '', confirm: '' });
  const [err, setErr] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [showPw, setShowPw] = useState(false);        // toggle di form tambah/edit
  const [showNewPw, setShowNewPw] = useState(false);  // toggle di modal ganti pw
  const [showCfPw, setShowCfPw] = useState(false);    // toggle confirm pw
  const [confirmData, setConfirmData] = useState(null);

  function load() { setList(usersDB.getAll()); }
  useEffect(() => { load(); }, []);

  function openNew() {
    setForm({ nama: '', username: '', password: '', role: 'pengawas', tingkat_akses: [] });
    setErr(''); setShowPw(false); setModal('new');
  }
  function openEdit(u) {
    setForm({ nama: u.nama, username: u.username, password: u.password, role: u.role, tingkat_akses: u.tingkat_akses || [] });
    setErr(''); setShowPw(false); setModal(u);
  }
  function openPwModal(u) {
    setPwForm({ password: '', confirm: '' });
    setPwErr(''); setShowNewPw(false); setShowCfPw(false);
    setPwModal(u);
  }

  function save() {
    if (!form.nama.trim() || !form.username.trim() || !form.password.trim()) { setErr('Nama, Username, dan Password wajib diisi'); return; }
    if (modal === 'new') {
      if (list.find(u => u.username === form.username.trim())) { setErr('Username sudah digunakan'); return; }
      usersDB.create(form);
    } else {
      usersDB.update(modal.id, form);
    }
    load(); setModal(null);
  }

  function savePassword() {
    if (!pwForm.password.trim()) { setPwErr('Password baru tidak boleh kosong'); return; }
    if (pwForm.password !== pwForm.confirm) { setPwErr('Konfirmasi password tidak cocok'); return; }
    usersDB.update(pwModal.id, { password: pwForm.password });
    load(); setPwModal(null);
  }

  function delUser(u) {
    setConfirmData({
      title: 'Hapus Akun',
      message: `Hapus akun "${u.username}"? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: () => { usersDB.delete(u.id); load(); setConfirmData(null); },
    });
  }

  function toggleTingkat(tingkat) {
    setForm(f => {
      const arr = f.tingkat_akses || [];
      if (arr.includes(tingkat)) return { ...f, tingkat_akses: arr.filter(t => t !== tingkat) };
      return { ...f, tingkat_akses: [...arr, tingkat] };
    });
  }

  // Helper toggle-eye inline
  const EyeBtn = ({ show, onToggle }) => (
    <button type="button" onClick={onToggle} style={{
      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
      display: 'flex', alignItems: 'center', padding: 2, lineHeight: 1,
    }}>
      {show
        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      }
    </button>
  );

  const columns = [
    { key: 'no',       label: '#',     width: '50px', render: (_, __, i) => i + 1 },
    { key: 'nama',     label: 'Nama' },
    { key: 'username', label: 'Username' },
    { key: 'role',     label: 'Role',        render: (val) => <Badge variant={val === 'admin' ? 'izin' : 'default'}>{val}</Badge> },
    { key: 'akses',   label: 'Akses Kelas', render: (_, row) =>
      row.role === 'pengawas'
        ? ((row.tingkat_akses && row.tingkat_akses.length > 0)
            ? row.tingkat_akses.map(t => `Kls ${t}`).join(', ')
            : 'Semua')
        : 'Semua'
    },
    ...(canAdmin ? [{
      key: 'aksi', label: 'Aksi', width: '130px', align: 'center',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'nowrap' }}>
          <Button
            size="sm"
            variant="secondary"
            icon={<Pencil size={14} />}
            onClick={() => openEdit(row)}
            title="Edit Akun"
          />
          <Button
            size="sm"
            variant="ghost"
            icon={<KeyRound size={14} />}
            onClick={() => openPwModal(row)}
            style={{ border: '1px solid var(--border-default)' }}
            title="Ganti Password"
          />
          {row.username !== 'admin' && (
            <Button
              size="sm"
              variant="danger"
              icon={<Trash2 size={14} />}
              onClick={() => delUser(row)}
              title="Hapus Akun"
            />
          )}
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="stack-6">
      {canAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={openNew}>+ Tambah Akun</Button>
        </div>
      )}
      <Table columns={columns} data={list} keyExtractor={r => r.id} emptyMessage="Tidak ada data akun" />

      {/* ── Modal Tambah / Edit Akun ── */}
      {modal && (
        <ModalPortal>
          <div className="modal-scrim" onClick={() => setModal(null)}>
            <div className="modal-panel" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">{modal === 'new' ? 'Tambah Akun' : 'Edit Akun'}</h3>
                <button className="modal-close" onClick={() => setModal(null)}>✕</button>
              </div>
              <div className="modal-divider" />
              <div className="modal-body stack-4">
                {err && <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>⚠ {err}</div>}
                <Input label="Nama Lengkap" value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} />
                <Input
                  label="Username"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  disabled={modal !== 'new' && form.username === 'admin'}
                />
                {/* Password dengan show/hide */}
                <div className="field">
                  <label className="field-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="field-input"
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      style={{ paddingRight: 38 }}
                    />
                    <EyeBtn show={showPw} onToggle={() => setShowPw(v => !v)} />
                  </div>
                </div>
                {/* Role */}
                <div className="field">
                  <label className="field-label">Role</label>
                  <select
                    className="field-input"
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    disabled={modal !== 'new' && form.username === 'admin'}
                  >
                    <option value="pengawas">Pengawas</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {/* Akses jenjang (hanya untuk pengawas) */}
                {form.role === 'pengawas' && (
                  <div>
                    <label className="field-label" style={{ marginBottom: 6, display: 'block' }}>Akses Jenjang Kelas</label>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 8 }}>
                      Pilih "Semua Tingkat" jika diizinkan mengabsen semua kelas.
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-neutral-100)', padding: '6px 12px', borderRadius: 100, fontSize: 13, cursor: 'pointer', fontWeight: (!form.tingkat_akses || form.tingkat_akses.length === 0) ? '600' : '400' }}>
                        <input type="checkbox" checked={!form.tingkat_akses || form.tingkat_akses.length === 0} onChange={() => setForm(f => ({ ...f, tingkat_akses: [] }))} /> Semua Tingkat
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
              <div className="modal-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setModal(null)}>Batal</Button>
                <Button variant="primary" onClick={save}>{modal === 'new' ? 'Tambah' : 'Simpan'}</Button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ── Modal Ganti Password ── */}
      {pwModal && (
        <ModalPortal>
          <div className="modal-scrim" onClick={() => setPwModal(null)}>
            <div className="modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <KeyRound size={17} color="var(--color-primary-600)" />
                  </div>
                  <div>
                    <h3 className="modal-title" style={{ fontSize: 16 }}>Ganti Password</h3>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>{pwModal.username}</div>
                  </div>
                </div>
                <button className="modal-close" onClick={() => setPwModal(null)}>✕</button>
              </div>
              <div className="modal-divider" />
              <div className="modal-body stack-4">
                {pwErr && <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>⚠ {pwErr}</div>}
                {/* Password baru */}
                <div className="field">
                  <label className="field-label">Password Baru</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="field-input"
                      type={showNewPw ? 'text' : 'password'}
                      placeholder="Masukkan password baru"
                      value={pwForm.password}
                      onChange={e => setPwForm(f => ({ ...f, password: e.target.value }))}
                      style={{ paddingRight: 38 }}
                      autoFocus
                    />
                    <EyeBtn show={showNewPw} onToggle={() => setShowNewPw(v => !v)} />
                  </div>
                </div>
                {/* Konfirmasi password */}
                <div className="field">
                  <label className="field-label">Konfirmasi Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="field-input"
                      type={showCfPw ? 'text' : 'password'}
                      placeholder="Ulangi password baru"
                      value={pwForm.confirm}
                      onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                      style={{ paddingRight: 38 }}
                    />
                    <EyeBtn show={showCfPw} onToggle={() => setShowCfPw(v => !v)} />
                  </div>
                  {/* Match indicator */}
                  {pwForm.confirm && (
                    <div style={{ fontSize: 12, marginTop: 4, color: pwForm.password === pwForm.confirm ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {pwForm.password === pwForm.confirm ? '✓ Password cocok' : '✗ Password tidak cocok'}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setPwModal(null)}>Batal</Button>
                <Button variant="primary" onClick={savePassword}>Simpan Password</Button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ── Confirm Hapus ── */}
      <ConfirmDialog
        isOpen={!!confirmData}
        title={confirmData?.title}
        message={confirmData?.message}
        onConfirm={confirmData?.onConfirm}
        onCancel={() => setConfirmData(null)}
      />
    </div>
  );
}

