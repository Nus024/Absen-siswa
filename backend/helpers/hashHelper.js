import bcrypt from 'bcryptjs';

export const hashHelper = {
  async hash(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },
  async verify(password, hashed) {
    if (!password || !hashed) return false;
    return bcrypt.compare(password, hashed);
  }
};
