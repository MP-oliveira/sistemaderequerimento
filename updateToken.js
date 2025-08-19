// Script para atualizar o token no localStorage
// Execute este script no console do navegador

const newToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjN2FhNWQzNS1kYWExLTRiYTAtOGE2OC0zZGYxMDlhYmNkNmQiLCJyb2xlIjoiQURNIiwibmFtZSI6IkFkbWluaXN0cmFkb3IgZG8gU2lzdGVtYSIsImlhdCI6MTc1NTYzMTA3NywiZXhwIjoxNzU1NzE3NDc3fQ.x3LrZkKX6EEZM8iYd66o4Q7tmZCFTE_8PDi-82SFg3c';

// Atualizar o token no localStorage
localStorage.setItem('token', newToken);

console.log('✅ Token atualizado com sucesso!');
console.log('🔄 Recarregando a página...');

// Recarregar a página para aplicar as mudanças
window.location.reload();
