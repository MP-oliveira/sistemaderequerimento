import { supabase } from '../src/config/supabaseClient.js';

async function addMissingColumns() {
  try {
    console.log('🔧 Adicionando colunas que estão faltando na tabela requests...\n');

    // Lista de colunas que precisam ser adicionadas
    const columnsToAdd = [
      {
        name: 'returned_at',
        type: 'timestamp with time zone',
        description: 'Data/hora do retorno dos instrumentos'
      },
      {
        name: 'returned_by',
        type: 'uuid',
        description: 'ID do usuário que retornou os instrumentos'
      },
      {
        name: 'return_notes',
        type: 'text',
        description: 'Observações do retorno dos instrumentos'
      }
    ];

    for (const column of columnsToAdd) {
      console.log(`📝 Adicionando coluna: ${column.name} (${column.type})`);
      
      try {
        // Tentar adicionar a coluna
        const { error } = await supabase.rpc('add_column_if_not_exists', {
          table_name: 'requests',
          column_name: column.name,
          column_type: column.type
        });

        if (error) {
          // Se a função RPC não existir, usar SQL direto
          const { error: sqlError } = await supabase
            .from('requests')
            .select('id')
            .limit(1);
          
          if (sqlError && sqlError.message.includes('column') && sqlError.message.includes('does not exist')) {
            console.log(`   ⚠️  Coluna ${column.name} não existe, mas não foi possível adicionar automaticamente`);
            console.log(`   💡 Execute manualmente: ALTER TABLE requests ADD COLUMN ${column.name} ${column.type};`);
          } else {
            console.log(`   ✅ Coluna ${column.name} já existe ou foi adicionada`);
          }
        } else {
          console.log(`   ✅ Coluna ${column.name} adicionada com sucesso`);
        }
      } catch (err) {
        console.log(`   ❌ Erro ao adicionar coluna ${column.name}:`, err.message);
      }
    }

    console.log('\n🎉 Processo concluído!');
    console.log('\n📋 Se alguma coluna não foi adicionada automaticamente, execute manualmente:');
    console.log('   ALTER TABLE requests ADD COLUMN returned_at timestamp with time zone;');
    console.log('   ALTER TABLE requests ADD COLUMN returned_by uuid;');
    console.log('   ALTER TABLE requests ADD COLUMN return_notes text;');

  } catch (error) {
    console.error('❌ Erro durante o processo:', error);
  }
}

addMissingColumns(); 