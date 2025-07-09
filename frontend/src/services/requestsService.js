const API_URL = 'http://localhost:3000'; // Ajuste para a URL real do backend

export async function criarRequisicao({ descricao, data, itens }) {
  try {
    const response = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Adicione o token de autenticação se necessário
      },
      body: JSON.stringify({ descricao, data, itens }),
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
    const response = await fetch(`${API_URL}/requests`);
    if (!response.ok) {
      throw new Error('Erro ao buscar requisições');
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
} 