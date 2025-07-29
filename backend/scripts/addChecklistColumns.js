import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addChecklistColumns() {
  try {
    console.log('🔧 Adicionando colunas de checklist na tabela request_items...');

    // Adicionar coluna para observações de indisponibilidade
    const { error: error1 } = await supabase.rpc('add_column_if_not_exists', {
      table_name: 'request_items',
      column_name: 'unavailable_reason',
      column_definition: 'TEXT'
    });

    if (error1) {
      console.log('ℹ️ Coluna unavailable_reason já existe ou erro:', error1.message);
    } else {
      console.log('✅ Coluna unavailable_reason adicionada');
    }

    // Adicionar coluna para status do item (disponível, indisponível, separado)
    const { error: error2 } = await supabase.rpc('add_column_if_not_exists', {
      table_name: 'request_items',
      column_name: 'item_status',
      column_definition: 'VARCHAR(20) DEFAULT \'PENDENTE\''
    });

    if (error2) {
      console.log('ℹ️ Coluna item_status já existe ou erro:', error2.message);
    } else {
      console.log('✅ Coluna item_status adicionada');
    }

    // Adicionar coluna para observações do audiovisual
    const { error: error3 } = await supabase.rpc('add_column_if_not_exists', {
      table_name: 'request_items',
      column_name: 'audiovisual_notes',
      column_definition: 'TEXT'
    });

    if (error3) {
      console.log('ℹ️ Coluna audiovisual_notes já existe ou erro:', error3.message);
    } else {
      console.log('✅ Coluna audiovisual_notes adicionada');
    }

    // Adicionar coluna para data/hora de separação
    const { error: error4 } = await supabase.rpc('add_column_if_not_exists', {
      table_name: 'request_items',
      column_name: 'separation_datetime',
      column_definition: 'TIMESTAMP WITH TIME ZONE'
    });

    if (error4) {
      console.log('ℹ️ Coluna separation_datetime já existe ou erro:', error4.message);
    } else {
      console.log('✅ Coluna separation_datetime adicionada');
    }

    console.log('🎉 Todas as colunas de checklist foram adicionadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar colunas:', error);
  }
}

addChecklistColumns(); 