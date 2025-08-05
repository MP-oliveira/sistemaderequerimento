-- Script para adicionar campos de prioridade
-- Execute este script no Supabase SQL Editor

-- Adicionar campo prioridade na tabela departments
ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS prioridade TEXT DEFAULT 'Média';

-- Adicionar campo prioridade na tabela requests
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS prioridade TEXT DEFAULT 'Média';

-- Adicionar campo prioridade na tabela events (se existir)
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS prioridade TEXT DEFAULT 'Média';

-- Atualizar departamentos existentes com prioridades padrão
UPDATE departments 
SET prioridade = 'Média' 
WHERE prioridade IS NULL;

-- Atualizar requisições existentes com prioridades padrão
UPDATE requests 
SET prioridade = 'Média' 
WHERE prioridade IS NULL;

-- Atualizar eventos existentes com prioridades padrão
UPDATE events 
SET prioridade = 'Média' 
WHERE prioridade IS NULL;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_departments_prioridade ON departments(prioridade);
CREATE INDEX IF NOT EXISTS idx_requests_prioridade ON requests(prioridade);
CREATE INDEX IF NOT EXISTS idx_events_prioridade ON events(prioridade); 