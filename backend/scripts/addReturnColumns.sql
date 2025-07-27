-- Adicionar colunas para retorno de instrumentos
ALTER TABLE requests ADD COLUMN IF NOT EXISTS returned_at timestamp with time zone;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS returned_by uuid;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS return_notes text;

-- Adicionar comentários para documentação
COMMENT ON COLUMN requests.returned_at IS 'Data/hora do retorno dos instrumentos';
COMMENT ON COLUMN requests.returned_by IS 'ID do usuário que retornou os instrumentos';
COMMENT ON COLUMN requests.return_notes IS 'Observações do retorno dos instrumentos'; 