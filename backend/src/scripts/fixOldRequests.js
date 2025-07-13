import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixOldRequests() {
  const { data: requests, error } = await supabase
    .from('requests')
    .select('*');

  if (error) {
    console.error('Erro ao buscar requests:', error);
    process.exit(1);
  }

  let count = 0;
  for (const req of requests) {
    const updateFields = {};
    if (!req.description) updateFields.description = 'Sem descrição';
    if (!req.date) updateFields.date = req.created_at ? req.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10);
    if (!req.event_name) updateFields.event_name = 'Sem evento';
    if (!req.itens) updateFields.itens = [];
    if (!req.location) updateFields.location = '';
    if (!req.start_datetime) updateFields.start_datetime = '';
    if (!req.end_datetime) updateFields.end_datetime = '';
    if (!req.expected_audience) updateFields.expected_audience = '';
    if (Object.keys(updateFields).length > 0) {
      const { error: updateError } = await supabase
        .from('requests')
        .update(updateFields)
        .eq('id', req.id);
      if (updateError) {
        console.error(`Erro ao atualizar request ${req.id}:`, updateError);
      } else {
        count++;
        console.log(`Request ${req.id} atualizado.`);
      }
    }
  }
  console.log(`Atualização concluída. ${count} registros corrigidos.`);
  process.exit(0);
}

fixOldRequests(); 