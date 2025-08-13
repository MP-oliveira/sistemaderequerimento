-- Criar tabela para serviços solicitados
CREATE TABLE IF NOT EXISTS request_services (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- DIACONIA, SERVICO_GERAL, AUDIOVISUAL, SEGURANCA
    quantidade INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_request_services_request_id ON request_services(request_id);
CREATE INDEX IF NOT EXISTS idx_request_services_tipo ON request_services(tipo);

-- Adicionar comentários para documentação
COMMENT ON TABLE request_services IS 'Tabela para armazenar serviços solicitados em cada requisição';
COMMENT ON COLUMN request_services.tipo IS 'Tipo do serviço: DIACONIA, SERVICO_GERAL, AUDIOVISUAL, SEGURANCA';
COMMENT ON COLUMN request_services.quantidade IS 'Quantidade de pessoas necessárias para o serviço';
COMMENT ON COLUMN request_services.nome IS 'Nome amigável do serviço';
