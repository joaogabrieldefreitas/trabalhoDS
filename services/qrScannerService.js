import jsQR from 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/+esm';

/**
 * Serviço de Leitura e Decodificação de QR Code
 */
export class QrScannerService {
  constructor(videoElement, canvasElement, onScanCallback) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.onScanCallback = onScanCallback;
    this.isScanning = false;
    this.animationFrameId = null;
    this.cooldown = false;
  }

  startScanning() {
    if (this.isScanning) return;
    this.isScanning = true;
    this.scanLoop();
  }

  stopScanning() {
    this.isScanning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  setCooldown(ms = 3000) {
    this.cooldown = true;
    setTimeout(() => {
      this.cooldown = false;
    }, ms);
  }

  scanLoop() {
    if (!this.isScanning) return;

    if (this.videoElement.readyState === this.videoElement.HAVE_ENOUGH_DATA) {
      if (!this.cooldown) {
        const width = this.videoElement.videoWidth;
        const height = this.videoElement.videoHeight;

        this.canvasElement.width = width;
        this.canvasElement.height = height;

        const ctx = this.canvasElement.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(this.videoElement, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          this.onScanCallback(code.data);
        }
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this.scanLoop());
  }
}
