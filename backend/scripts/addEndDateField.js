import { supabaseAdmin } from '../src/config/supabaseClient.js';
import fs from 'fs';
import path from 'path';

async function addEndDateField() {
  try {
    console.log('🔄 Adicionando campo end_date na tabela requests...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(process.cwd(), 'database', 'add_end_date_field.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Executar cada comando SQL separadamente
    const commands = sql.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands) {
      if (command.trim()) {
        console.log(`Executando: ${command.trim().substring(0, 50)}...`);
        
        const { data, error } = await supabaseAdmin.rpc('exec_sql', { 
          sql_query: command.trim() 
        });
        
        if (error) {
          console.error('❌ Erro ao executar comando:', error);
        } else {
          console.log('✅ Comando executado com sucesso');
        }
      }
    }
    
    console.log('✅ Campo end_date adicionado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

addEndDateField();
