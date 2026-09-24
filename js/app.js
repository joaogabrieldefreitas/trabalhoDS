import { initHeaderClock } from '../components/header.js';
import { renderTicket } from '../components/ticket.js';
import { renderAlert } from '../components/alert.js';
import { CameraService } from '../services/cameraService.js';
import { QrScannerService } from '../services/qrScannerService.js';
import { validarJanelaHorario } from '../services/windowService.js';
import { 
  buscarFuncionarioPorQrCode, 
  obterJanelasHorario, 
  registrarPonto, 
  registrarOcorrencia 
} from '../services/supabaseService.js';

// Estado Global da Aplicação
let cameraService = null;
let qrScannerService = null;
let janelasHorarioCache = [];
let isBusy = false;

// Elementos DOM
const videoElement = document.getElementById('webcam-video');
const canvasElement = document.getElementById('qr-canvas');
const manualInputEl = document.getElementById('manual-qr-input');
const btnManualSubmit = document.getElementById('btn-manual-submit');
const windowInfoEl = document.getElementById('time-window-info');

// Cards de Estado
const statusIdleCard = document.getElementById('status-idle');
const statusProcessingCard = document.getElementById('status-processing');
const statusAlertCard = document.getElementById('status-alert');
const statusTicketCard = document.getElementById('status-ticket');

// Botões de Ação
const btnResetAlert = document.getElementById('btn-reset-alert');
const btnPrintTicket = document.getElementById('btn-print-ticket');
const btnFinishTicket = document.getElementById('btn-finish-ticket');

/**
 * Inicialização do Sistema
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Inicializa Relógio
  initHeaderClock();

  // Inicializa Ícones Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Carrega Janelas de Horário
  await carregarJanelas();

  // Inicializa Câmera e Scanner
  cameraService = new CameraService(videoElement, canvasElement);
  const cameraIniciada = await cameraService.start();

  if (cameraIniciada) {
    qrScannerService = new QrScannerService(videoElement, canvasElement, processarQrCodeScanned);
    qrScannerService.startScanning();
  } else {
    console.warn('Câmera indisponível ou permissão negada. Utilize a entrada manual para testes.');
  }

  // Event Listeners
  if (btnManualSubmit && manualInputEl) {
    btnManualSubmit.addEventListener('click', () => {
      const code = manualInputEl.value.trim();
      if (code) {
        processarQrCodeScanned(code);
      }
    });

    manualInputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const code = manualInputEl.value.trim();
        if (code) {
          processarQrCodeScanned(code);
        }
      }
    });
  }

  if (btnResetAlert) {
    btnResetAlert.addEventListener('click', resetarParaIdle);
  }

  if (btnFinishTicket) {
    btnFinishTicket.addEventListener('click', resetarParaIdle);
  }

  if (btnPrintTicket) {
    btnPrintTicket.addEventListener('click', () => {
      window.print();
    });
  }
});

/**
 * Carrega e exibe as janelas de horário vigentes
 */
async function carregarJanelas() {
  janelasHorarioCache = await obterJanelasHorario();
  if (windowInfoEl) {
    if (janelasHorarioCache.length > 0) {
      const j = janelasHorarioCache[0];
      const entradaStr = `${j.janela_entrada_inicio?.slice(0, 5)} - ${j.janela_entrada_fim?.slice(0, 5)}`;
      const saidaStr = j.janela_saida_inicio ? ` | Saída: ${j.janela_saida_inicio?.slice(0, 5)} - ${j.janela_saida_fim?.slice(0, 5)}` : '';
      windowInfoEl.innerHTML = `<i data-lucide="clock" class="inline-icon"></i> <span>Janela Ativa: Entrada (${entradaStr})${saidaStr}</span>`;
    } else {
      windowInfoEl.innerHTML = `<i data-lucide="clock" class="inline-icon"></i> <span>Janela Padronizada: Entrada (07:45 - 08:00)</span>`;
    }
    if (window.lucide) window.lucide.createIcons();
  }
}

