/**
 * ASC - Sistema de Autenticação Empresarial
 * Ponto de entrada principal da aplicação
 * 
 * @copyright 2025 AsyncCypher
 * @license CC-BY-NC-ND-4.0
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const VerificadorIntegridade = require('./nucleo/verificador-integridade');
const configuracaoSeguranca = require('./configuracao/seguranca');
const configuracaoBD = require('./configuracao/banco-dados');
const rotasAutenticacao = require('./rotas/autenticacao');
const rotasSessao = require('./rotas/sessao');
const rotasUsuario = require('./rotas/usuario');
const middlewareAutenticacao = require('./middlewares/autenticacao');
const middlewareErros = require('./middlewares/tratador-erros');
const limitadorTaxa = require('./middlewares/limitador-taxa');

class ServidorASC {
  constructor() {
    this.app = express();
    this.porta = process.env.PORTA || 3000;
    this.inicializar();
  }

  async inicializar() {
    const integridadeOk = await VerificadorIntegridade.inicializar();
    if (!integridadeOk) {
      console.warn('⚠️ Sistema operando com integridade comprometida');
    }

    this.configurarMiddlewares();
    this.configurarRotas();
    this.configurarTratamentoErros();
    this.iniciarServidor();
  }

  configurarMiddlewares() {
    this.app.use(helmet(configuracaoSeguranca.headers));
    this.app.use(cors(configuracaoSeguranca.cors));
    
    // Desabilitar rate limiting em testes
    if (process.env.NODE_ENV !== 'test') {
      this.app.use(limitadorTaxa);
    }
    
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  configurarRotas() {
    this.app.use('/api/autenticacao', rotasAutenticacao);
    this.app.use('/api/usuario', middlewareAutenticacao, rotasUsuario);
    this.app.use('/api/sessao', middlewareAutenticacao, rotasSessao);
    
    // Rotas de teste (apenas desenvolvimento)
    if (process.env.NODE_ENV !== 'production') {
      const rotasTeste = require('./rotas/teste');
      this.app.use('/api/teste', rotasTeste);
    }
    
    this.app.get('/saude', (req, res) => {
      res.json({ 
        status: 'ativo',
        versao: '1.0.0',
        timestamp: new Date().toISOString()
      });
    });
  }

  configurarTratamentoErros() {
    this.app.use(middlewareErros);
  }

  iniciarServidor() {
    this.app.listen(this.porta, () => {
      console.log(`🚀 Servidor ASC rodando na porta ${this.porta}`);
    });
  }
}

new ServidorASC();

module.exports = ServidorASC;