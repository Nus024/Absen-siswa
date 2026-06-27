export const classValidator = {
  validateCreate(body) {
    if (!body.nama || typeof body.nama !== 'string' || !body.nama.trim()) {
      return { error: 'Nama kelas tidak boleh kosong dan harus berupa teks.' };
    }
    return null;
  }
};
