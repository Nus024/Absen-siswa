class CacheManager {
  constructor() {
    this.store = {
      USERS: [],
      SISWA: [],
      KELAS: [],
      SESI: [],
      SETTINGS: {},
    };
    this.lastLoaded = null;
  }

  getUsers() {
    return this.store.USERS;
  }
  setUsers(users) {
    this.store.USERS = users || [];
  }

  getStudents() {
    return this.store.SISWA;
  }
  setStudents(students) {
    this.store.SISWA = students || [];
  }

  getClasses() {
    return this.store.KELAS;
  }
  setClasses(classes) {
    this.store.KELAS = classes || [];
  }

  getSessions() {
    return this.store.SESI;
  }
  setSessions(sessions) {
    this.store.SESI = sessions || [];
  }

  getSettings() {
    return this.store.SETTINGS;
  }
  setSettings(settings) {
    this.store.SETTINGS = settings || {};
  }

  clear() {
    this.store = {
      USERS: [],
      SISWA: [],
      KELAS: [],
      SESI: [],
      SETTINGS: {},
    };
    this.lastLoaded = null;
  }
}

export const cacheManager = new CacheManager();
