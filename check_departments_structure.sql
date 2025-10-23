-- Verificar estrutura da tabela departments existente
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar se a tabela departments existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'departments';

-- 2. Se existir, mostrar a estrutura
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'departments'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Se existir, mostrar os dados atuais
SELECT * FROM departments LIMIT 5;
