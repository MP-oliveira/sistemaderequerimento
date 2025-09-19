-- Adicionar campo end_date na tabela requests
-- Este campo será usado para eventos que duram múltiplos dias

ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN requests.end_date IS 'Data final do evento (para eventos de múltiplos dias)';

-- Criar índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_requests_end_date ON requests(end_date);
