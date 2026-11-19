let mediaStream = null;
let scanTimer = null;

export function normalizeQrText(rawText) {
  return String(rawText || '').trim();
}

export function isBasicQrValid(qrText) {
  const cleaned = normalizeQrText(qrText);
  return cleaned.length >= 2 && cleaned.length <= 256;
}

export function isBarcodeDetectorSupported() {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window;
}

export async function startQrCamera(videoElement, onDetected, onStatusChange) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Browser tidak mendukung akses kamera. Gunakan input/tempel QR text.');
  }

  mediaStream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' },
    audio: false
  });
  videoElement.srcObject = mediaStream;
  await videoElement.play();

  if (!isBarcodeDetectorSupported()) {
    onStatusChange('Kamera aktif, tetapi pemindaian otomatis tidak didukung browser ini. Gunakan pemindai fisik atau tempel QR text pada kolom input.');
    return;
  }

  const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
  onStatusChange('Arahkan kamera ke QR Code siswa...');

  scanTimer = window.setInterval(async () => {
    if (!videoElement || videoElement.readyState < 2) return;
    try {
      const barcodes = await detector.detect(videoElement);
      if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
        const value = normalizeQrText(barcodes[0].rawValue);
        if (value) {
          onDetected(value);
        }
      }
    } catch (_) {
      // Abaikan frame yang gagal didekode
    }
  }, 450);
}

export function stopQrCamera(videoElement) {
  if (scanTimer) {
    clearInterval(scanTimer);
    scanTimer = null;
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  if (videoElement) {
    videoElement.srcObject = null;
  }
}
