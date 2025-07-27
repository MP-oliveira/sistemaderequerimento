-- Adicionar colunas para retorno de instrumentos na tabela requests
ALTER TABLE requests ADD COLUMN IF NOT EXISTS status_history jsonb;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS returned_at timestamp with time zone;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS returned_by uuid;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS return_notes text;

-- Adicionar colunas para retorno de instrumentos na tabela request_items
ALTER TABLE request_items ADD COLUMN IF NOT EXISTS is_separated boolean DEFAULT false;
ALTER TABLE request_items ADD COLUMN IF NOT EXISTS separated_by uuid;
ALTER TABLE request_items ADD COLUMN IF NOT EXISTS separated_at timestamp with time zone;
ALTER TABLE request_items ADD COLUMN IF NOT EXISTS is_returned boolean DEFAULT false;
ALTER TABLE request_items ADD COLUMN IF NOT EXISTS returned_by uuid;
ALTER TABLE request_items ADD COLUMN IF NOT EXISTS returned_at timestamp with time zone;

-- Adicionar coluna para disponibilidade no inventário
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true;

-- Adicionar comentários para documentação
COMMENT ON COLUMN requests.returned_at IS 'Data/hora do retorno dos instrumentos';
COMMENT ON COLUMN requests.returned_by IS 'ID do usuário que retornou os instrumentos';
COMMENT ON COLUMN requests.return_notes IS 'Observações do retorno dos instrumentos'; 