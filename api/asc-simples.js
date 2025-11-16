/**
 * ASC Simples - Interface Simplificada
 * Wrapper que facilita integração mantendo todas as proteções
 */

const express = require('express');
const MotorASC = require('./nucleo/motor-asc');
const ServicoAutenticacao = require('./servicos/ServicoAutenticacao');
const AdaptadorMemoria = require('./adaptadores/AdaptadorMemoria');
const SistemaHoneypot = require('./seguranca/sistema-honeypot');

class ASCSimples {
  constructor(opcoes = {}) {
    this.adaptador = new AdaptadorMemoria();
    this.servico = new ServicoAutenticacao(this.adaptador);
    this.inicializado = false;
    this.opcoes = {
      porta: opcoes.porta || 3000,
      cors: opcoes.cors !== false,
      logs: opcoes.logs !== false,
      ...opcoes
    };
  }

  async inicializar() {
    if (!this.inicializado) {
      await this.adaptador.conectar();
      this.inicializado = true;
    }
    return this;
  }

  // Método simplificado para registrar usuário
  async registrar(email, senha, nome, req = {}) {
    await this.inicializar();
    
    const dadosRegistro = {
      email,
      senha,
      nome,
      // Campos honeypot vazios (comportamento normal)
      email_confirmacao: '',
      website: '',
      numero_telefone: ''
    };

    const reqSimulada = {
      ip: req.ip || '127.0.0.1',
      headers: req.headers || { 'user-agent': 'ASC-Cliente' },
      body: dadosRegistro
    };

    return await this.servico.registrarUsuario(dadosRegistro, reqSimulada);
  }

  // Método simplificado para login
  async login(email, senha, req = {}) {
    await this.inicializar();
    
    const credenciais = {
      email,
      senha,
      // Campos honeypot vazios
      email_confirmacao: '',
      website: '',
      numero_telefone: ''
    };

    const reqSimulada = {
      ip: req.ip || '127.0.0.1',
      headers: req.headers || { 'user-agent': 'ASC-Cliente' },
      body: credenciais
    };

    return await this.servico.autenticarUsuario(credenciais, reqSimulada);
  }

  // Método simplificado para verificar token
  async verificarToken(token) {
    try {
      const payload = MotorASC.verificarToken(token);
      
      // Verificar se token foi revogado
      if (await this.adaptador.tokenRevogado(token)) {
        throw new Error('Token revogado');
      }

      return {
        valido: true,
        usuario: {
          id: payload.id,
          email: payload.email
        }
      };
    } catch (error) {
      return {
        valido: false,
        erro: error.message
      };
    }
  }

  // Método simplificado para logout
  async logout(token, req = {}) {
    await this.inicializar();
    
    const reqSimulada = {
      ip: req.ip || '127.0.0.1',
      headers: req.headers || {}
    };

    return await this.servico.logout(token, reqSimulada);
  }

  // Método simplificado para renovar token
  async renovarToken(refreshToken, req = {}) {
    await this.inicializar();
    
    const reqSimulada = {
      ip: req.ip || '127.0.0.1',
      headers: req.headers || { 'user-agent': 'ASC-Cliente' }
    };

    return await this.servico.renovarToken(refreshToken, reqSimulada);
  }

  // Middleware Express simplificado
  middleware() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({
            sucesso: false,
            mensagem: 'Token requerido'
          });
        }

        const token = authHeader.substring(7);
        const verificacao = await this.verificarToken(token);
        
        if (!verificacao.valido) {
          return res.status(401).json({
            sucesso: false,
            mensagem: 'Token inválido'
          });
        }

        req.usuario = verificacao.usuario;
        req.token = token;
        next();
      } catch (error) {
        res.status(401).json({
          sucesso: false,
          mensagem: 'Erro de autenticação'
        });
      }
    };
  }

  // Criar servidor Express completo
  criarServidor() {
    const app = express();
    
    // Middlewares básicos
    app.use(express.json());
    if (this.opcoes.cors) {
      app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        next();
      });
    }

    // Rotas simplificadas
    app.post('/registro', async (req, res) => {
      try {
        const { email, senha, nome } = req.body;
        const resultado = await this.registrar(email, senha, nome, req);
        res.json({ sucesso: true, dados: resultado });
      } catch (error) {
        res.status(400).json({ sucesso: false, mensagem: error.message });
      }
    });

    app.post('/login', async (req, res) => {
      try {
        const { email, senha } = req.body;
        const resultado = await this.login(email, senha, req);
        res.json({ sucesso: true, dados: resultado });
      } catch (error) {
        res.status(400).json({ sucesso: false, mensagem: error.message });
      }
    });

    app.post('/logout', async (req, res) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        await this.logout(token, req);
        res.json({ sucesso: true, mensagem: 'Logout realizado' });
      } catch (error) {
        res.status(400).json({ sucesso: false, mensagem: error.message });
      }
    });

    app.post('/renovar', async (req, res) => {
      try {
        const { refreshToken } = req.body;
        const resultado = await this.renovarToken(refreshToken, req);
        res.json({ sucesso: true, dados: resultado });
      } catch (error) {
        res.status(400).json({ sucesso: false, mensagem: error.message });
      }
    });

    app.get('/perfil', this.middleware(), (req, res) => {
      res.json({ sucesso: true, usuario: req.usuario });
    });

    app.get('/honeypot', (req, res) => {
      const campos = SistemaHoneypot.gerarCamposHoneypot();
      res.json({ sucesso: true, dados: campos });
    });

    app.get('/status', (req, res) => {
      res.json({
        sucesso: true,
        status: 'ativo',
        versao: '1.0.0',
        timestamp: new Date().toISOString(),
        sistema: 'ASC - AsyncSystemCaption'
      });
    });

    return app;
  }

  // Iniciar servidor
  async iniciarServidor() {
    const app = this.criarServidor();
    await this.inicializar();
    
    return new Promise((resolve) => {
      const servidor = app.listen(this.opcoes.porta, () => {
        console.log(`🚀 ASC rodando na porta ${this.opcoes.porta}`);
        console.log(`📱 SDK cliente: const asc = new ASCSDK({ baseURL: 'http://localhost:${this.opcoes.porta}' })`);
        resolve(servidor);
      });
    });
  }

  // Gerar código SDK para o cliente
  gerarCodigoSDK() {
    return `
// Copie este código para seu frontend
const asc = new ASCSDK({ 
  baseURL: 'http://localhost:${this.opcoes.porta}' 
});

// Exemplos de uso:
// const login = await asc.login('email@exemplo.com', 'senha123');
// const perfil = await asc.obterPerfil();
// await asc.logout();
    `.trim();
  }
}

module.exports = ASCSimples;