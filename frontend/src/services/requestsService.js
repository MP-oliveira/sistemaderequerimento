// Em desenvolvimento, usa o proxy do Vite
// Em produção, usa URL relativa para o mesmo domínio
const API_URL = import.meta.env.VITE_API_URL || '';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
}

export async function verificarConflitosTempoReal(data) {
  try {
    const response = await fetch(`${API_URL}/api/requests/check-realtime-conflicts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao verificar conflitos em tempo real');
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
}

export async function verificarDisponibilidadeMateriais(itens) {
  try {
    const response = await fetch(`${API_URL}/api/requests/check-inventory-availability`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ itens }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao verificar disponibilidade de materiais');
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
}

export async function verificarConflitos(data) {
  try {
    const response = await fetch(`${API_URL}/api/requests/check-conflicts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao verificar conflitos');
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
}

export async function criarRequisicao(data) {
  try {
    const response = await fetch(`${API_URL}/api/requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
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
    const timestamp = new Date().getTime();
    const response = await fetch(`${API_URL}/api/requests?t=${timestamp}`, {
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
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Se há conflitos, retornar informações detalhadas
      if (data.tipoConflito) {
        throw new Error(JSON.stringify({
          message: data.message,
          tipoConflito: data.tipoConflito,
          conflitos: data.conflitos
        }));
      }
      throw new Error(data.message || 'Erro ao aprovar requisição');
    }
    
    return data;
  } catch (err) {
    throw err;
  }
}

export async function rejeitarRequisicao(id, motivo) {
  try {
    const response = await fetch(`${API_URL}/api/requests/${id}/reject`, {
      method: 'PUT',
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
      method: 'PUT',
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
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ itens_devolvidos: itensDevolvidos }),
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

export async function atualizarRequisicao(id, data) {
  try {
    console.log('📝 [atualizarRequisicao] Enviando dados:', { id, data });
    
    // Adicionar timestamp para evitar cache
    const timestamp = new Date().getTime();
    const response = await fetch(`${API_URL}/api/requests/${id}?t=${timestamp}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    console.log('📝 [atualizarRequisicao] Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ [atualizarRequisicao] Erro da API:', errorData);
      throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ [atualizarRequisicao] Sucesso:', result);
    return result;
  } catch (err) {
    console.error('❌ [atualizarRequisicao] Erro:', err);
    throw err;
  }
}

export async function listarEventos() {
  try {
    const response = await fetch(`${API_URL}/api/events`, {
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

export async function deletarRequisicao(id) {
  try {
    const response = await fetch(`${API_URL}/api/requests/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao deletar requisição');
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
}

export async function getRequisicaoDetalhada(id) {
  try {
    const response = await fetch(`${API_URL}/api/requests/${id}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao buscar requisição detalhada');
    }
    const data = await response.json();
    return data.data || data;
  } catch (err) {
    throw err;
  }
}

// Retornar instrumentos ao inventário (AUDIOVISUAL)
export async function retornarInstrumentos(id, returnNotes = '') {
  try {
    const response = await fetch(`${API_URL}/api/requests/${id}/return-instruments`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ return_notes: returnNotes }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao retornar instrumentos');
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
}

// Buscar requisições para calendário
export async function buscarRequisicoesCalendario(month = null, year = null) {
  try {
    let url = `${API_URL}/api/requests/calendar`;
    const params = new URLSearchParams();
    
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao buscar requisições para calendário');
    }

    const data = await response.json();
    return data.data || data;
  } catch (err) {
    throw err;
  }
} 