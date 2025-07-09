const API_URL = 'http://localhost:3000'; // Ajuste para a URL real do backend

export async function listarUsuarios() {
  try {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) {
      throw new Error('Erro ao buscar usuários');
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
}

export async function criarUsuario({ nome, email, papel, senha }) {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Adicione o token de autenticação se necessário
      },
      body: JSON.stringify({ nome, email, papel, senha }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar usuário');
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
} 