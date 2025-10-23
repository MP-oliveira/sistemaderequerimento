import { listarLocais } from '../services/locationsService';

// Função para buscar locais da API
export const getSalasOptions = async () => {
  try {
    const response = await listarLocais();
    if (response.success && response.data) {
      // Converter dados da API para o formato esperado pelo frontend
      const options = [
        { value: '', label: 'Selecione um local' },
        ...response.data.map(local => ({
          value: local.name,
          label: `${getEmojiForLocation(local.name)} ${local.name}${getDescriptionForLocation(local.name)}`
        }))
      ];
      return options;
    }
  } catch (error) {
    console.error('Erro ao buscar locais da API:', error);
  }
  
  // Fallback: retornar dados mocados em caso de erro
  return getSalasOptionsFallback();
};

// Função para obter emoji baseado no nome do local
const getEmojiForLocation = (name) => {
  const emojiMap = {
    'Templo': '🏛️',
    'Anexo 1 - Salão': '🏢',
    'Anexo 1 - Sala 11': '🏢',
    'Anexo 1 - Sala 12': '🏢',
    'Anexo 1 - Biblioteca': '🏢',
    'Anexo 1 - Sala 16': '🏢',
    'Anexo 1 - Sala 22': '🏢',
    'Anexo 1 - Sala 23': '🏢',
    'Anexo 1 - Sala 24': '🏢',
    'Anexo 1 - Sala 26': '🏢',
    'Anexo 1 - Sala 27': '🏢',
    'Anexo 2 - Salão': '🏢',
    'Anexo 2 - Sala 11': '🏢',
    'Anexo 2 - Sala 12': '🏢',
    'Anexo 2 - Sala 13': '🏢',
    'Anexo 2 - Sala 14': '🏢',
    'Anexo 2 - Sala 15': '🏢',
    'Anexo 2 - Sala 16': '🏢',
    'Anexo 2 - Sala 17': '🏢',
    'Anexo 2 - Sala 21': '🏢',
    'Anexo 2 - Sala 22': '🏢',
    'Anexo 2 - Sala 23': '🏢',
    'Anexo 2 - Sala 24': '🏢',
    'Anexo 2 - Sala 25': '🏢',
    'Anexo 2 - Sala 26': '🏢',
    'Anexo 2 - Sala 27': '🏢',
    'Anexo 2 - Sala 31': '🏢',
    'Anexo 2 - Sala 32': '🏢',
    'Estúdio': '🎬',
    'Copa': '🍽️',
    'Outro': '📍'
  };
  
  return emojiMap[name] || '📍';
};

// Função para obter descrição baseada no nome do local
const getDescriptionForLocation = (name) => {
  const descriptionMap = {
    'Anexo 1 - Salão': ' (Andar 0)',
    'Anexo 1 - Sala 11': ' (Andar 1)',
    'Anexo 1 - Sala 12': ' (Andar 1)',
    'Anexo 1 - Biblioteca': ' - Sala 15 (Andar 1)',
    'Anexo 1 - Sala 16': ' (Andar 1)',
    'Anexo 1 - Sala 22': ' (Andar 2)',
    'Anexo 1 - Sala 23': ' (Andar 2)',
    'Anexo 1 - Sala 24': ' (Andar 2)',
    'Anexo 1 - Sala 26': ' (Andar 2)',
    'Anexo 1 - Sala 27': ' (Andar 2)',
    'Anexo 2 - Salão': ' (Andar 0)',
    'Anexo 2 - Sala 11': ' (Andar 1)',
    'Anexo 2 - Sala 12': ' (Andar 1)',
    'Anexo 2 - Sala 13': ' (Andar 1)',
    'Anexo 2 - Sala 14': ' (Andar 1)',
    'Anexo 2 - Sala 15': ' (Andar 1)',
    'Anexo 2 - Sala 16': ' (Andar 1)',
    'Anexo 2 - Sala 17': ' (Andar 1)',
    'Anexo 2 - Sala 21': ' (Andar 2)',
    'Anexo 2 - Sala 22': ' (Andar 2)',
    'Anexo 2 - Sala 23': ' (Andar 2)',
    'Anexo 2 - Sala 24': ' (Andar 2)',
    'Anexo 2 - Sala 25': ' (Andar 2)',
    'Anexo 2 - Sala 26': ' (Andar 2)',
    'Anexo 2 - Sala 27': ' (Andar 2)',
    'Anexo 2 - Sala 31': ' (Andar 3)',
    'Anexo 2 - Sala 32': ' (Andar 3)'
  };
  
  return descriptionMap[name] || '';
};

