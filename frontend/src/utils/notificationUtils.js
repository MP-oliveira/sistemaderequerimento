// Função para adicionar uma nova notificação
export const addNotification = (type, title, message) => {
  const notification = {
    id: Date.now() + Math.random(),
    type,
    title,
    message,
    timestamp: new Date().toISOString()
  };

  // Buscar notificações existentes
  const existingNotifications = JSON.parse(localStorage.getItem('requestNotifications') || '[]');
  
  // Adicionar nova notificação
  const updatedNotifications = [notification, ...existingNotifications];
  
  // Manter apenas as últimas 20 notificações
  const limitedNotifications = updatedNotifications.slice(0, 20);
  
  // Salvar no localStorage
  localStorage.setItem('requestNotifications', JSON.stringify(limitedNotifications));
  
  // Disparar evento customizado para atualizar componentes
  window.dispatchEvent(new CustomEvent('notificationAdded', { detail: notification }));
};

// Função para criar notificação de Requerimento aprovada
export const notifyRequestApproved = (requestData) => {
  addNotification(
    'approved',
    'Requisição Aprovada',
    `A Requerimento "${requestData.event_name || requestData.description}" do departamento ${requestData.department} foi aprovada.`
  );
};

// Função para criar notificação de Requerimento rejeitada
export const notifyRequestRejected = (requestData) => {
  addNotification(
    'rejected',
    'Requisição Rejeitada',
    `A Requerimento "${requestData.event_name || requestData.description}" do departamento ${requestData.department} foi rejeitada.`
  );
};

// Função para criar notificação de Requerimento executada
export const notifyRequestExecuted = (requestData) => {
  addNotification(
    'executed',
    'Requisição Executada',
    `A Requerimento "${requestData.event_name || requestData.description}" foi executada com sucesso.`
  );
};

// Função para criar notificação para audiovisual
export const notifyAudiovisualPreparation = (requestData) => {
  addNotification(
    'approved',
    'Preparar Material',
    `Requisição aprovada: Prepare os materiais para "${requestData.event_name || requestData.description}" do departamento ${requestData.department}.`
  );
}; 