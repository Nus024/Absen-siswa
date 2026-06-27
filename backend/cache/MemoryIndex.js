class MemoryIndex {
  constructor() {
    this.qrTokenToStudentMap = new Map();
    this.nisToStudentMap = new Map();
    this.usernameToUserMap = new Map();
  }

  rebuildAll(store) {
    this.rebuildStudents(store.SISWA);
    this.rebuildUsers(store.USERS);
  }

  rebuildStudents(students = []) {
    this.qrTokenToStudentMap.clear();
    this.nisToStudentMap.clear();
    for (const student of students) {
      if (student.QR_TOKEN) {
        this.qrTokenToStudentMap.set(student.QR_TOKEN, student);
      }
      if (student.NIS) {
        this.nisToStudentMap.set(student.NIS, student);
      }
    }
  }

  rebuildUsers(users = []) {
    this.usernameToUserMap.clear();
    for (const user of users) {
      if (user.USERNAME) {
        this.usernameToUserMap.set(user.USERNAME.toLowerCase(), user);
      }
    }
  }

  getStudentByQrToken(token) {
    return this.qrTokenToStudentMap.get(token) || null;
  }

  getStudentByNis(nis) {
    return this.nisToStudentMap.get(nis) || null;
  }

  getUserByUsername(username) {
    if (!username) return null;
    return this.usernameToUserMap.get(username.toLowerCase()) || null;
  }
}

export const memoryIndex = new MemoryIndex();
