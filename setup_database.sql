-- Script para configurar o banco de dados com locais e departamentos
-- Execute este SQL no Supabase SQL Editor

-- 1. Criar tabela de locais (se não existir)
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Verificar estrutura da tabela departments existente
-- (Não vamos criar, apenas usar a estrutura existente)

-- 3. Inserir todos os locais
INSERT INTO locations (name, description, is_active) VALUES
  ('Templo', 'Templo principal da igreja', true),
  ('Anexo 1 - Salão', 'Salão do Anexo 1 (Andar 0)', true),
  ('Anexo 1 - Sala 11', 'Sala 11 do Anexo 1 (Andar 1)', true),
  ('Anexo 1 - Sala 12', 'Sala 12 do Anexo 1 (Andar 1)', true),
  ('Anexo 1 - Biblioteca', 'Biblioteca - Sala 15 do Anexo 1 (Andar 1)', true),
  ('Anexo 1 - Sala 16', 'Sala 16 do Anexo 1 (Andar 1)', true),
  ('Anexo 1 - Sala 22', 'Sala 22 do Anexo 1 (Andar 2)', true),
  ('Anexo 1 - Sala 23', 'Sala 23 do Anexo 1 (Andar 2)', true),
  ('Anexo 1 - Sala 24', 'Sala 24 do Anexo 1 (Andar 2)', true),
  ('Anexo 1 - Sala 26', 'Sala 26 do Anexo 1 (Andar 2)', true),
  ('Anexo 1 - Sala 27', 'Sala 27 do Anexo 1 (Andar 2)', true),
  ('Anexo 2 - Salão', 'Salão do Anexo 2 (Andar 0)', true),
  ('Anexo 2 - Sala 11', 'Sala 11 do Anexo 2 (Andar 1)', true),
  ('Anexo 2 - Sala 12', 'Sala 12 do Anexo 2 (Andar 1)', true),
  ('Anexo 2 - Sala 13', 'Sala 13 do Anexo 2 (Andar 1)', true),
  ('Anexo 2 - Sala 14', 'Sala 14 do Anexo 2 (Andar 1)', true),
  ('Anexo 2 - Sala 15', 'Sala 15 do Anexo 2 (Andar 1)', true),
  ('Anexo 2 - Sala 16', 'Sala 16 do Anexo 2 (Andar 1)', true),
  ('Anexo 2 - Sala 17', 'Sala 17 do Anexo 2 (Andar 1)', true),
  ('Anexo 2 - Sala 21', 'Sala 21 do Anexo 2 (Andar 2)', true),
  ('Anexo 2 - Sala 22', 'Sala 22 do Anexo 2 (Andar 2)', true),
  ('Anexo 2 - Sala 23', 'Sala 23 do Anexo 2 (Andar 2)', true),
  ('Anexo 2 - Sala 24', 'Sala 24 do Anexo 2 (Andar 2)', true),
  ('Anexo 2 - Sala 25', 'Sala 25 do Anexo 2 (Andar 2)', true),
  ('Anexo 2 - Sala 26', 'Sala 26 do Anexo 2 (Andar 2)', true),
  ('Anexo 2 - Sala 27', 'Sala 27 do Anexo 2 (Andar 2)', true),
  ('Anexo 2 - Sala 31', 'Sala 31 do Anexo 2 (Andar 3)', true),
  ('Anexo 2 - Sala 32', 'Sala 32 do Anexo 2 (Andar 3)', true),
  ('Estúdio', 'Estúdio de gravação e produção', true),
  ('Copa', 'Copa da igreja', true),
  ('Outro', 'Outro local não especificado', true)
ON CONFLICT (name) DO NOTHING;

-- 4. Inserir todos os departamentos
INSERT INTO departments (nome, prioridade) VALUES
  ('Diaconia', 'Média'),
  ('Serviços Gerais', 'Média'),
  ('Audiovisual', 'Média'),
  ('Segurança', 'Média')
ON CONFLICT (nome) DO NOTHING;

-- 5. Verificar se os dados foram inseridos
SELECT 'Locais inseridos:' as info, COUNT(*) as total FROM locations;
SELECT 'Departamentos inseridos:' as info, COUNT(*) as total FROM departments;

-- 6. Listar todos os locais
SELECT id, name, description FROM locations ORDER BY name;

-- 7. Listar todos os departamentos
SELECT id, nome, prioridade FROM departments ORDER BY nome;
