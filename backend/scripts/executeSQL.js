import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function executeSQL() {
  console.log('🔧 Executando alterações no banco de dados...\n');

  try {
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync('./scripts/addReturnColumns.sql', 'utf8');
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());

    console.log(`📋 Executando ${statements.length} comandos SQL...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;

      console.log(`${i + 1}. Executando: ${statement.substring(0, 50)}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.log(`   ⚠️  Aviso: ${error.message}`);
        } else {
          console.log('   ✅ Sucesso');
        }
      } catch (err) {
        console.log(`   ⚠️  Aviso: ${err.message}`);
      }
    }

    console.log('\n✅ Processo concluído!');
    console.log('\n💡 Nota: Se você viu avisos sobre "column already exists", isso é normal.');
    console.log('   As colunas já existiam no banco de dados.');

  } catch (error) {
    console.error('❌ Erro ao executar SQL:', error);
  }
}

executeSQL(); 