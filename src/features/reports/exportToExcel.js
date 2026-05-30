// ============================================================
// features/reports/exportToExcel.js — SheetJS Excel export
// Format: No, NIS, Nama, Kelas, [Tgl-1...Tgl-N], H, I, S, A, D
// ============================================================
import * as XLSX from 'xlsx';
import { MONTHS_ID } from '../../lib/constants';

export function exportRekapBulanan({ siswas, absensiMap, sesis, bulan, tahun, namaKelas }) {
  const daysInMonth = new Date(tahun, bulan, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const schoolName = localStorage.getItem('school_name') || 'Absensi QR';
  // Header baris 1: judul
  const judulRow = [`REKAP ABSENSI BULANAN — ${schoolName.toUpperCase()} — ${namaKelas || 'SEMUA KELAS'}`];
  const periodeRow = [`Periode: ${MONTHS_ID[bulan - 1]} ${tahun}`];
  const blankRow = [];

  // Header kolom tabel
  const headerRow = ['No', 'NIS', 'Nama', 'Kelas', ...days.map(d => d.toString()), 'H', 'I', 'S', 'A'];

  const dataRows = siswas.map((siswa, idx) => {
    let H = 0, I = 0, S = 0, A = 0;
    const dayValues = days.map(d => {
      const dateStr = `${tahun}-${bulan.toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
      const key = `${siswa.id}_${dateStr}`;
      const s = absensiMap[key];
      if (!s) return '';
      if (s === 'hadir') H++;
      else if (s === 'izin') I++;
      else if (s === 'sakit') S++;
      else if (s === 'alpha') A++;
      const codes = { hadir: 'H', izin: 'I', sakit: 'S', alpha: 'A' };
      return codes[s] || s;
    });
    return [idx + 1, siswa.nis, siswa.nama, siswa.kelas_nama || '', ...dayValues, H, I, S, A];
  });

  const aoa = [judulRow, periodeRow, blankRow, headerRow, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Lebar kolom
  const colWidths = [{ wch: 4 }, { wch: 14 }, { wch: 25 }, { wch: 12 },
    ...days.map(() => ({ wch: 4 })), { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 }];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Bulanan');

  const kelasNama = namaKelas ? namaKelas.replace(/\s+/g, '_') : 'Semua_Kelas';
  const filename = `Rekap_Absensi_Bulanan_${kelasNama}_${MONTHS_ID[bulan - 1]}_${tahun}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export function exportRekapHarian({ siswas, absensiByDate, sesis, tanggal, namaKelas }) {
  const headerRow = ['No', 'NIS', 'Nama', 'Kelas', ...sesis.map(s => s.nama), 'Total Hadir'];

  const dataRows = siswas.map((siswa, idx) => {
    const sesiValues = sesis.map(sesi => {
      const key = `${siswa.id}_${sesi.id}_${tanggal}`;
      const status = absensiByDate[key] || 'A';
      const codes = { hadir: 'H', izin: 'I', sakit: 'S', alpha: 'A' };
      return codes[status] || status;
    });
    const totalHadir = sesiValues.filter(v => v === 'H').length;
    return [idx + 1, siswa.nis, siswa.nama, siswa.kelas_nama || '', ...sesiValues, totalHadir];
  });

  const schoolName = localStorage.getItem('school_name') || 'Absensi QR';
  const aoa = [
    [`REKAP ABSENSI HARIAN — ${schoolName.toUpperCase()} — ${namaKelas || 'SEMUA KELAS'}`],
    [`Tanggal: ${new Date(tanggal + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`],
    [],
    headerRow,
    ...dataRows,
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [{ wch: 4 }, { wch: 14 }, { wch: 25 }, { wch: 12 }, ...sesis.map(() => ({ wch: 12 })), { wch: 12 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Harian');
  XLSX.writeFile(wb, `rekap_harian_${tanggal}.xlsx`);
}

export function exportDetailSiswa({ siswa, displayRows, startDate, endDate }) {
  const schoolName = localStorage.getItem('school_name') || 'Absensi QR';
  
  // Header Info Siswa
  const headerInfo = [
    [`RINCIAN ABSENSI INDIVIDU — ${schoolName.toUpperCase()}`],
    [`Nama Siswa: ${siswa.nama}`],
    [`NIS: ${siswa.nis}`],
    [`Periode: ${startDate} s/d ${endDate}`],
    []
  ];

  const headerRow = ['No', 'Tanggal', 'Sesi', 'Status', 'Waktu Scan', 'Catatan'];
  
  const dataRows = displayRows.map((r, idx) => {
    const codes = { hadir: 'H', izin: 'I', sakit: 'S', alpha: 'A' };
    return [
      idx + 1,
      r.date,
      r.sesiNama,
      r.status ? (codes[r.status] || r.status) : '—',
      r.waktuScan,
      r.catatan
    ];
  });

  const aoa = [...headerInfo, headerRow, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Set widths
  ws['!cols'] = [
    { wch: 5 },  // No
    { wch: 12 }, // Tanggal
    { wch: 15 }, // Sesi
    { wch: 8 },  // Status
    { wch: 12 }, // Waktu Scan
    { wch: 25 }  // Catatan
  ];

  const wb = XLSX.utils.book_new();
  const cleanName = siswa.nama.substring(0, 30).replace(/[:\\/?*\[\]]/g, '');
  XLSX.utils.book_append_sheet(wb, ws, cleanName);

  const filename = `Rincian_Absen_${siswa.nama.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export function exportDetailSiswaBulk({ siswas, absensiData, sesis, startDate, endDate }) {
  const wb = XLSX.utils.book_new();
  const schoolName = localStorage.getItem('school_name') || 'Absensi QR';

  // 1. BUAT SHEET MASTER (Semua Siswa)
  const masterHeader = [
    [`REKAP RINCIAN ABSENSI KELOMPOK — ${schoolName.toUpperCase()}`],
    [`Periode: ${startDate} s/d ${endDate}`],
    []
  ];
  const masterCols = ['No', 'NIS', 'Nama Siswa', 'Kelas', 'Tanggal', 'Sesi', 'Status', 'Waktu Scan', 'Catatan'];
  
  // Map absensiData for quick lookup: `${siswa_id}_${tanggal}_${sesi_id}` -> record
  const recordMap = {};
  absensiData.forEach(a => {
    recordMap[`${a.siswa_id}_${a.tanggal}_${a.sesi_id}`] = a;
  });

  const dates = [];
  const curr = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  while (curr <= end) {
    dates.push(curr.toLocaleDateString('sv-SE'));
    curr.setDate(curr.getDate() + 1);
  }

  const masterRows = [];
  let globalIdx = 1;

  siswas.forEach(siswa => {
    dates.forEach(date => {
      sesis.forEach(sesi => {
        const rec = recordMap[`${siswa.id}_${date}_${sesi.id}`];
        const status = rec?.status || null;
        const waktuScan = rec?.waktu_scan ? new Date(rec.waktu_scan).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—';
        const catatan = rec?.catatan || '—';
        const codes = { hadir: 'H', izin: 'I', sakit: 'S', alpha: 'A' };

        masterRows.push([
          globalIdx++,
          siswa.nis,
          siswa.nama,
          siswa.kelas_nama || '',
          date,
          sesi.nama,
          status ? (codes[status] || status) : '—',
          waktuScan,
          catatan
        ]);
      });
    });
  });

  const masterAoa = [...masterHeader, masterCols, ...masterRows];
  const masterWs = XLSX.utils.aoa_to_sheet(masterAoa);
  masterWs['!cols'] = [
    { wch: 5 },  // No
    { wch: 14 }, // NIS
    { wch: 25 }, // Nama Siswa
    { wch: 12 }, // Kelas
    { wch: 12 }, // Tanggal
    { wch: 15 }, // Sesi
    { wch: 8 },  // Status
    { wch: 12 }, // Waktu Scan
    { wch: 25 }  // Catatan
  ];
  XLSX.utils.book_append_sheet(wb, masterWs, 'Semua Siswa');

  // 2. BUAT SHEET INDIVIDUAL UNTUK TIAP SISWA (Jika jumlah siswa <= 50 untuk cegah crash)
  if (siswas.length <= 50) {
    siswas.forEach(siswa => {
      const studentHeader = [
        [`RINCIAN ABSENSI INDIVIDU — ${schoolName.toUpperCase()}`],
        [`Nama Siswa: ${siswa.nama}`],
        [`NIS: ${siswa.nis}`],
        [`Periode: ${startDate} s/d ${endDate}`],
        []
      ];
      const studentCols = ['No', 'Tanggal', 'Sesi', 'Status', 'Waktu Scan', 'Catatan'];
      const studentRows = [];
      let sIdx = 1;

      dates.forEach(date => {
        sesis.forEach(sesi => {
          const rec = recordMap[`${siswa.id}_${date}_${sesi.id}`];
          const status = rec?.status || null;
          const waktuScan = rec?.waktu_scan ? new Date(rec.waktu_scan).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—';
          const catatan = rec?.catatan || '—';
          const codes = { hadir: 'H', izin: 'I', sakit: 'S', alpha: 'A' };

          studentRows.push([
            sIdx++,
            date,
            sesi.nama,
            status ? (codes[status] || status) : '—',
            waktuScan,
            catatan
          ]);
        });
      });

      const studentAoa = [...studentHeader, studentCols, ...studentRows];
      const studentWs = XLSX.utils.aoa_to_sheet(studentAoa);
      studentWs['!cols'] = [
        { wch: 5 },  // No
        { wch: 12 }, // Tanggal
        { wch: 15 }, // Sesi
        { wch: 8 },  // Status
        { wch: 12 }, // Waktu Scan
        { wch: 25 }  // Catatan
      ];
      
      const cleanName = siswa.nama.substring(0, 30).replace(/[:\\/?*\[\]]/g, '');
      XLSX.utils.book_append_sheet(wb, studentWs, cleanName);
    });
  }

  const filename = `Rincian_Absen_Kelompok_${startDate}_to_${endDate}.xlsx`;
  XLSX.writeFile(wb, filename);
}
