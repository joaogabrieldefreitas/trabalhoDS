# SPEC PRINCIPAL - SISTEMA DE CONTROLE DE PONTO E OCORRÊNCIAS VIA CRACHÁ (QR CODE)

## 1. INSTRUÇÕES PARA O AGENTE DE IA (GOOGLE JULES)

> **ATENÇÃO:** O agente de IA deve seguir estas diretrizes com rigor estrito antes e durante qualquer escrita de código.

1. **Regra de Dúvida Zero:** Se houver qualquer dúvida, requisito ambíguo, falta de parâmetro ou inconsistência durante o desenvolvimento, **NÃO CODIFIQUE**. Pare imediatamente e solicite esclarecimento ao desenvolvedor responsável.
2. **Decomposição em Tarefas:** Programações extensas ou módulos complexos devem ser obrigatoriamente divididos em tarefas e subtarefas menores antes da implementação.
3. **Registro do Backlog (`backlog.md`):** É obrigatório criar e manter atualizado o arquivo `backlog.md` na raiz do repositório. Cada funcionalidade criada, refatorada ou corrigida deve ser registrada com data, descrição da mudança e status.

---

## 2. STACK TECNOLÓGICA E ARQUITETURA

- **Agente de IA / Executador:** Google Jules
- **Hospedagem & Repositório:** GitHub (GitHub Pages para execução do cliente)
- **Banco de Dados & Storage:** Supabase (PostgreSQL acessado exclusivamente via REST API e SDK ESM Client)
- **Linguagens:** HTML5 Semântico, CSS3 Moderno, JavaScript Vanilla (ES6 Modules)
- **Gerenciadores de Pacote / Bundlers:** NENHUM (Proibido uso de Node.js, npm, webpack ou Composer).

### Bibliotecas Permitidas (para redução de código e mitigação de erros)
As bibliotecas devem ser importadas unicamente via CDN em formato ESM (`<script type="module">` ou `import` direto no JS):
1. **Supabase JS Client (`@supabase/supabase-js`):** Para comunicação segura e abstração de requisições à API REST do Supabase.
2. **jsQR (`jsqr`):** Para leitura e decodificação precisa e resiliente de QR Codes a partir dos frames do `<canvas>`.
3. **Lucide Icons (`lucide`):** Para renderização de ícones vetoriais limpos e padronizados.

---

## 3. ESPECIFICAÇÃO DE INTERFACE E DESIGN (UI / UX)

- **Público-Alvo e Dispositivos:** Interface otimizada exclusivamente para uso em **Tablets (Modo Paisagem)** ou **Desktops**.
- **Visual:** Interface extremamente limpa, minimalista, com **fundo predominantemente branco (`#ffffff`)**, bordas suaves (`#e2e8f0`) e contraste alto para legibilidade.
- **Proibição de Emojis:** É estritamente **PROIBIDO** o uso de emojis na interface do usuário. Todas as sinalizações (sucesso, erro, avisos, ações) devem ser feitas via **Lucide Icons**.
- **APIs Nativas do Navegador:** Uso exclusivo e restrito da **Web MediaDevices API** (`navigator.mediaDevices.getUserMedia`) para acesso à câmera e captura de imagem via `<canvas>`.

---

## 4. ESTRUTURA DO PROJETO NO GITHUB

```text
/
├── index.html              # Interface do Terminal de Ponto (Kiosk Tablet)
├── admin.html              # Painel do RH (Relatórios e Ocorrências)
├── backlog.md              # Documento de registro continuo do agente de IA
├── css/
│   ├── main.css            # Variáveis CSS, layout limpo e fundo branco
│   └── components.css      # Estilos de cards, botões, modais e alertas
└── js/
    ├── app.js              # Ponto de entrada da aplicação Kiosk
    ├── config.js           # Credenciais e conexões Supabase
    ├── services/
    │   ├── camera.js       # Gerenciamento da câmera W3C e Canvas
    │   ├── qrcode.js       # Leitura de QR Code via jsQR
    │   ├── supabase.js     # Integração com Banco e Storage
    │   └── tolerance.js    # Regra de validação de janelas de horário
    └── components/
        ├── ticket.js       # Formatação do comprovante em HTML para impressão
        └── icons.js        # Inicializador do Lucide Icons
