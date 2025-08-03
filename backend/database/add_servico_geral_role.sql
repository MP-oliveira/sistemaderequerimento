-- Script para adicionar o role SERVICO_GERAL ao enum
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos verificar o tipo atual do enum
SELECT unnest(enum_range(NULL::role_enum)) as roles_existentes;

-- Adicionar o novo valor ao enum
ALTER TYPE role_enum ADD VALUE 'SERVICO_GERAL';

-- Verificar se foi adicionado corretamente
SELECT unnest(enum_range(NULL::role_enum)) as roles_apos_adicao; 