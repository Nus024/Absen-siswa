export const attendanceValidator = {
  validateCreate(body) {
    if (!body.siswa_id || typeof body.siswa_id !== 'string' || !body.siswa_id.trim()) {
      return { error: 'Siswa ID wajib dilampirkan.' };
    }
    if (!body.sesi_id || typeof body.sesi_id !== 'string' || !body.sesi_id.trim()) {
      return { error: 'Sesi ID wajib dilampirkan.' };
    }
    return null;
  }
};
