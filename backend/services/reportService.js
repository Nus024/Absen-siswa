import { attendanceService } from './attendanceService.js';
import { cacheManager } from '../cache/CacheManager.js';

export const reportService = {
  async getDaily(date, classId) {
    const attendance = await attendanceService.getByTanggalKelas(date, classId);
    const studentsInClass = cacheManager.getStudents().filter(s => s.KELAS_ID === classId && s.STATUS !== 'DELETED');
    const sessions = cacheManager.getSessions();

    const data = studentsInClass.map(student => {
      const studentAttendance = attendance.filter(a => a.siswa_id === student.SISWA_ID);
      
      const sessionRecords = {};
      sessions.forEach(sess => {
        const attRecord = studentAttendance.find(a => a.sesi_id === sess.SESI_ID);
        // Default ke 'alpha' jika tidak memindai pada sesi aktif
        sessionRecords[sess.SESI_ID] = attRecord ? attRecord.status : 'alpha';
      });

      return {
        siswa_id: student.SISWA_ID,
        nis:      student.NIS,
        nama:     student.NAMA,
        sessions: sessionRecords,
      };
    });

    return {
      date,
      class_id: classId,
      records:  data,
    };
  },

  async getMonthly(year, month, classId) {
    const attendance = await attendanceService.getByMonth(year, month);
    const studentsInClass = cacheManager.getStudents().filter(s => s.KELAS_ID === classId && s.STATUS !== 'DELETED');
    const daysInMonth = new Date(year, month, 0).getDate();

    const data = studentsInClass.map(student => {
      const studentAttendance = attendance.filter(a => a.siswa_id === student.SISWA_ID);
      
      const days = {};
      let totalHadir = 0;
      let totalIzin = 0;
      let totalSakit = 0;
      let totalAlfa = 0;
      let totalDispensasi = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayAttendance = studentAttendance.filter(a => a.tanggal === dateStr);
        
        if (dayAttendance.length === 0) {
          days[day] = '-';
        } else {
          const statuses = dayAttendance.map(a => a.status);
          if (statuses.includes('hadir')) {
            days[day] = 'H';
            totalHadir++;
          } else if (statuses.includes('dispensasi')) {
            days[day] = 'D';
            totalDispensasi++;
          } else if (statuses.includes('sakit')) {
            days[day] = 'S';
            totalSakit++;
          } else if (statuses.includes('izin')) {
            days[day] = 'I';
            totalIzin++;
          } else {
            days[day] = 'A';
            totalAlfa++;
          }
        }
      }

      return {
        siswa_id: student.SISWA_ID,
        nis:      student.NIS,
        nama:     student.NAMA,
        days,
        summary: {
          H: totalHadir,
          S: totalSakit,
          I: totalIzin,
          A: totalAlfa,
          D: totalDispensasi,
        }
      };
    });

    return {
      year,
      month,
      class_id: classId,
      records:  data,
    };
  }
};
