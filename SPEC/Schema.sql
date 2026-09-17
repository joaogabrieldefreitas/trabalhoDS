-- =========================================================
-- ESQUEMA COMPLETO DE BANCO DE DADOS - SISTEMA DE PONTO
-- SUPABASE POSTGRESQL
-- =========================================================

-- 1. LIMPEZA PREVENTIVA (Evita erros ao reexecutar o script)
DROP TYPE IF EXISTS tipo_registro_enum CASCADE;
DROP TYPE IF EXISTS tipo_ocorrencia_enum CASCADE;

-- 2. EXTENSÕES E TIPOS PERSONALIZADOS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE tipo_registro_enum AS ENUM ('ENTRADA', 'SAIDA');
CREATE TYPE tipo_ocorrencia_enum AS ENUM (
    'TENTATIVA_FORA_JANELA_ENTRADA',
    'TENTATIVA_FORA_JANELA_SAIDA',
    'QRCODE_INVALIDO'
);

-- 3. TABELA DE FUNCIONÁRIOS
CREATE TABLE IF NOT EXISTS funcionarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matricula VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    qrcode_hash VARCHAR(64) UNIQUE NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para otimização de busca rápida
CREATE INDEX IF NOT EXISTS idx_funcionarios_qrcode ON funcionarios(qrcode_hash) WHERE ativo = true;
CREATE INDEX IF NOT EXISTS idx_funcionarios_matricula ON funcionarios(matricula);

-- 4. TABELA DE CONFIGURAÇÃO DE JANELAS DE HORÁRIO DO CRACHÁ
CREATE TABLE IF NOT EXISTS janelas_horario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funcionario_id UUID UNIQUE NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
    janela_entrada_inicio TIME NOT NULL, -- Ex: '07:45:00'
    janela_entrada_fim TIME NOT NULL,    -- Ex: '08:00:00'
    janela_saida_inicio TIME NOT NULL,   -- Ex: '17:45:00'
    janela_saida_fim TIME NOT NULL,      -- Ex: '18:00:00'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABELA DE REGISTROS DE PONTO (BATIDAS APROVADAS)
CREATE TABLE IF NOT EXISTS registros_ponto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funcionario_id UUID NOT NULL REFERENCES funcionarios(id) ON DELETE RESTRICT,
    tipo_registro tipo_registro_enum NOT NULL,
    data_hora TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    foto_registro_url TEXT NOT NULL,
    hash_comprovante VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger de Segurança: Garante imutabilidade dos registros de ponto
CREATE OR REPLACE FUNCTION bloquear_alteracao_ponto()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Registros de ponto não podem ser alterados ou excluídos.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bloquear_ponto_mod ON registros_ponto;
CREATE TRIGGER trg_bloquear_ponto_mod
BEFORE UPDATE OR DELETE ON registros_ponto
FOR EACH ROW EXECUTE FUNCTION bloquear_alteracao_ponto();

-- 6. TABELA DE OCORRÊNCIAS (BATIDAS BLOQUEADAS / FORA DE HORÁRIO)
CREATE TABLE IF NOT EXISTS ocorrencias_ponto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funcionario_id UUID REFERENCES funcionarios(id) ON DELETE SET NULL,
    qrcode_lido VARCHAR(100),
    tipo_ocorrencia tipo_ocorrencia_enum NOT NULL,
    data_hora TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    foto_tentativa_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para consultas do painel de RH
CREATE INDEX IF NOT EXISTS idx_ocorrencias_data ON ocorrencias_ponto(data_hora DESC);

-- 7. POLÍTICAS DE SEGURANÇA (Row Level Security - RLS)
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE janelas_horario ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_ponto ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocorrencias_ponto ENABLE ROW LEVEL SECURITY;

-- Limpeza preventiva de políticas para evitar erros de duplicidade
DROP POLICY IF EXISTS "Acesso Leitura Funcionarios" ON funcionarios;
DROP POLICY IF EXISTS "Acesso Leitura Janelas" ON janelas_horario;
DROP POLICY IF EXISTS "Inserir Ponto" ON registros_ponto;
DROP POLICY IF EXISTS "Leitura Ponto" ON registros_ponto;
DROP POLICY IF EXISTS "Inserir Ocorrencias" ON ocorrencias_ponto;
DROP POLICY IF EXISTS "Leitura Ocorrencias" ON ocorrencias_ponto;

-- Criação das políticas RLS
CREATE POLICY "Acesso Leitura Funcionarios" ON funcionarios FOR SELECT USING (true);
CREATE POLICY "Acesso Leitura Janelas" ON janelas_horario FOR SELECT USING (true);
CREATE POLICY "Inserir Ponto" ON registros_ponto FOR INSERT WITH CHECK (true);
CREATE POLICY "Leitura Ponto" ON registros_ponto FOR SELECT USING (true);
CREATE POLICY "Inserir Ocorrencias" ON ocorrencias_ponto FOR INSERT WITH CHECK (true);
CREATE POLICY "Leitura Ocorrencias" ON ocorrencias_ponto FOR SELECT USING (true);
