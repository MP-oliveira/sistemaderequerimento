import { supabaseAdmin } from '../src/config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createFavoritesTable() {
  if (!supabaseAdmin) {
    console.error('❌ Configuração do Supabase não encontrada');
    return;
  }

  try {
    const sqlFilePath = path.join(__dirname, '../database/create_favorites_table.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('🔄 Criando tabela favorites...');

    // Dividir o SQL em comandos individuais se houver múltiplos
    const commands = sql.split(';').filter(cmd => cmd.trim().length > 0);

    for (const command of commands) {
      if (command.trim()) {
        console.log('Executando:', command.trim().substring(0, 50) + '...');
        
        // Para comandos DDL, usar query direta
        const { data, error } = await supabaseAdmin
          .from('favorites')
          .select('id')
          .limit(1);

        if (error && error.code === 'PGRST116') {
          // Tabela não existe, vamos criar
          console.log('📝 Tabela favorites não existe, criando...');
          
          // Executar comando SQL diretamente
          const { error: createError } = await supabaseAdmin.rpc('exec_sql', { 
            sql_query: command.trim() 
          });
          
          if (createError) {
            console.error('❌ Erro ao executar comando:', createError);
          } else {
            console.log('✅ Comando executado com sucesso');
          }
        } else {
          console.log('✅ Tabela favorites já existe');
        }
      }
    }

    console.log('✅ Tabela favorites criada/verificada com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao criar tabela favorites:', error);
  }
}

createFavoritesTable();
