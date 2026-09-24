# Backlog do Projeto - Sistema de Controle de Ponto com Leitura de QR Code

## Visão Geral
Sistema de Controle de Ponto Autônomo com leitura de QR Code via câmera, validação de janela de horário de trabalho, registro imutável no Supabase, impressão de comprovante (ticket) para registros aprovados e captura de foto com alerta para tentativas fora da janela permitida ou QR Code inválido.

---

## Tópicos e Tarefas (Backlog Granular)

### 1. Infraestrutura e Conectividade
- [x] **1.1. Estrutura Inicial de Diretórios**
  - Criar pastas: `css/`, `js/`, `components/`, `services/`.
- [x] **1.2. Documento de Backlog**
  - Manter e atualizar `backlog.md` na raiz do repositório a cada iteração.
- [ ] **1.3. Configuração do Cliente Supabase**
  - Implementar `js/config.js` instanciando o cliente Supabase via CDN ESM com as credenciais oficiais (`API URL`, `Publishable Key`, `Secret Key`).
  - Implementar camada de serviço em `services/supabaseService.js` para integração com as tabelas:
    - `funcionarios` (`matricula`, `nome`, `qrcode_hash`)
    - `janelas_horario` (`janela_entrada_inicio`, `janela_entrada_fim`, `janela_saida_inicio`, `janela_saida_fim`)
    - `registros_ponto` (registro de ponto imutável)
    - `ocorrencias_ponto` (`tipo_ocorrencia_enum`: `TENTATIVA_FORA_JANELA_ENTRADA`, `TENTATIVA_FORA_JANELA_SAIDA`, `QRCODE_INVALIDO`, foto em base64/url)

### 2. Leitura de QR Code e Captura de Mídia
- [ ] **2.1. Serviço de Leitura de QR Code (`services/qrScannerService.js`)**
  - Integração com biblioteca `jsQR` via CDN.
  - Processamento continuo do canvas/video stream.
  - Leitura do hash contido no QR Code scanned.
- [ ] **2.2. Serviço de Captura de Câmera e Fotos (`services/cameraService.js`)**
  - Inicialização e gerenciamento do fluxo de vídeo do dispositivo (`navigator.mediaDevices.getUserMedia`).
  - Captura instantânea de frame em formato Base64 para anexar às ocorrências de violação de horário ou QR Code inválido.

### 3. Lógica de Negócio e Validação de Ponto
- [ ] **3.1. Validação de Colaborador**
  - Consulta à tabela `funcionarios` pelo `qrcode_hash`.
  - Tratamento de QR Code não cadastrado (registro na tabela `ocorrencias_ponto` como `QRCODE_INVALIDO` com foto).
- [ ] **3.2. Validação de Janela de Horário**
  - Consulta das janelas ativas na tabela `janelas_horario`.
  - Verificação do horário atual vs. janelas permitidas (Ex: Entrada 07:45 às 08:00, Saída etc.).
  - Determinação do tipo de batida (Entrada / Saída).
- [ ] **3.3. Processamento de Batida Aprovada**
  - Gravação do registro imutável na tabela `registros_ponto`.
  - Geração e disparo da impressão do Ticket de Ponto.
  - Exibição de feedback visual positivo com Lucide Icon.
- [ ] **3.4. Processamento de Tentativa Bloqueada**
  - Bloqueio de batida fora da janela.
  - Captura automática de foto da ocorrência.
  - Registro de auditoria na tabela `ocorrencias_ponto` (`TENTATIVA_FORA_JANELA_ENTRADA` ou `TENTATIVA_FORA_JANELA_SAIDA`).
  - Exibição de alerta sonoro/visual na tela com Lucide Icon.

### 4. Interface e Experiência do Usuário (UI/UX)
- [ ] **4.1. Layout HTML5 Semântico (`index.html`)**
  - Estrutura otimizada para Tablets em modo Paisagem (Landscape) e Desktops.
  - Importação de dependências puramente via CDN ESM (`@supabase/supabase-js`, `jsQR`, `Lucide Icons`).
  - Ausência total de emojis na interface (sinalização 100% via Lucide Icons).
- [ ] **4.2. Estilização CSS3 Moderno (`css/styles.css`)**
  - Paleta minimalista: Fundo branco puro (`#ffffff`), bordas suaves (`#e2e8f0`), tipografia neutra e limpa.
  - Estilos de impressão `@media print` para formatação precisa do ticket de ponto.
- [ ] **4.3. Componentes Modulares (`components/`)**
  - `header.js`: Cabeçalho institucional com relógio em tempo real.
  - `scanner.js`: Leitor de vídeo com indicador visual de foco.
  - `ticket.js`: Visualização e leiaute de impressão do comprovante de ponto.
  - `alert.js`: Modal/banner de alertas de erro ou confirmação.

### 5. Testes, Verificação e Garantia de Qualidade
- [ ] **5.1. Testes de Unidade/Serviço**
  - Testar validação de horários (dentro e fora da janela).
  - Testar mapeamento de enums e estrutura de payload do Supabase.
- [ ] **5.2. Testes de Integração e Interface**
  - Testar fluxo completo de batida autorizada e geração de ticket.
  - Testar fluxo de batida bloqueada, foto e gravação em `ocorrencias_ponto`.
- [ ] **5.3. Conformidade Pre-commit**
  - Execução de verificações de qualidade, linters e revisões finais.
