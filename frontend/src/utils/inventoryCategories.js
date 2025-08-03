// Categorias do inventário
export const INVENTORY_CATEGORIES = [
  { value: 'AUDIO_VIDEO', label: 'Áudio/Video' },
  { value: 'INSTRUMENTO_MUSICAL', label: 'Instrumento Musical' },
  { value: 'SERVICO_GERAL', label: 'Serviço Geral' }
];

// Categorias que pertencem ao audiovisual
export const AUDIOVISUAL_CATEGORIES = ['AUDIO_VIDEO', 'INSTRUMENTO_MUSICAL'];

// Categorias que pertencem ao serviço geral
export const SERVICO_GERAL_CATEGORIES = ['SERVICO_GERAL'];

// Função para verificar se uma categoria pertence ao audiovisual
export const isAudiovisualCategory = (category) => {
  return AUDIOVISUAL_CATEGORIES.includes(category);
};

// Função para verificar se uma categoria pertence ao serviço geral
export const isServicoGeralCategory = (category) => {
  return SERVICO_GERAL_CATEGORIES.includes(category);
}; 