const API_URL = 'http://localhost:3000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export async function criarRequisicao({ department, descricao, data, event_id, itens }) {
  try {
    const response = await fetch(`${API_URL}/api/requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ department, description: descricao, date: data, event_id, itens }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar requisição');
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
}

export async function listarRequisicoes() {
  try {
    const response = await fetch(`${API_URL}/api/requests`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Erro ao buscar requisições');
    }
    const data = await response.json();
    return data.data || data;
  } catch (err) {
    throw err;
  }
}

export async function aprovarRequisicao(id) {
  try {
    const response = await fetch(`${API_URL}/api/requests/${id}/approve`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao aprovar requisição');
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
}

export async function rejeitarRequisicao(id, motivo) {
  try {
    const response = await fetch(`${API_URL}/api/requests/${id}/reject`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rejection_reason: motivo }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao rejeitar requisição');
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
}

export async function executarRequisicao(id) {
  try {
    const response = await fetch(`${API_URL}/api/requests/${id}/execute`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao executar requisição');
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
}

export async function finalizarRequisicao(id, itensDevolvidos) {
  try {
    const response = await fetch(`${API_URL}/api/requests/${id}/finish`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ itensDevolvidos }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao finalizar requisição');
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
}

// Upload de comprovante
export async function uploadComprovante(requestId, file, description) {
  try {
    const formData = new FormData();
    formData.append('comprovante', file);
    if (description) {
      formData.append('description', description);
    }

    const response = await fetch(`${API_URL}/api/requests/${requestId}/comprovantes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao enviar comprovante');
    }

    return await response.json();
  } catch (err) {
    throw err;
  }
}

// Listar comprovantes de uma requisição
export async function listarComprovantes(requestId) {
  try {
    const response = await fetch(`${API_URL}/api/requests/${requestId}/comprovantes`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar comprovantes');
    }

    const data = await response.json();
    return data.data || data;
  } catch (err) {
    throw err;
  }
}

// Download de comprovante
export async function downloadComprovante(comprovanteId) {
  try {
    const response = await fetch(`${API_URL}/api/requests/comprovantes/${comprovanteId}/download`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Erro ao baixar comprovante');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comprovante';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    throw err;
  }
}

// Remover comprovante
export async function removerComprovante(comprovanteId) {
  try {
    const response = await fetch(`${API_URL}/api/requests/comprovantes/${comprovanteId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao remover comprovante');
    }

    return await response.json();
  } catch (err) {
    throw err;
  }
} 

export async function listarEventos() {
  try {
    const response = await fetch('http://localhost:3000/api/events', {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Erro ao buscar eventos');
    }
    const data = await response.json();
    return data.data || data;
  } catch (err) {
    throw err;
  }
} 