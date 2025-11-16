/**
 * Exemplo de Uso Simplificado do ASC
 * Demonstra como usar a API de forma muito simples
 */

const ASCSimples = require('./src/asc-simples');

// Exemplo 1: Uso básico como biblioteca
async function exemploBasico() {
  const asc = new ASCSimples();
  
  try {
    // Registrar usuário
    const usuario = await asc.registrar('teste@exemplo.com', 'MinhaSenh@123', 'João Silva');
    console.log('✅ Usuário registrado:', usuario);
    
    // Fazer login
    const login = await asc.login('teste@exemplo.com', 'MinhaSenh@123');
    console.log('✅ Login realizado:', login.dados.token);
    
    // Verificar token
    const verificacao = await asc.verificarToken(login.dados.token);
    console.log('✅ Token válido:', verificacao.valido);
    
    // Logout
    await asc.logout(login.dados.token);
    console.log('✅ Logout realizado');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Exemplo 2: Servidor completo em 3 linhas
async function exemploServidor() {
  const asc = new ASCSimples({ porta: 3002 });
  await asc.iniciarServidor();
  console.log('🚀 Servidor ASC rodando com todas as proteções!');
}

// Exemplo 3: Integração com Express existente
function exemploIntegracao() {
  const express = require('express');
  const asc = new ASCSimples();
  
  const app = express();
  app.use(express.json());
  
  // Rota pública
  app.get('/', (req, res) => {
    res.json({ mensagem: 'API funcionando' });
  });
  
  // Rota protegida usando middleware do ASC
  app.get('/protegida', asc.middleware(), (req, res) => {
    res.json({ 
      mensagem: 'Área protegida',
      usuario: req.usuario 
    });
  });
  
  // Rotas de autenticação personalizadas
  app.post('/meu-login', async (req, res) => {
    try {
      const { email, senha } = req.body;
      const resultado = await asc.login(email, senha, req);
      res.json(resultado);
    } catch (error) {
      res.status(400).json({ erro: error.message });
    }
  });
  
  app.listen(3003, () => {
    console.log('🚀 Servidor integrado rodando na porta 3003');
  });
}

// Executar exemplos
if (require.main === module) {
  console.log('=== Exemplo Básico ===');
  exemploBasico();
  
  setTimeout(() => {
    console.log('\n=== Exemplo Servidor ===');
    exemploServidor();
  }, 2000);
  
  setTimeout(() => {
    console.log('\n=== Exemplo Integração ===');
    exemploIntegracao();
  }, 4000);
}