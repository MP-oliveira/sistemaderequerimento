-- Script alternativo para adicionar o role SERVICO_GERAL
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos descobrir o nome correto do tipo enum
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- Verificar todos os tipos enum existentes
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
ORDER BY t.typname, e.enumsortorder;

-- Verificar a constraint específica
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND contype = 'c'
AND conname LIKE '%role%';

-- Abordagem alternativa: remover a constraint e recriar
-- (Execute apenas se a primeira abordagem não funcionar)

-- 1. Remover a constraint
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Adicionar o novo valor ao enum (substitua 'nome_do_enum' pelo nome correto)
-- ALTER TYPE nome_do_enum ADD VALUE 'SERVICO_GERAL';

-- 3. Recriar a constraint
-- ALTER TABLE users ADD CONSTRAINT users_role_check 
-- CHECK (role IN ('USER', 'LIDER', 'SEC', 'AUDIOVISUAL', 'PASTOR', 'ADM', 'SERVICO_GERAL')); 