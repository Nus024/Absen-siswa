// ============================================================
// features/qr/QRGenerator.js — Generate QR code data URL
// ============================================================
import QRCode from 'qrcode';

export async function generateQRDataUrl(qrToken, size = 300) {
  return QRCode.toDataURL(`SISWA:${qrToken}`, {
    width: size,
    margin: 1,
    color: { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  });
}

export async function generateQRBatch(siswas) {
  return Promise.all(siswas.map(async (s) => ({
    ...s,
    qrDataUrl: await generateQRDataUrl(s.qr_token),
  })));
}
