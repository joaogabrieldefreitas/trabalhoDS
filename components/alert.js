/**
 * Componente do Painel de Alertas de Ocorrência
 */
export function renderAlert(tipoOcorrencia, fotoBase64, mensagemCustom) {
  const alertTitleEl = document.getElementById('alert-title');
  const alertMsgEl = document.getElementById('alert-message');
  const alertBadgeEl = document.getElementById('alert-badge-type');
  const photoContainer = document.getElementById('alert-photo-container');
  const photoImg = document.getElementById('alert-photo-img');

  if (alertBadgeEl) {
    alertBadgeEl.textContent = tipoOcorrencia;
  }

  if (tipoOcorrencia === 'QRCODE_INVALIDO') {
    if (alertTitleEl) alertTitleEl.textContent = 'QR Code Inválido ou Não Cadastrado';
    if (alertMsgEl) alertMsgEl.textContent = mensagemCustom || 'O código Lido não pertence a nenhum colaborador ativo na base de dados.';
  } else if (tipoOcorrencia === 'TENTATIVA_FORA_JANELA_ENTRADA') {
    if (alertTitleEl) alertTitleEl.textContent = 'Bloqueado: Fora do Horário de Entrada';
    if (alertMsgEl) alertMsgEl.textContent = mensagemCustom || 'Tentativa de registro fora da janela permitida para Entrada.';
  } else if (tipoOcorrencia === 'TENTATIVA_FORA_JANELA_SAIDA') {
    if (alertTitleEl) alertTitleEl.textContent = 'Bloqueado: Fora do Horário de Saída';
    if (alertMsgEl) alertMsgEl.textContent = mensagemCustom || 'Tentativa de registro fora da janela permitida para Saída.';
  } else {
    if (alertTitleEl) alertTitleEl.textContent = 'Tentativa Recusada';
    if (alertMsgEl) alertMsgEl.textContent = mensagemCustom || 'Não foi possível registrar o ponto no momento.';
  }

  if (fotoBase64 && photoContainer && photoImg) {
    photoImg.src = fotoBase64;
    photoContainer.classList.remove('hidden');
  } else if (photoContainer) {
    photoContainer.classList.add('hidden');
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}
