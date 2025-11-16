/**
 * Servidor Principal ASC
 * Ponto de entrada único para o sistema
 */

const ASCSimples = require('./api/asc-simples');

// Configuração do servidor
const opcoes = {
  porta: process.env.PORTA || 3000,
  cors: true,
  logs: true
};

// Inicializar e executar servidor
const asc = new ASCSimples(opcoes);

asc.iniciarServidor()
  .then(() => {
    console.log('✅ Sistema ASC inicializado com sucesso');
    console.log(`🌐 Acesse: http://localhost:${opcoes.porta}/status`);
  })
  .catch(erro => {
    console.error('❌ Erro ao inicializar ASC:', erro);
    process.exit(1);
  });

module.exports = asc;