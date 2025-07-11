-- Tabela para armazenar comprovantes das requisições
CREATE TABLE IF NOT EXISTS request_comprovantes (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  description TEXT,
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_request_comprovantes_request_id ON request_comprovantes(request_id);
CREATE INDEX IF NOT EXISTS idx_request_comprovantes_uploaded_by ON request_comprovantes(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_request_comprovantes_created_at ON request_comprovantes(created_at);

-- Comentários para documentação
COMMENT ON TABLE request_comprovantes IS 'Tabela para armazenar comprovantes anexados às requisições';
COMMENT ON COLUMN request_comprovantes.request_id IS 'ID da requisição à qual o comprovante pertence';
COMMENT ON COLUMN request_comprovantes.filename IS 'Nome do arquivo salvo no servidor';
COMMENT ON COLUMN request_comprovantes.original_name IS 'Nome original do arquivo enviado pelo usuário';
COMMENT ON COLUMN request_comprovantes.file_path IS 'Caminho completo do arquivo no servidor';
COMMENT ON COLUMN request_comprovantes.file_size IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN request_comprovantes.mime_type IS 'Tipo MIME do arquivo';
COMMENT ON COLUMN request_comprovantes.description IS 'Descrição opcional do comprovante';
COMMENT ON COLUMN request_comprovantes.uploaded_by IS 'ID do usuário que enviou o comprovante'; 