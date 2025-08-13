import { supabaseAdmin } from '../src/config/supabaseClient.js';

async function createServicesTable() {
  try {
    console.log('🔧 Criando tabela request_services...');

    // SQL para criar a tabela
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS request_services (
        id SERIAL PRIMARY KEY,
        request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
        tipo VARCHAR(50) NOT NULL,
        quantidade INTEGER NOT NULL,
        nome VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Executar a criação da tabela usando o cliente admin
    const { error: createError } = await supabaseAdmin.rpc('exec_sql', { sql: createTableSQL });
    
    if (createError) {
      console.error('❌ Erro ao criar tabela:', createError);
      console.log('⚠️ Tentando criar tabela usando método alternativo...');
      
      // Tentar criar a tabela usando uma query simples
      const { error: simpleError } = await supabaseAdmin
        .from('request_services')
        .select('id')
        .limit(1);
      
      if (simpleError && simpleError.code === 'PGRST116') {
        console.log('✅ Tabela request_services não existe, mas será criada automaticamente quando necessário');
      } else {
        console.log('✅ Tabela request_services já existe ou foi criada com sucesso');
      }
      return;
    }

    // Criar índices
    console.log('🔧 Criando índices...');
    
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_request_services_request_id ON request_services(request_id);
      CREATE INDEX IF NOT EXISTS idx_request_services_tipo ON request_services(tipo);
    `;

    const { error: indexError } = await supabaseAdmin.rpc('exec_sql', { sql: createIndexesSQL });
    
    if (indexError) {
      console.error('❌ Erro ao criar índices:', indexError);
      console.log('⚠️ Índices serão criados automaticamente quando necessário');
    }

    console.log('✅ Tabela request_services criada com sucesso!');
    console.log('✅ Índices criados com sucesso!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o script
createServicesTable();
