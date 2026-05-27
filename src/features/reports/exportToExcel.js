// ============================================================
// features/reports/exportToExcel.js — SheetJS Excel export
// Format: No, NIS, Nama, Kelas, [Tgl-1...Tgl-N], H, I, S, A, D
// ============================================================
import * as XLSX from 'xlsx';
import { MONTHS_ID } from '../../lib/constants';

export function exportRekapBulanan({ siswas, absensiMap, sesis, bulan, tahun, namaKelas }) {
  const daysInMonth = new Date(tahun, bulan, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Header baris 1: judul
  const judulRow = [`REKAP ABSENSI BULANAN — ${namaKelas || 'SEMUA KELAS'}`];
  const periodeRow = [`Periode: ${MONTHS_ID[bulan - 1]} ${tahun}`];
  const blankRow = [];

  // Header kolom tabel
  const sesiLabels = sesis.map(s => s.nama);
  const headerRow = ['No', 'NIS', 'Nama', 'Kelas', ...days.map(d => d.toString()), 'H', 'I', 'S', 'A', 'D'];

  const dataRows = siswas.map((siswa, idx) => {
    let H = 0, I = 0, S = 0, A = 0, D = 0;
    const dayValues = days.map(d => {
      const dateStr = `${tahun}-${bulan.toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
      const key = `${siswa.id}_${dateStr}`;
      const statuses = absensiMap[key] || [];
      if (statuses.length === 0) return '';
      // Ambil status sesi pertama sebagai representasi hari
      const s = statuses[0];
      if (s === 'hadir') H++;
      else if (s === 'izin') I++;
      else if (s === 'sakit') S++;
      else if (s === 'alpha') A++;
      else if (s === 'dispensasi') D++;
      const codes = { hadir: 'H', izin: 'I', sakit: 'S', alpha: 'A', dispensasi: 'D' };
      return codes[s] || s;
    });
    return [idx + 1, siswa.nis, siswa.nama, siswa.kelas_nama || '', ...dayValues, H, I, S, A, D];
  });

  const aoa = [judulRow, periodeRow, blankRow, headerRow, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Lebar kolom
  const colWidths = [{ wch: 4 }, { wch: 14 }, { wch: 25 }, { wch: 12 },
    ...days.map(() => ({ wch: 4 })), { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 }];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Bulanan');

  const filename = `rekap_${namaKelas ? namaKelas.replace(/\s/g,'_') + '_' : ''}${MONTHS_ID[bulan-1]}_${tahun}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export function exportRekapHarian({ siswas, absensiByDate, sesis, tanggal, namaKelas }) {
  const headerRow = ['No', 'NIS', 'Nama', 'Kelas', ...sesis.map(s => s.nama), 'Total Hadir'];

  const dataRows = siswas.map((siswa, idx) => {
    const sesiValues = sesis.map(sesi => {
      const key = `${siswa.id}_${sesi.id}_${tanggal}`;
      const status = absensiByDate[key] || 'A';
      const codes = { hadir: 'H', izin: 'I', sakit: 'S', alpha: 'A', dispensasi: 'D' };
      return codes[status] || status;
    });
    const totalHadir = sesiValues.filter(v => v === 'H').length;
    return [idx + 1, siswa.nis, siswa.nama, siswa.kelas_nama || '', ...sesiValues, totalHadir];
  });

  const aoa = [
    [`REKAP ABSENSI HARIAN — ${namaKelas || 'SEMUA KELAS'}`],
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
