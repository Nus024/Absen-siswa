// ============================================================
// lib/localDB.js — localStorage wrapper sebagai pengganti Google Sheets REST API
// (swap ke google sheets REST apiClient.js nanti saat sudah ada credentials)
// ============================================================
import { v4 as uuidv4 } from 'uuid';

const PREFIX = 'absensi_';

function getStore(key) {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + key) || '[]');
  } catch { return []; }
}
function setStore(key, data) {
  localStorage.setItem(PREFIX + key, JSON.stringify(data));
}

// ── SEED DATA (data awal demo) ──────────────────────────────
export function seedIfEmpty() {
  if (getStore('kelas').length > 0) return;

  const kelasData = [
    { id: uuidv4(), nama: 'X IPA 1' },
    { id: uuidv4(), nama: 'X IPA 2' },
    { id: uuidv4(), nama: 'XI IPS 1' },
    { id: uuidv4(), nama: 'XII IPA 1' },
  ];
  setStore('kelas', kelasData);

  const siswaData = [];
  const namaSiswa = [
    'Ahmad Rizki','Budi Prasetyo','Cahya Dewi','Dian Safitri','Eko Prasetyo',
    'Fathur Rahman','Gilang Ramadhan','Hani Putri','Indra Kusuma','Julia Wati',
    'Kevin Andrianto','Lina Marlina','Maulana Yusuf','Novia Sari','Omar Hakim',
    'Putri Anggraini','Qodir Hamzah','Rina Susanti','Sandi Kurniawan','Tika Permata',
  ];
  kelasData.forEach((kelas, ki) => {
    namaSiswa.slice(0, 15).forEach((nama, i) => {
      siswaData.push({
        id: uuidv4(),
        nis: `${2024}${(ki+1).toString().padStart(2,'0')}${(i+1).toString().padStart(3,'0')}`,
        nama: nama + (ki > 0 ? ` ${ki}` : ''),
        kelas_id: kelas.id,
        qr_token: uuidv4(),
        qr_status: 'active',
        qr_generated_at: new Date().toISOString(),
        qr_regenerated_count: 0,
        last_scan_at: null,
      });
    });
  });
  setStore('siswa', siswaData);

  const sesiData = [
    { id: uuidv4(), nama: 'Masuk Pagi', jam_mulai: '06:30', jam_selesai: '07:30', urutan: 1 },
    { id: uuidv4(), nama: 'Istirahat', jam_mulai: '09:45', jam_selesai: '10:15', urutan: 2 },
    { id: uuidv4(), nama: 'Pulang', jam_mulai: '14:00', jam_selesai: '15:00', urutan: 3 },
  ];
  setStore('sesi', sesiData);

  setStore('users', [
    { id: uuidv4(), nama: 'Administrator', username: 'admin', password: 'admin123', role: 'admin' },
    { id: uuidv4(), nama: 'Tata Usaha', username: 'tu', password: 'tu123', role: 'admin' },
    { id: uuidv4(), nama: 'Wali Kelas', username: 'wali', password: 'wali123', role: 'pengawas', kelas_ids: [] },
  ]);
}

// ── USERS ────────────────────────────────────────────────────
export const usersDB = {
  getAll: () => getStore('users'),
  getById: (id) => getStore('users').find(u => u.id === id),
  create: (data) => {
    const list = getStore('users');
    const item = { id: uuidv4(), ...data };
    list.push(item);
    setStore('users', list);
    return item;
  },
  update: (id, data) => {
    const list = getStore('users').map(u => u.id === id ? { ...u, ...data } : u);
    setStore('users', list);
    return list.find(u => u.id === id);
  },
  delete: (id) => {
    setStore('users', getStore('users').filter(u => u.id !== id));
  },
};

// ── KELAS ────────────────────────────────────────────────────
export const kelasDB = {
  getAll: () => getStore('kelas'),
  getById: (id) => getStore('kelas').find(k => k.id === id),
  create: (data) => {
    const list = getStore('kelas');
    const item = { id: uuidv4(), ...data };
    list.push(item);
    setStore('kelas', list);
    return item;
  },
  update: (id, data) => {
    const list = getStore('kelas').map(k => k.id === id ? { ...k, ...data } : k);
    setStore('kelas', list);
    return list.find(k => k.id === id);
  },
  delete: (id) => {
    setStore('kelas', getStore('kelas').filter(k => k.id !== id));
  },
};

