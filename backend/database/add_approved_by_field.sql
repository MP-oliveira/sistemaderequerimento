-- Adicionar campo approved_by na tabela requests
-- Este campo armazenará o ID do usuário que aprovou a requisição

ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN requests.approved_by IS 'ID do usuário que aprovou a requisição (ADM ou PASTOR)';

-- Criar índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_requests_approved_by ON requests(approved_by);
