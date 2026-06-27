export const studentValidator = {
  validateCreate(body) {
    if (!body.nis || typeof body.nis !== 'string' || !body.nis.trim()) {
      return { error: 'NIS tidak boleh kosong dan harus berupa teks.' };
    }
    if (!body.nama || typeof body.nama !== 'string' || !body.nama.trim()) {
      return { error: 'Nama tidak boleh kosong dan harus berupa teks.' };
    }
    if (!body.kelas_id || typeof body.kelas_id !== 'string' || !body.kelas_id.trim()) {
      return { error: 'Kelas ID wajib dilampirkan.' };
    }
    return null;
  }
};
