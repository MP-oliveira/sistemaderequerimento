import { supabaseAdmin } from '../src/config/supabaseClient.js';

async function createFavoritesTable() {
  try {
    console.log('🔄 Criando tabela favorites...');
    
    // Primeiro, vamos tentar acessar a tabela para ver se existe
    const { data, error } = await supabaseAdmin
      .from('favorites')
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('📝 Tabela não existe. Criando...');
      
      // Vamos usar uma abordagem diferente - criar via SQL direto
      // Como o Supabase não permite exec_sql via cliente, vamos usar o método de migração
      console.log('⚠️  Execute o seguinte SQL no Supabase Dashboard:');
      console.log('');
      console.log('-- SQL para criar tabela favorites');
      console.log('CREATE TABLE IF NOT EXISTS favorites (');
      console.log('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,');
      console.log('  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,');
      console.log('  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,');
      console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
      console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
      console.log('  custom_name VARCHAR(255),');
      console.log('  description TEXT,');
      console.log('  UNIQUE(user_id, request_id)');
      console.log(');');
      console.log('');
      console.log('-- Criar índices');
      console.log('CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);');
      console.log('CREATE INDEX IF NOT EXISTS idx_favorites_request_id ON favorites(request_id);');
      console.log('CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at);');
      console.log('');
      console.log('-- Adicionar comentários');
      console.log("COMMENT ON TABLE favorites IS 'Tabela para armazenar requerimentos favoritos dos usuários';");
      console.log("COMMENT ON COLUMN favorites.user_id IS 'ID do usuário que favoritou o requerimento';");
      console.log("COMMENT ON COLUMN favorites.request_id IS 'ID do requerimento favoritado';");
      console.log("COMMENT ON COLUMN favorites.custom_name IS 'Nome personalizado para o favorito';");
      console.log("COMMENT ON COLUMN favorites.description IS 'Descrição opcional do favorito';");
      console.log('');
      console.log('📋 Passos para executar:');
      console.log('1. Acesse https://supabase.com/dashboard');
      console.log('2. Vá para o seu projeto');
      console.log('3. Clique em "SQL Editor"');
      console.log('4. Cole o SQL acima');
      console.log('5. Clique em "Run"');
      console.log('');
      console.log('✅ Após executar, o sistema de favoritos funcionará perfeitamente!');
      
    } else if (error) {
      console.error('❌ Erro ao verificar tabela:', error);
    } else {
      console.log('✅ Tabela favorites já existe!');
      console.log('📊 Dados encontrados:', data);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createFavoritesTable();
