/**
 * Componente do Comprovante (Ticket)
 */
export function renderTicket(pontoData, funcionarioData) {
  const nomeEl = document.getElementById('ticket-nome');
  const matriculaEl = document.getElementById('ticket-matricula');
  const datetimeEl = document.getElementById('ticket-datetime');
  const tipoEl = document.getElementById('ticket-tipo');
  const idEl = document.getElementById('ticket-id');

  if (nomeEl) nomeEl.textContent = funcionarioData.nome || '--';
  if (matriculaEl) matriculaEl.textContent = funcionarioData.matricula || '--';
  
  const dataHora = pontoData.created_at ? new Date(pontoData.created_at) : new Date();
  if (datetimeEl) datetimeEl.textContent = dataHora.toLocaleString('pt-BR');
  
  if (tipoEl) tipoEl.textContent = pontoData.tipo || 'ENTRADA';
  if (idEl) idEl.textContent = `ID: ${pontoData.id || Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  // Atualiza ícones Lucide no ticket se houver
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
