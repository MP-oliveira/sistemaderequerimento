import { supabaseAdmin } from '../src/config/supabaseClient.js';

async function createFavoritesTable() {
  try {
    console.log('🔄 Criando tabela favorites...');
    
    // Usar o método correto do Supabase para executar SQL
    const { data, error } = await supabaseAdmin
      .from('favorites')
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('📝 Tabela não existe, criando...');
      
      // Como não podemos executar SQL diretamente, vamos usar uma abordagem diferente
      // Vou criar um script que você pode executar manualmente no Supabase
      console.log('⚠️  Execute o seguinte SQL no Supabase Dashboard:');
      console.log(`
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

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_request_id ON favorites(request_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at);
      `);
      
    } else if (error) {
      console.error('❌ Erro ao verificar tabela:', error);
    } else {
      console.log('✅ Tabela favorites já existe!');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createFavoritesTable();
