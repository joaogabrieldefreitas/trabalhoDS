import { supabase } from '../js/config.js';

/**
 * Busca funcionário pelo Hash do QR Code
 * @param {string} qrCodeHash 
 * @returns {Promise<Object|null>}
 */
export async function buscarFuncionarioPorQrCode(qrCodeHash) {
  try {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('qrcode_hash', qrCodeHash)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar funcionário:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Exceção ao buscar funcionário:', err);
    return null;
  }
}

/**
 * Obtém as janelas de horário cadastradas no sistema
 * @returns {Promise<Array>}
 */
export async function obterJanelasHorario() {
  try {
    const { data, error } = await supabase
      .from('janelas_horario')
      .select('*');

    if (error) {
      console.error('Erro ao obter janelas de horário:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Exceção ao obter janelas de horário:', err);
    return [];
  }
}

/**
 * Registra a batida de ponto na tabela imutável 'registros_ponto'
 * @param {Object} registro 
 * @returns {Promise<{success: boolean, data?: Object, error?: any}>}
 */
export async function registrarPonto(registro) {
  try {
    const { data, error } = await supabase
      .from('registros_ponto')
      .insert([registro])
      .select();

    if (error) {
      console.error('Erro ao registrar ponto:', error);
      return { success: false, error };
    }
    return { success: true, data: data ? data[0] : registro };
  } catch (err) {
    console.error('Exceção ao registrar ponto:', err);
    return { success: false, error: err };
  }
}

/**
 * Registra ocorrência de auditoria na tabela 'ocorrencias_ponto'
 * @param {Object} ocorrencia 
 * @returns {Promise<{success: boolean, data?: Object, error?: any}>}
 */
export async function registrarOcorrencia(ocorrencia) {
  try {
    const { data, error } = await supabase
      .from('ocorrencias_ponto')
      .insert([ocorrencia])
      .select();

    if (error) {
      console.error('Erro ao registrar ocorrência:', error);
      return { success: false, error };
    }
    return { success: true, data: data ? data[0] : ocorrencia };
  } catch (err) {
    console.error('Exceção ao registrar ocorrência:', err);
    return { success: false, error: err };
  }
}