/**
 * Fluxo Principal de Processamento do QR Code
 * @param {string} qrCodeHash 
 */
async function processarQrCodeScanned(qrCodeHash) {
  if (isBusy) return;
  isBusy = true;

  if (qrScannerService) {
    qrScannerService.setCooldown(4000);
  }

  exibirEstado('processing');

  try {
    // 1. Busca Funcionário no Supabase
    const funcionario = await buscarFuncionarioPorQrCode(qrCodeHash);

    if (!funcionario) {
      // Ocorrência: QR CODE INVÁLIDO
      const foto = cameraService ? cameraService.capturePhoto() : null;
      await registrarOcorrencia({
        tipo_ocorrencia: 'QRCODE_INVALIDO',
        detalhes: `QR Code lido não cadastrado: ${qrCodeHash}`,
        foto_base64: foto,
        created_at: new Date().toISOString()
      });

      renderAlert('QRCODE_INVALIDO', foto, `O código '${qrCodeHash}' não corresponde a nenhum colaborador cadastrado.`);
      exibirEstado('alert');
      isBusy = false;
      return;
    }

    // 2. Valida Janela de Horário
    const agora = new Date();
    const resultadoJanela = validarJanelaHorario(agora, janelasHorarioCache);

    if (resultadoJanela.valido) {
      // BATIDA APROVADA!
      const novoRegistro = {
        funcionario_id: funcionario.id,
        matricula: funcionario.matricula,
        nome_funcionario: funcionario.nome,
        tipo: resultadoJanela.tipo || 'ENTRADA',
        data_hora: agora.toISOString(),
        created_at: agora.toISOString()
      };

      const respInsert = await registrarPonto(novoRegistro);
      const registroFinal = respInsert.data || novoRegistro;

      renderTicket(registroFinal, funcionario);
      exibirEstado('ticket');
    } else {
      // BATIDA BLOQUEADA - FORA DA JANELA
      const foto = cameraService ? cameraService.capturePhoto() : null;
      const tipoOcorrencia = resultadoJanela.tipoOcorrencia || 'TENTATIVA_FORA_JANELA_ENTRADA';

      await registrarOcorrencia({
        funcionario_id: funcionario.id,
        matricula: funcionario.matricula,
        tipo_ocorrencia: tipoOcorrencia,
        detalhes: `Tentativa de batida fora da janela permitida às ${agora.toLocaleTimeString('pt-BR')}`,
        foto_base64: foto,
        created_at: agora.toISOString()
      });

      renderAlert(tipoOcorrencia, foto, `Colaborador: ${funcionario.nome} (Matrícula: ${funcionario.matricula}). Batida bloqueada pois o horário atual (${agora.toLocaleTimeString('pt-BR')}) está fora da janela autorizada.`);
      exibirEstado('alert');
    }

  } catch (error) {
    console.error('Erro no processamento da batida:', error);
    renderAlert('ERRO_SISTEMA', null, 'Ocorreu um erro ao processar o registro. Tente novamente.');
    exibirEstado('alert');
  } finally {
    isBusy = false;
  }
}

/**
 * Alterna visibilidade dos cards conforme estado
 * @param {'idle'|'processing'|'alert'|'ticket'} estado 
 */
function exibirEstado(estado) {
  statusIdleCard?.classList.add('hidden');
  statusProcessingCard?.classList.add('hidden');
  statusAlertCard?.classList.add('hidden');
  statusTicketCard?.classList.add('hidden');

  if (estado === 'idle') statusIdleCard?.classList.remove('hidden');
  if (estado === 'processing') statusProcessingCard?.classList.remove('hidden');
  if (estado === 'alert') statusAlertCard?.classList.remove('hidden');
  if (estado === 'ticket') statusTicketCard?.classList.remove('hidden');

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Reseta a tela para o estado neutro/idle
 */
function resetarParaIdle() {
  if (manualInputEl) manualInputEl.value = '';
  exibirEstado('idle');
}
