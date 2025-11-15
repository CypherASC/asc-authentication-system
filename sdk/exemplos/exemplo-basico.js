/**
 * Exemplo Básico - ASC SDK
 * 
 * @copyright 2025 AsyncCypher
 */

const { ASCSDK } = require('../asc-sdk');

async function exemploBasico() {
  const asc = new ASCSDK({
    baseURL: 'http://localhost:3000'
  });

  try {
    // Registrar usuário
    const usuario = await asc.registrar({
      nome: 'João Silva',
      email: 'joao@exemplo.com',
      senha: 'MinhaSenh@123'
    });
    console.log('Usuário registrado:', usuario.email);

    // Login
    const sessao = await asc.login('joao@exemplo.com', 'MinhaSenh@123');
    console.log('Login realizado:', sessao.usuario.nome);

    // Obter perfil
    const perfil = await asc.obterPerfil();
    console.log('Perfil:', perfil.email);

    // Logout
    await asc.logout();
    console.log('Logout realizado');

  } catch (error) {
    console.error('Erro:', error.message);
  }
}

exemploBasico();