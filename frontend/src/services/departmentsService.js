const API_URL = import.meta.env.VITE_API_URL || '';

export async function listDepartments() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/departments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao buscar departamentos');
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (err) {
    console.error('Erro ao buscar departamentos:', err);
    throw err;
  }
}
