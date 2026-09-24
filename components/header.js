/**
 * Componente do Relógio do Cabeçalho
 */
export function initHeaderClock() {
  const clockTimeEl = document.getElementById('clock-time');
  const clockDateEl = document.getElementById('clock-date');

  function update() {
    const now = new Date();
    if (clockTimeEl) {
      clockTimeEl.textContent = now.toLocaleTimeString('pt-BR');
    }
    if (clockDateEl) {
      clockDateEl.textContent = now.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }

  update();
  setInterval(update, 1000);
}
