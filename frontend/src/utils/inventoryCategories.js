// Categorias do inventário
export const INVENTORY_CATEGORIES = [
  { value: 'AUDIO_VIDEO', label: 'Áudio/Video' },
  { value: 'INSTRUMENTO_MUSICAL', label: 'Instrumento Musical' },
  { value: 'SERVICO_GERAL', label: 'Serviço Geral' },
  { value: 'DECORACAO', label: 'Decoração' },
  { value: 'ESPORTES', label: 'Esportes' }
];

// Categorias que pertencem ao audiovisual
export const AUDIOVISUAL_CATEGORIES = ['AUDIO_VIDEO', 'INSTRUMENTO_MUSICAL'];

// Categorias que pertencem ao serviço geral
export const SERVICO_GERAL_CATEGORIES = ['SERVICO_GERAL'];

// Categorias que pertencem à decoração
export const DECORACAO_CATEGORIES = ['DECORACAO'];

// Categorias que pertencem aos esportes
export const ESPORTES_CATEGORIES = ['ESPORTES'];

// Função para verificar se uma categoria pertence ao audiovisual
export const isAudiovisualCategory = (category) => {
  return AUDIOVISUAL_CATEGORIES.includes(category);
};

// Função para verificar se uma categoria pertence ao serviço geral
export const isServicoGeralCategory = (category) => {
  return SERVICO_GERAL_CATEGORIES.includes(category);
};

// Função para verificar se uma categoria pertence à decoração
export const isDecoracaoCategory = (category) => {
  return DECORACAO_CATEGORIES.includes(category);
};

// Função para verificar se uma categoria pertence aos esportes
export const isEsportesCategory = (category) => {
  return ESPORTES_CATEGORIES.includes(category);
}; 