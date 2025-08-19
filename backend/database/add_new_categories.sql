-- Script para adicionar novas categorias ao inventário
-- Execute este script no Supabase SQL Editor

-- Verificar se as categorias já existem
SELECT DISTINCT category FROM inventory ORDER BY category;

-- Atualizar itens existentes que podem pertencer às novas categorias
-- (opcional - você pode fazer isso manualmente se preferir)

-- Exemplo: Atualizar itens de decoração baseado no nome
UPDATE inventory 
SET category = 'DECORACAO'
WHERE LOWER(name) LIKE '%flor%' 
   OR LOWER(name) LIKE '%vaso%' 
   OR LOWER(name) LIKE '%enfeite%' 
   OR LOWER(name) LIKE '%banner%' 
   OR LOWER(name) LIKE '%faixa%'
   OR LOWER(name) LIKE '%bandeira%'
   OR LOWER(name) LIKE '%balão%'
   OR LOWER(name) LIKE '%arco%'
   OR LOWER(name) LIKE '%cortina%'
   OR LOWER(name) LIKE '%tapete%';

-- Exemplo: Atualizar itens de esportes baseado no nome
UPDATE inventory 
SET category = 'ESPORTES'
WHERE LOWER(name) LIKE '%bola%' 
   OR LOWER(name) LIKE '%rede%' 
   OR LOWER(name) LIKE '%trave%' 
   OR LOWER(name) LIKE '%quadra%' 
   OR LOWER(name) LIKE '%uniforme%'
   OR LOWER(name) LIKE '%chuteira%'
   OR LOWER(name) LIKE '%raquete%'
   OR LOWER(name) LIKE '%taco%'
   OR LOWER(name) LIKE '%luva%'
   OR LOWER(name) LIKE '%capacete%';

-- Verificar os resultados após as atualizações
SELECT category, COUNT(*) as quantidade
FROM inventory 
GROUP BY category 
ORDER BY category;
