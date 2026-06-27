import { permissionRepository } from '../repositories/permissionRepository.js';
import { cacheManager } from '../cache/CacheManager.js';
import { getIsoString } from '../helpers/dateHelper.js';
import { logger } from '../config/logger.js';

const joinPermissionDetails = (item) => {
  const students = cacheManager.getStudents();
  const classes = cacheManager.getClasses();
  const studentObj = students.find(s => s.SISWA_ID === item.SISWA_ID);
  
  let studentData = null;
  if (studentObj) {
    const classObj = classes.find(c => c.KELAS_ID === studentObj.KELAS_ID);
    studentData = {
      id:       studentObj.SISWA_ID,
      nis:      studentObj.NIS,
      nama:     studentObj.NAMA,
      kelas_id: studentObj.KELAS_ID,
      kelas:    classObj ? { id: classObj.KELAS_ID, nama: classObj.NAMA } : null,
    };
  }

  return {
    id:            item.IZIN_ID,
    siswa_id:      item.SISWA_ID,
    petugas_id:    item.PETUGAS,
    waktu_keluar:  item.WAKTU_KELUAR,
    waktu_kembali: item.WAKTU_KEMBALI,
    alasan:        item.ALASAN,
    status:        item.STATUS,
    catatan:       item.CATATAN,
    siswa:         studentData,
  };
};

export const permissionService = {
  async getAll() {
    const list = await permissionRepository.getAll();
    return list.map(joinPermissionDetails);
  },

  async getAktif() {
    const list = await permissionRepository.getAll();
    return list
      .filter(p => p.STATUS === 'keluar')
      .map(joinPermissionDetails);
  },

  async getByTanggal(tanggal) {
    const list = await permissionRepository.getAll();
    return list
      .filter(p => p.WAKTU_KELUAR && p.WAKTU_KELUAR.startsWith(tanggal))
      .map(joinPermissionDetails);
  },

  async create(payload) {
    const list = await permissionRepository.getAll();
    const newPerm = {
      IZIN_ID:       `IZN${String(list.length + 1).padStart(6, '0')}`,
      SISWA_ID:      payload.siswa_id,
      ALASAN:        payload.alasan || '',
      WAKTU_KELUAR:  getIsoString(),
      WAKTU_KEMBALI: '',
      STATUS:        'keluar',
      PETUGAS:       payload.petugas_id || '',
      CATATAN:       payload.catatan || '',
    };

    const created = await permissionRepository.create(newPerm);
    logger.audit(payload.petugas_id || 'SYSTEM', 'CREATE_PERMISSION', `Siswa ID ${payload.siswa_id} diizinkan keluar`);
    return joinPermissionDetails(created);
  },

  async kembali(id) {
    const existing = await permissionRepository.getById(id);
    if (!existing) throw new Error('Data izin tidak ditemukan');

    const updated = await permissionRepository.update(id, {
      STATUS:        'kembali',
      WAKTU_KEMBALI: getIsoString(),
    });

    logger.info(`Siswa dengan izin ID ${id} kembali ke sekolah`);
    return joinPermissionDetails(updated);
  }
};
