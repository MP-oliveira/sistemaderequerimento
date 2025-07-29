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