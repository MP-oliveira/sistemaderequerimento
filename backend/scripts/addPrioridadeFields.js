import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addPrioridadeFields() {
  try {
    // Adicionar prioridade em departments
    let { error: errorDept } = await supabase.rpc('alter_table_add_column_if_not_exists', {
      table_name: 'departments',
      column_name: 'prioridade',
      column_type: 'text',
      default_value: "'Média'"
    });
    if (errorDept) {
      console.log('Erro ao adicionar prioridade em departments (pode já existir):', errorDept.message);
    } else {
      console.log('Campo prioridade adicionado em departments (ou já existia).');
    }
    // Adicionar prioridade em events
    let { error: errorEvents } = await supabase.rpc('alter_table_add_column_if_not_exists', {
      table_name: 'events',
      column_name: 'prioridade',
      column_type: 'text',
      default_value: null
    });
    if (errorEvents) {
      console.log('Erro ao adicionar prioridade em events (pode já existir):', errorEvents.message);
    } else {
      console.log('Campo prioridade adicionado em events (ou já existia).');
    }
    process.exit(0);
  } catch (err) {
    console.error('Erro geral:', err);
    process.exit(1);
  }
}

addPrioridadeFields();

/*
IMPORTANTE: Para funcionar, é necessário criar a função SQL alter_table_add_column_if_not_exists no Supabase:

CREATE OR REPLACE FUNCTION alter_table_add_column_if_not_exists(
  table_name text,
  column_name text,
  column_type text,
  default_value text DEFAULT NULL
) RETURNS void AS $$
DECLARE
  col_exists boolean;
BEGIN
  EXECUTE format('SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = %L AND column_name = %L)', table_name, column_name)
  INTO col_exists;
  IF NOT col_exists THEN
    IF default_value IS NOT NULL THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s DEFAULT %s', table_name, column_name, column_type, default_value);
    ELSE
      EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', table_name, column_name, column_type);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;
*/ 