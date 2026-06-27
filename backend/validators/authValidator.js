export const authValidator = {
  validateLogin(body) {
    if (!body.username || typeof body.username !== 'string' || !body.username.trim()) {
      return { error: 'Username tidak boleh kosong dan harus berupa teks.' };
    }
    if (!body.password || typeof body.password !== 'string' || !body.password.trim()) {
      return { error: 'Password tidak boleh kosong dan harus berupa teks.' };
    }
    return null;
  }
};
