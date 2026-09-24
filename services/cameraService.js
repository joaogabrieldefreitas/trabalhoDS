/**
 * Serviço de Gerenciamento da Câmera do Dispositivo
 */
export class CameraService {
  constructor(videoElement, canvasElement) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.stream = null;
  }

  /**
   * Inicializa o fluxo de vídeo da câmera
   */
  async start() {
    if (this.stream) return true;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();
      return true;
    } catch (error) {
      console.error('Erro ao acessar a câmera:', error);
      return false;
    }
  }

  /**
   * Para o fluxo da câmera
   */
  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  /**
   * Captura uma foto do frame atual do vídeo em formato Data URL (Base64)
   * @returns {string|null} Base64 da imagem JPEG
   */
  capturePhoto() {
    if (!this.videoElement || !this.canvasElement) return null;
    const video = this.videoElement;
    const canvas = this.canvasElement;

    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 0.8);
  }
}
