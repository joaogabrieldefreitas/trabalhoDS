/**
 * Utilitários para Validação de Horários e Janelas de Ponto
 */

/**
 * Converte string no formato "HH:MM" ou "HH:MM:SS" para minutos totais desde a meia-noite
 * @param {string} timeStr 
 * @returns {number}
 */
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Avalia se o horário atual está dentro de alguma janela cadastrada
 * @param {Date} nowData 
 * @param {Array} janelas Horários da tabela janelas_horario
 * @returns {{
 *   valido: boolean,
 *   tipo?: 'ENTRADA'|'SAIDA',
 *   tipoOcorrencia?: 'TENTATIVA_FORA_JANELA_ENTRADA'|'TENTATIVA_FORA_JANELA_SAIDA',
 *   janelaEncontrada?: Object
 * }}
 */
export function validarJanelaHorario(nowData, janelas) {
  const currentMinutes = nowData.getHours() * 60 + nowData.getMinutes();

  if (!janelas || janelas.length === 0) {
    // Caso não haja janelas configuradas, por padrão considera das 07:45 às 08:00 (entrada) e 17:00 às 18:00 (saída)
    janelas = [{
      janela_entrada_inicio: '07:45:00',
      janela_entrada_fim: '08:00:00',
      janela_saida_inicio: '17:00:00',
      janela_saida_fim: '18:00:00'
    }];
  }

  for (const janela of janelas) {
    const entradaInicio = timeToMinutes(janela.janela_entrada_inicio);
    const entradaFim = timeToMinutes(janela.janela_entrada_fim);
    const saidaInicio = timeToMinutes(janela.janela_saida_inicio);
    const saidaFim = timeToMinutes(janela.janela_saida_fim);

    // Valida Janela de Entrada
    if (currentMinutes >= entradaInicio && currentMinutes <= entradaFim) {
      return { valido: true, tipo: 'ENTRADA', janelaEncontrada: janela };
    }

    // Valida Janela de Saída
    if (currentMinutes >= saidaInicio && currentMinutes <= saidaFim) {
      return { valido: true, tipo: 'SAIDA', janelaEncontrada: janela };
    }
  }

  // Se não esteve em nenhuma janela, determina se a tentativa mais próxima/provável foi Entrada ou Saída
  const primeiraJanela = janelas[0];
  const entradaInicio = timeToMinutes(primeiraJanela.janela_entrada_inicio);
  const entradaFim = timeToMinutes(primeiraJanela.janela_entrada_fim);
  const saidaInicio = timeToMinutes(primeiraJanela.janela_saida_inicio);

  // Se for antes do horário de saída ou próximo da entrada, marca como entrada
  const ehTentativaEntrada = currentMinutes < saidaInicio;

  return {
    valido: false,
    tipoOcorrencia: ehTentativaEntrada ? 'TENTATIVA_FORA_JANELA_ENTRADA' : 'TENTATIVA_FORA_JANELA_SAIDA'
  };
}