// Dados mocados como fallback
const getSalasOptionsFallback = () => [
  { value: '', label: 'Selecione um local' },
  { value: 'Templo', label: '🏛️ Templo' },
  { value: 'Anexo 1 - Salão', label: '🏢 Anexo 1 - Salão (Andar 0)' },
  { value: 'Anexo 1 - Sala 11', label: '🏢 Anexo 1 - Sala 11 (Andar 1)' },
  { value: 'Anexo 1 - Sala 12', label: '🏢 Anexo 1 - Sala 12 (Andar 1)' },
  { value: 'Anexo 1 - Biblioteca', label: '🏢 Anexo 1 - Biblioteca - Sala 15 (Andar 1)' },
  { value: 'Anexo 1 - Sala 16', label: '🏢 Anexo 1 - Sala 16 (Andar 1)' },
  { value: 'Anexo 1 - Sala 22', label: '🏢 Anexo 1 - Sala 22 (Andar 2)' },
  { value: 'Anexo 1 - Sala 23', label: '🏢 Anexo 1 - Sala 23 (Andar 2)' },
  { value: 'Anexo 1 - Sala 24', label: '🏢 Anexo 1 - Sala 24 (Andar 2)' },
  { value: 'Anexo 1 - Sala 26', label: '🏢 Anexo 1 - Sala 26 (Andar 2)' },
  { value: 'Anexo 1 - Sala 27', label: '🏢 Anexo 1 - Sala 27 (Andar 2)' },
  { value: 'Anexo 2 - Salão', label: '🏢 Anexo 2 - Salão (Andar 0)' },
  { value: 'Anexo 2 - Sala 11', label: '🏢 Anexo 2 - Sala 11 (Andar 1)' },
  { value: 'Anexo 2 - Sala 12', label: '🏢 Anexo 2 - Sala 12 (Andar 1)' },
  { value: 'Anexo 2 - Sala 13', label: '🏢 Anexo 2 - Sala 13 (Andar 1)' },
  { value: 'Anexo 2 - Sala 14', label: '🏢 Anexo 2 - Sala 14 (Andar 1)' },
  { value: 'Anexo 2 - Sala 15', label: '🏢 Anexo 2 - Sala 15 (Andar 1)' },
  { value: 'Anexo 2 - Sala 16', label: '🏢 Anexo 2 - Sala 16 (Andar 1)' },
  { value: 'Anexo 2 - Sala 17', label: '🏢 Anexo 2 - Sala 17 (Andar 1)' },
  { value: 'Anexo 2 - Sala 21', label: '🏢 Anexo 2 - Sala 21 (Andar 2)' },
  { value: 'Anexo 2 - Sala 22', label: '🏢 Anexo 2 - Sala 22 (Andar 2)' },
  { value: 'Anexo 2 - Sala 23', label: '🏢 Anexo 2 - Sala 23 (Andar 2)' },
  { value: 'Anexo 2 - Sala 24', label: '🏢 Anexo 2 - Sala 24 (Andar 2)' },
  { value: 'Anexo 2 - Sala 25', label: '🏢 Anexo 2 - Sala 25 (Andar 2)' },
  { value: 'Anexo 2 - Sala 26', label: '🏢 Anexo 2 - Sala 26 (Andar 2)' },
  { value: 'Anexo 2 - Sala 27', label: '🏢 Anexo 2 - Sala 27 (Andar 2)' },
  { value: 'Anexo 2 - Sala 31', label: '🏢 Anexo 2 - Sala 31 (Andar 3)' },
  { value: 'Anexo 2 - Sala 32', label: '🏢 Anexo 2 - Sala 32 (Andar 3)' },
  { value: 'Estúdio', label: '🎬 Estúdio' },
  { value: 'Copa', label: '🍽️ Copa' },
  { value: 'Outro', label: '📍 Outro local' }
];

// Exportar dados mocados para compatibilidade (será removido depois)
export const salasOptions = getSalasOptionsFallback(); 