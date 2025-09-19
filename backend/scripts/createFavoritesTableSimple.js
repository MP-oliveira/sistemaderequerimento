import { supabaseAdmin } from '../src/config/supabaseClient.js';

async function createFavoritesTable() {
  try {
    console.log('🔄 Criando tabela favorites...');
    
    // SQL para criar a tabela
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        custom_name VARCHAR(255),
        description TEXT,
        UNIQUE(user_id, request_id)
      );
    `;
    
    // Executar SQL
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { 
      sql_query: createTableSQL 
    });
    
    if (error) {
      console.error('❌ Erro ao criar tabela:', error);
    } else {
      console.log('✅ Tabela favorites criada com sucesso!');
    }
    
    // Criar índices
    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_favorites_request_id ON favorites(request_id);
      CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at);
    `;
    
    const { data: indexData, error: indexError } = await supabaseAdmin.rpc('exec_sql', { 
      sql_query: createIndexSQL 
    });
    
    if (indexError) {
      console.error('❌ Erro ao criar índices:', indexError);
    } else {
      console.log('✅ Índices criados com sucesso!');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createFavoritesTable();
