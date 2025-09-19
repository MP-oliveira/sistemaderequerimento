-- Criar tabela de favoritos para requerimentos
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Nome personalizado para o favorito (ex: "Congresso Missionário 2024")
    custom_name VARCHAR(255),
    
    -- Descrição opcional
    description TEXT,
    
    -- Garantir que um usuário não pode favoritar o mesmo requerimento duas vezes
    UNIQUE(user_id, request_id)
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_request_id ON favorites(request_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at);

-- Adicionar comentários para documentação
COMMENT ON TABLE favorites IS 'Tabela para armazenar requerimentos favoritos dos usuários';
COMMENT ON COLUMN favorites.user_id IS 'ID do usuário que favoritou o requerimento';
COMMENT ON COLUMN favorites.request_id IS 'ID do requerimento favoritado';
COMMENT ON COLUMN favorites.custom_name IS 'Nome personalizado para o favorito (ex: "Congresso Missionário 2024")';
COMMENT ON COLUMN favorites.description IS 'Descrição opcional do favorito';
