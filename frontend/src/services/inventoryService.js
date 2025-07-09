const API_URL = 'http://localhost:3000'; // Ajuste para a URL real do backend

export async function listarItensInventario() {
  try {
    const response = await fetch(`${API_URL}/inventory`);
    if (!response.ok) {
      throw new Error('Erro ao buscar inventário');
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
}

export async function criarItemInventario({ nome, quantidade, status }) {
  try {
    const response = await fetch(`${API_URL}/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Adicione o token de autenticação se necessário
      },
      body: JSON.stringify({ nome, quantidade, status }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar item');
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
} 