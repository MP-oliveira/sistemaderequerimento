// Função para formatar horário em UTC (evita conversão de timezone)
export const formatTimeUTC = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Forçar UTC para evitar conversão de timezone
  const utcHours = date.getUTCHours().toString().padStart(2, '0');
  const utcMinutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${utcHours}:${utcMinutes}`;
};

// Função para formatar data e horário em UTC
export const formatDateTimeUTC = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Forçar UTC para evitar conversão de timezone
  const utcHours = date.getUTCHours().toString().padStart(2, '0');
  const utcMinutes = date.getUTCMinutes().toString().padStart(2, '0');
  const utcDate = date.toLocaleDateString('pt-BR');
  return `${utcDate} ${utcHours}:${utcMinutes}`;
}; 