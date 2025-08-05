// Configuração das opções de prioridade
export const PRIORIDADE_OPTIONS = [
  { value: 'Baixa', label: 'Baixa' },
  { value: 'Média', label: 'Média' },
  { value: 'Alta', label: 'Alta' }
];

// Valor padrão para prioridade
export const PRIORIDADE_DEFAULT = 'Média';

// Função para obter a label de uma prioridade
export const getPrioridadeLabel = (value) => {
  const option = PRIORIDADE_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : value;
};

// Função para validar se uma prioridade é válida
export const isValidPrioridade = (value) => {
  return PRIORIDADE_OPTIONS.some(opt => opt.value === value);
};

// Função para obter a cor da prioridade
export const getPrioridadeColor = (value) => {
  switch (value) {
    case 'Alta':
      return '#dc3545'; // Vermelho
    case 'Média':
      return '#ffc107'; // Amarelo
    case 'Baixa':
      return '#28a745'; // Verde
    default:
      return '#6c757d'; // Cinza
  }
};

// Função para obter o ícone da prioridade
export const getPrioridadeIcon = (value) => {
  switch (value) {
    case 'Alta':
      return '🔴';
    case 'Média':
      return '🟡';
    case 'Baixa':
      return '🟢';
    default:
      return '⚪';
  }
};

// Função para obter a classe CSS da prioridade
export const getPrioridadeClass = (value) => {
  switch (value) {
    case 'Alta':
      return 'prioridade-alta';
    case 'Média':
      return 'prioridade-media';
    case 'Baixa':
      return 'prioridade-baixa';
    default:
      return 'prioridade-default';
  }
}; 