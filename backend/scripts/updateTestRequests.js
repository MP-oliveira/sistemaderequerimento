import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function updateTestRequests() {
  console.log('🔧 Atualizando requisições de teste com dados mais completos...\n');

  try {
    // Buscar requisições aprovadas sem dados completos
    const { data: requests, error } = await supabase
      .from('requests')
      .select('id, department, status')
      .eq('status', 'APTO')
      .or('start_datetime.is.null,event_name.is.null')
      .limit(5);

    if (error) {
      console.error('❌ Erro ao buscar requisições:', error);
      return;
    }

    console.log(`📋 Encontradas ${requests.length} requisições para atualizar`);

    // Dados de teste para diferentes departamentos
    const testData = [
      {
        event_name: 'Culto de Domingo',
        start_datetime: '2025-07-27T19:00:00+00:00',
        end_datetime: '2025-07-27T21:00:00+00:00',
        location: 'Templo Principal',
        expected_audience: 150
      },
      {
        event_name: 'Ensaio de Louvor',
        start_datetime: '2025-07-26T20:00:00+00:00',
        end_datetime: '2025-07-26T22:00:00+00:00',
        location: 'Sala de Música',
        expected_audience: 8
      },
      {
        event_name: 'Reunião de Jovens',
        start_datetime: '2025-07-28T19:30:00+00:00',
        end_datetime: '2025-07-28T21:30:00+00:00',
        location: 'Salão Social',
        expected_audience: 25
      },
      {
        event_name: 'Escola Bíblica',
        start_datetime: '2025-07-29T20:00:00+00:00',
        end_datetime: '2025-07-29T21:30:00+00:00',
        location: 'Sala de Aula 1',
        expected_audience: 30
      },
      {
        event_name: 'Culto de Oração',
        start_datetime: '2025-07-30T19:00:00+00:00',
        end_datetime: '2025-07-30T20:30:00+00:00',
        location: 'Capela',
        expected_audience: 40
      }
    ];

    // Atualizar cada requisição com dados de teste
    for (let i = 0; i < Math.min(requests.length, testData.length); i++) {
      const request = requests[i];
      const testInfo = testData[i];

      console.log(`\n${i + 1}. Atualizando requisição ${request.id} (${request.department})...`);
      
      const { error: updateError } = await supabase
        .from('requests')
        .update({
          event_name: testInfo.event_name,
          start_datetime: testInfo.start_datetime,
          end_datetime: testInfo.end_datetime,
          location: testInfo.location,
          expected_audience: testInfo.expected_audience,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (updateError) {
        console.error(`   ❌ Erro ao atualizar:`, updateError);
      } else {
        console.log(`   ✅ Atualizada com sucesso`);
        console.log(`      Evento: ${testInfo.event_name}`);
        console.log(`      Data: ${new Date(testInfo.start_datetime).toLocaleDateString('pt-BR')}`);
        console.log(`      Local: ${testInfo.location}`);
      }
    }

    console.log('\n✅ Processo concluído!');
    console.log('💡 Agora o dashboard deve mostrar requisições com dados completos.');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

updateTestRequests(); 