
export function drawKtsCard(canvas, { nis, nama, kelasNama, qrToken }, callback) {
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.onload = () => {
    // Set canvas dimensions to match template image dimensions (1300x813)
    canvas.width = 1300;
    canvas.height = 813;
    
    // 1. Draw template background
    ctx.drawImage(img, 0, 0, 1300, 813);

    // 2. Generate QR code on a temporary canvas or element
    const qrCanvas = document.createElement('canvas');
    import('qrcode').then((QRCodeLib) => {
      const QRCode = QRCodeLib.default || QRCodeLib;
      QRCode.toCanvas(qrCanvas, qrToken, {
        width: 380,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      }, (err) => {
        if (err) {
          console.error(err);
          // Fallback to simple draw background
          if (callback) callback();
          return;
        }

        // 3. Composite QR code onto the template at the exact detected center coordinates:
        // Center of container is (247.5, 442)
        // Top-left corner of 380x380 QR is:
        const posX = Math.round(247.5 - 380 / 2); // 58
        const posY = Math.round(442 - 380 / 2); // 252

        ctx.drawImage(qrCanvas, posX, posY, 380, 380);

        if (callback) callback();
      });
    }).catch(err => {
      console.error(err);
      if (callback) callback();
    });
  };
  img.src = '/template_kartu.jpg';
}
