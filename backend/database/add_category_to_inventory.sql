-- Script para adicionar campo category ao inventário
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna category à tabela inventory
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'GERAL';

-- Atualizar itens existentes com categorias baseadas no nome
UPDATE inventory 
SET category = CASE 
  WHEN LOWER(item_name) LIKE '%mesa%' OR LOWER(item_name) LIKE '%cadeira%' OR LOWER(item_name) LIKE '%pano%' OR LOWER(item_name) LIKE '%toalha%' THEN 'SERVICO_GERAL'
  WHEN LOWER(item_name) LIKE '%cabo%' OR LOWER(item_name) LIKE '%camera%' OR LOWER(item_name) LIKE '%microfone%' OR LOWER(item_name) LIKE '%instrumento%' THEN 'AUDIOVISUAL'
  ELSE 'GERAL'
END;

-- Verificar os resultados
SELECT item_name, category FROM inventory ORDER BY category, item_name; 