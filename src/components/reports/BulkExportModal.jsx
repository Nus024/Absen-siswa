import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { absensiService } from '../../lib/db/absensi';
import { exportDetailSiswaBulk } from '../../features/reports/exportToExcel';
import DatePicker from '../ui/DatePicker';
import Button from '../ui/Button';
import { Download, X } from 'lucide-react';

export default function BulkExportModal({ siswas, selectedSiswaIds, sesis, defaultBulan, defaultTahun, onClose, onClearSelection }) {
  const pad = (n) => String(n).padStart(2, '0');

  // Hitung awal/akhir bulan default
  const lastDay = new Date(defaultTahun, defaultBulan, 0).getDate();
  const defaultStart = `${defaultTahun}-${pad(defaultBulan)}-01`;
  const defaultEnd = `${defaultTahun}-${pad(defaultBulan)}-${pad(lastDay)}`;

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [exporting, setExporting] = useState(false);

  // Filter siswa yang akan diekspor
  const targetSiswas = selectedSiswaIds.length > 0
    ? siswas.filter(s => selectedSiswaIds.includes(s.id))
    : siswas;

  const handleExport = async () => {
    if (targetSiswas.length === 0) return;
    setExporting(true);
    try {
      const siswaIds = targetSiswas.map(s => s.id);
      // Ambil data absensi seluruh siswa terpilih dalam rentang tanggal
      const absensiData = await absensiService.getBySiswaIdsDateRange(siswaIds, startDate, endDate);
      
      // Jalankan ekspor Excel multi-sheet
      exportDetailSiswaBulk({
        siswas: targetSiswas,
        absensiData,
        sesis,
        startDate,
        endDate
      });

      if (onClearSelection) onClearSelection();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Gagal mengekspor data: ' + (err?.message || 'Error'));
    } finally {
      setExporting(false);
    }
  };

  return createPortal(
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 520, width: '90%' }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">Ekspor Rincian Kelompok</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-divider" />

        {/* Body */}
        <div className="modal-body stack-6">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Anda akan mengunduh rekap kehadiran terperinci (tiap sesi per hari) dalam bentuk berkas Excel (.xlsx).
          </p>

          {/* Info Jumlah Siswa */}
          <div style={{ padding: 12, background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-100)', borderRadius: 8 }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-primary-800)' }}>
              Target Ekspor: {selectedSiswaIds.length > 0 ? `${selectedSiswaIds.length} Siswa Terpilih` : 'Semua Siswa di Kelas Ini'}
            </span>
            <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-700)', paddingLeft: 18, marginTop: 6, maxHeight: 80, overflowY: 'auto' }}>
              {targetSiswas.slice(0, 5).map(s => <li key={s.id}>{s.nama} ({s.nis})</li>)}
              {targetSiswas.length > 5 && <li>...dan {targetSiswas.length - 5} siswa lainnya.</li>}
            </ul>
          </div>

          {/* Date Filter */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field">
              <label className="field-label">Tanggal Mulai</label>
              <DatePicker value={startDate} onChange={setStartDate} style={{ width: '100%' }} />
            </div>
            <div className="field">
              <label className="field-label">Tanggal Selesai</label>
              <DatePicker value={endDate} onChange={setEndDate} style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        <div className="modal-divider" />

        {/* Footer */}
        <div className="modal-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', padding: '12px 24px' }}>
          <Button onClick={onClose} variant="ghost" disabled={exporting}>Batal</Button>
          <Button onClick={handleExport} disabled={exporting || targetSiswas.length === 0} icon={<Download size={16} />}>
            {exporting ? 'Mengekspor…' : 'Unduh Excel'}
          </Button>
        </div>

      </div>
    </div>,
    document.body
  );
}
