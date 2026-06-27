export const getTodayStr = () => {
  // Mengembalikan tanggal dalam format YYYY-MM-DD menggunakan waktu lokal Swedia (sv-SE)
  return new Date().toLocaleDateString('sv-SE');
};

export const getIsoString = () => {
  return new Date().toISOString();
};
