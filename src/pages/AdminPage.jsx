// ============================================================
// pages/AdminPage.jsx — Premium settings / management
// ============================================================
import { useState, useEffect } from 'react';
import { siswaDB, kelasDB, sesiDB } from '../lib/localDB';

export function AdminPage({ user }) {
  const [tab, setTab] = useState('siswa');
  const canAdmin = user?.role === 'admin';

  const tabs = [
    { id: 'siswa', label: 'Siswa' },
    { id: 'kelas', label: 'Kelas' },
    { id: 'sesi',  label: 'Sesi' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Pengaturan</h1>
          <span className="page-subtitle">Manajemen data operasional</span>
        </div>
      </div>

      <div className="page-content">
        <div className="tab-bar">
          {tabs.map(t => (
            <button key={t.id}
              className={`tab-item${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'siswa' && <ManageSiswa canAdmin={canAdmin} />}
        {tab === 'kelas' && <ManageKelas canAdmin={canAdmin} />}
        {tab === 'sesi'  && <ManageSesi  canAdmin={canAdmin} />}
      </div>
    </div>
  );
}

// ── Siswa ─────────────────────────────────────────────────────
function ManageSiswa({ canAdmin }) {
  const [list, setList]           = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [kelasFilter, setKelasFilter] = useState('');
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState(null); // null | 'new' | siswa object
  const [form, setForm]           = useState({ nis: '', nama: '', kelas_id: '' });
  const [err, setErr]             = useState('');

  function load() { setList(siswaDB.getAll()); setKelasList(kelasDB.getAll()); }
  useEffect(() => { load(); }, []);

  const filtered = list.filter(s => {
    const okKelas  = !kelasFilter || s.kelas_id === kelasFilter;
    const okSearch = !search || s.nama.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search);
    return okKelas && okSearch;
  });

  function openNew() {
    setForm({ nis: '', nama: '', kelas_id: kelasList[0]?.id || '' });
    setErr(''); setModal('new');
  }
  function openEdit(s) {
    setForm({ nis: s.nis, nama: s.nama, kelas_id: s.kelas_id });
    setErr(''); setModal(s);
  }

  function save() {
    if (!form.nis.trim() || !form.nama.trim() || !form.kelas_id) {
      setErr('Semua field wajib diisi'); return;
    }
    if (modal === 'new') {
      if (list.find(s => s.nis === form.nis.trim())) { setErr('NIS sudah terdaftar'); return; }
      siswaDB.create(form);
    } else {
      siswaDB.update(modal.id, form);
    }
    load(); setModal(null);
  }

  function del(s) {
    if (!window.confirm(`Hapus siswa "${s.nama}"?`)) return;
    siswaDB.delete(s.id); load();
  }

  return (
    <>
      <div className="toolbar">
        <select className="field-input" style={{ width: 'auto', height: 34 }}
          value={kelasFilter} onChange={e => setKelasFilter(e.target.value)}>
          <option value="">Semua Kelas</option>
          {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
        </select>
        <input id="siswa-search" className="field-input" style={{ width: 220, height: 34 }}
          type="text" placeholder="Cari nama atau NIS…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="toolbar-end">
          {canAdmin && (
            <button id="btn-add-siswa" className="btn btn-primary" onClick={openNew}>
              + Tambah Siswa
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th className="td-num">#</th>
                <th>NIS</th>
                <th>Nama Siswa</th>
                <th>Kelas</th>
                <th>QR</th>
                {canAdmin && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="empty">
                    <div className="empty-icon">👤</div>
                    <div className="empty-title">Tidak ada siswa</div>
                    {canAdmin && <div className="empty-desc">Klik "Tambah Siswa" untuk memulai</div>}
                  </div>
                </td></tr>
              ) : filtered.map((s, i) => {
                const kelas = kelasDB.getById(s.kelas_id);
                return (
                  <tr key={s.id}>
                    <td className="td-num">{i + 1}</td>
                    <td className="td-nis">{s.nis}</td>
                    <td className="td-name">{s.nama}</td>
                    <td><span className="chip">{kelas?.nama || '—'}</span></td>
                    <td>
                      <span className={s.qr_status === 'active' ? 'pill pill-active' : 'pill pill-inactive'}>
                        {s.qr_status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    {canAdmin && (
                      <td>
                        <div className="td-actions">
                          <button className="btn btn-sm" onClick={() => openEdit(s)}>Edit</button>
                          <button className="btn btn-sm btn-danger-ghost" onClick={() => del(s)}>Hapus</button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="card-footer">
          <span>{filtered.length} dari {list.length} siswa</span>
        </div>
      </div>

      {modal && (
        <div className="modal-scrim" onClick={() => setModal(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modal === 'new' ? 'Tambah Siswa Baru' : 'Edit Siswa'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-divider" />
            <div className="modal-body">
              {err && <div className="alert alert-error"><span>⚠</span>{err}</div>}
              <div className="field">
                <label className="field-label">NIS</label>
                <input id="siswa-nis" className="field-input" value={form.nis}
                  placeholder="Nomor Induk Siswa"
                  onChange={e => setForm(f => ({ ...f, nis: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field-label">Nama Lengkap</label>
                <input id="siswa-nama" className="field-input" value={form.nama}
                  placeholder="Nama lengkap siswa"
                  onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field-label">Kelas</label>
                <select id="siswa-kelas" className="field-input" value={form.kelas_id}
                  onChange={e => setForm(f => ({ ...f, kelas_id: e.target.value }))}>
                  {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setModal(null)}>Batal</button>
              <button id="btn-save-siswa" className="btn btn-primary" onClick={save}>
                {modal === 'new' ? 'Tambah Siswa' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Kelas ─────────────────────────────────────────────────────
function ManageKelas({ canAdmin }) {
  const [list, setList]   = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm]   = useState({ nama: '', wali_kelas: '' });
  const [err, setErr]     = useState('');

  function load() { setList(kelasDB.getAll()); }
  useEffect(() => { load(); }, []);

  function save() {
    if (!form.nama.trim()) { setErr('Nama kelas wajib diisi'); return; }
    if (modal === 'new') kelasDB.create(form);
    else kelasDB.update(modal.id, form);
    load(); setModal(null);
  }

  function del(k) {
    const cnt = siswaDB.getByKelas(k.id).length;
    if (cnt > 0) { alert(`Tidak bisa menghapus kelas yang masih memiliki ${cnt} siswa.`); return; }
    if (!window.confirm(`Hapus kelas "${k.nama}"?`)) return;
    kelasDB.delete(k.id); load();
  }

  return (
    <>
      <div className="toolbar">
        {canAdmin && (
          <button id="btn-add-kelas" className="btn btn-primary"
            onClick={() => { setForm({ nama: '', wali_kelas: '' }); setErr(''); setModal('new'); }}>
            + Tambah Kelas
          </button>
        )}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th className="td-num">#</th>
                <th>Nama Kelas</th>
                <th>Wali Kelas</th>
                <th>Jumlah Siswa</th>
                {canAdmin && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={5}>
                  <div className="empty">
                    <div className="empty-icon">🏫</div>
                    <div className="empty-title">Belum ada kelas</div>
                  </div>
                </td></tr>
              ) : list.map((k, i) => {
                const cnt = siswaDB.getByKelas(k.id).length;
                return (
                  <tr key={k.id}>
                    <td className="td-num">{i + 1}</td>
                    <td className="td-name">{k.nama}</td>
                    <td className="td-meta">{k.wali_kelas || <span style={{ color: 'var(--text-tertiary)' }}>—</span>}</td>
                    <td>
                      <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{cnt}</span>
                      <span className="td-meta" style={{ marginLeft: 4, fontSize: 12 }}>siswa</span>
                    </td>
                    {canAdmin && (
                      <td>
                        <div className="td-actions">
                          <button className="btn btn-sm"
                            onClick={() => { setForm({ nama: k.nama, wali_kelas: k.wali_kelas || '' }); setErr(''); setModal(k); }}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-danger-ghost" onClick={() => del(k)}>Hapus</button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-scrim" onClick={() => setModal(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modal === 'new' ? 'Tambah Kelas' : 'Edit Kelas'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-divider" />
            <div className="modal-body">
              {err && <div className="alert alert-error"><span>⚠</span>{err}</div>}
              <div className="field">
                <label className="field-label">Nama Kelas</label>
                <input id="kelas-nama" className="field-input" value={form.nama}
                  placeholder="Contoh: X IPA 1"
                  onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field-label">Wali Kelas</label>
                <input id="kelas-wali" className="field-input" value={form.wali_kelas}
                  placeholder="Nama dan gelar (opsional)"
                  onChange={e => setForm(f => ({ ...f, wali_kelas: e.target.value }))} />
                <div className="field-hint">Opsional. Ditampilkan di laporan.</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setModal(null)}>Batal</button>
              <button id="btn-save-kelas" className="btn btn-primary" onClick={save}>
                {modal === 'new' ? 'Tambah' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Sesi ──────────────────────────────────────────────────────
function ManageSesi({ canAdmin }) {
  const [list, setList]   = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm]   = useState({ nama: '', jam_mulai: '07:00', jam_selesai: '08:00', urutan: 1 });
  const [err, setErr]     = useState('');

  function load() { setList(sesiDB.getAll().sort((a, b) => a.urutan - b.urutan)); }
  useEffect(() => { load(); }, []);

  function save() {
    if (!form.nama.trim()) { setErr('Nama sesi wajib diisi'); return; }
    if (modal === 'new') sesiDB.create(form);
    else sesiDB.update(modal.id, form);
    load(); setModal(null);
  }

  return (
    <>
      <div className="alert alert-info" style={{ fontSize: 13.5 }}>
        <span>ℹ</span>
        Disarankan 3 sesi: <strong>Masuk Pagi</strong>, <strong>Istirahat</strong>, dan <strong>Pulang</strong>.
      </div>

      <div className="toolbar">
        {canAdmin && list.length < 5 && (
          <button id="btn-add-sesi" className="btn btn-primary"
            onClick={() => {
              setForm({ nama: '', jam_mulai: '07:00', jam_selesai: '08:00', urutan: list.length + 1 });
              setErr(''); setModal('new');
            }}>
            + Tambah Sesi
          </button>
        )}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 80, textAlign: 'center' }}>Urutan</th>
                <th>Nama Sesi</th>
                <th>Jam Mulai</th>
                <th>Jam Selesai</th>
                {canAdmin && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {list.map(s => (
                <tr key={s.id}>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 26, height: 26, background: 'var(--blue-subtle)',
                      color: 'var(--blue)', borderRadius: '50%',
                      fontSize: 12, fontWeight: 700,
                    }}>{s.urutan}</span>
                  </td>
                  <td className="td-name">{s.nama}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, color: 'var(--text-secondary)' }}>
                    {s.jam_mulai}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, color: 'var(--text-secondary)' }}>
                    {s.jam_selesai}
                  </td>
                  {canAdmin && (
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-sm"
                          onClick={() => { setForm({ nama: s.nama, jam_mulai: s.jam_mulai, jam_selesai: s.jam_selesai, urutan: s.urutan }); setErr(''); setModal(s); }}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger-ghost"
                          onClick={() => { if (window.confirm(`Hapus sesi "${s.nama}"?`)) { sesiDB.delete(s.id); load(); } }}>
                          Hapus
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-scrim" onClick={() => setModal(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modal === 'new' ? 'Tambah Sesi' : 'Edit Sesi'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-divider" />
            <div className="modal-body">
              {err && <div className="alert alert-error"><span>⚠</span>{err}</div>}
              <div className="field">
                <label className="field-label">Nama Sesi</label>
                <input id="sesi-nama" className="field-input" value={form.nama}
                  placeholder="Contoh: Masuk Pagi"
                  onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Jam Mulai</label>
                  <input id="sesi-mulai" type="time" className="field-input" value={form.jam_mulai}
                    onChange={e => setForm(f => ({ ...f, jam_mulai: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="field-label">Jam Selesai</label>
                  <input id="sesi-selesai" type="time" className="field-input" value={form.jam_selesai}
                    onChange={e => setForm(f => ({ ...f, jam_selesai: e.target.value }))} />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Urutan</label>
                <input id="sesi-urutan" type="number" min={1} max={5} className="field-input"
                  value={form.urutan} onChange={e => setForm(f => ({ ...f, urutan: Number(e.target.value) }))} />
                <div className="field-hint">Menentukan urutan kolom di tabel rekap</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setModal(null)}>Batal</button>
              <button id="btn-save-sesi" className="btn btn-primary" onClick={save}>
                {modal === 'new' ? 'Tambah' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
