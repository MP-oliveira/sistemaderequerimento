import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addApprovedByField() {
  try {
    console.log('🔧 Adicionando campo approved_by na tabela requests...');
    
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync('database/add_approved_by_field.sql', 'utf8');
    const sqlStatements = sqlContent.split(';').filter(sql => sql.trim());
    
    for (const sql of sqlStatements) {
      if (sql.trim()) {
        console.log('Executando SQL:', sql.trim());
        
        // Executar cada statement SQL
        const { error } = await supabase.rpc('exec_sql', { sql: sql.trim() });
        
        if (error) {
          console.log('❌ Erro ao executar SQL:', error);
        } else {
          console.log('✅ SQL executado com sucesso');
        }
      }
    }
    
    console.log('✅ Campo approved_by adicionado com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

addApprovedByField();