// ── SISWA ────────────────────────────────────────────────────
export const siswaDB = {
  getAll: () => getStore('siswa'),
  getByKelas: (kelasId) => getStore('siswa').filter(s => s.kelas_id === kelasId),
  getById: (id) => getStore('siswa').find(s => s.id === id),
  getByQrToken: (token) => getStore('siswa').find(s => s.qr_token === token),
  create: (data) => {
    const list = getStore('siswa');
    const item = {
      id: uuidv4(), qr_token: uuidv4(), qr_status: 'active',
      qr_generated_at: new Date().toISOString(),
      qr_regenerated_count: 0, last_scan_at: null,
      qr_version: 1, // Default version 1
      ...data
    };
    list.push(item);
    setStore('siswa', list);
    return item;
  },
  update: (id, data) => {
    const list = getStore('siswa').map(s => s.id === id ? { ...s, ...data } : s);
    setStore('siswa', list);
    return list.find(s => s.id === id);
  },
  delete: (id) => {
    setStore('siswa', getStore('siswa').filter(s => s.id !== id));
  },
  regenerateQr: (id, changedBy = null, reason = 'Regenerate manual oleh administrator') => {
    const list = getStore('siswa').map(s => {
      if (s.id === id) {
        const oldToken = s.qr_token;
        const oldVersion = s.qr_version || 1;
        const newToken = uuidv4();
        const newVersion = oldVersion + 1;

        // Catat ke riwayat lokal di localStorage
        const historyList = getStore('student_qr_history');
        historyList.push({
          id: uuidv4(),
          student_id: id,
          old_qr_token: oldToken,
          new_qr_token: newToken,
          old_version: oldVersion,
          new_version: newVersion,
          reason,
          changed_by: changedBy,
          created_at: new Date().toISOString()
        });
        setStore('student_qr_history', historyList);

        return {
          ...s,
          qr_token:             newToken,
          qr_version:           newVersion,
          qr_generated_at:      new Date().toISOString(),
          qr_regenerated_count: (s.qr_regenerated_count || 0) + 1,
        };
      }
      return s;
    });
    setStore('siswa', list);
    return list.find(s => s.id === id);
  },
};

// ── SESI ────────────────────────────────────────────────────
export const sesiDB = {
  getAll: () => getStore('sesi').sort((a,b) => a.urutan - b.urutan),
  getById: (id) => getStore('sesi').find(s => s.id === id),
  create: (data) => {
    const list = getStore('sesi');
    const item = { id: uuidv4(), ...data };
    list.push(item);
    setStore('sesi', list);
    return item;
  },
  update: (id, data) => {
    const list = getStore('sesi').map(s => s.id === id ? { ...s, ...data } : s);
    setStore('sesi', list);
    return list.find(s => s.id === id);
  },
  delete: (id) => {
    setStore('sesi', getStore('sesi').filter(s => s.id !== id));
  },
};

// ── ABSENSI ──────────────────────────────────────────────────
export const absensiDB = {
  getAll: () => getStore('absensi'),
  getByTanggal: (tanggal) => getStore('absensi').filter(a => a.tanggal === tanggal),
  getByTanggalSesi: (tanggal, sesiId) =>
    getStore('absensi').filter(a => a.tanggal === tanggal && a.sesi_id === sesiId),
  getByTanggalKelas: (tanggal, kelasId) => {
    const siswaIds = siswaDB.getByKelas(kelasId).map(s => s.id);
    return getStore('absensi').filter(a => a.tanggal === tanggal && siswaIds.includes(a.siswa_id));
  },
  getBySiswaMonth: (siswaId, year, month) =>
    getStore('absensi').filter(a => {
      const d = new Date(a.tanggal);
      return a.siswa_id === siswaId && d.getFullYear() === year && d.getMonth() + 1 === month;
    }),
  getByMonth: (year, month) =>
    getStore('absensi').filter(a => {
      const d = new Date(a.tanggal);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    }),
  existsScan: (siswaId, sesiId, tanggal) =>
    getStore('absensi').some(a => a.siswa_id === siswaId && a.sesi_id === sesiId && a.tanggal === tanggal),
  create: (data) => {
    const list = getStore('absensi');
    const item = {
      id: uuidv4(),
      status: 'hadir',
      catatan: '',
      waktu_scan: new Date().toISOString(),
      tanggal: new Date().toLocaleDateString('sv-SE'),
      ...data,
    };
    list.push(item);
    setStore('absensi', list);
    return item;
  },
  update: (id, data) => {
    const list = getStore('absensi').map(a => a.id === id ? { ...a, ...data } : a);
    setStore('absensi', list);
    return list.find(a => a.id === id);
  },
  delete: (id) => {
    setStore('absensi', getStore('absensi').filter(a => a.id !== id));
  },
  bulkCreate: (items) => {
    const list = getStore('absensi');
    const created = items.map(data => ({ id: uuidv4(), ...data }));
    setStore('absensi', [...list, ...created]);
    return created;
  },
};

// ── IZIN KELUAR ──────────────────────────────────────────────
export const izinDB = {
  getAll: () => getStore('izin_keluar'),
  getAktif: () => getStore('izin_keluar').filter(i => i.status === 'keluar'),
  getByTanggal: (tanggal) =>
    getStore('izin_keluar').filter(i => i.waktu_keluar?.startsWith(tanggal)),
  create: (data) => {
    const list = getStore('izin_keluar');
    const item = { id: uuidv4(), status: 'keluar', waktu_keluar: new Date().toISOString(), ...data };
    list.push(item);
    setStore('izin_keluar', list);
    return item;
  },
  kembali: (id) => {
    const list = getStore('izin_keluar').map(i =>
      i.id === id ? { ...i, status: 'kembali', waktu_kembali: new Date().toISOString() } : i
    );
    setStore('izin_keluar', list);
    return list.find(i => i.id === id);
  },
};

// ── AUTH ─────────────────────────────────────────────────────
export const authDB = {
  login: (username, password) => {
    const users = getStore('users');
    return users.find(u => u.username === username && u.password === password) || null;
  },
  getSession: () => {
    try { return JSON.parse(sessionStorage.getItem('absensi_session')); } catch { return null; }
  },
  setSession: (user) => sessionStorage.setItem('absensi_session', JSON.stringify(user)),
  clearSession: () => sessionStorage.removeItem('absensi_session'),
};
