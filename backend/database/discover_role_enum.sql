-- Script para descobrir o nome correto do tipo enum do campo role
-- Execute este script no Supabase SQL Editor

-- Verificar a estrutura da tabela users
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- Verificar se existe algum tipo enum relacionado
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%role%' OR t.typname LIKE '%user%'
ORDER BY t.typname, e.enumsortorder;

-- Verificar constraints da tabela users
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND contype = 'c'; 