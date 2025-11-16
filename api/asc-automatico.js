/**
 * ASC Automático - Zero Configuração
 * Sistema que se configura automaticamente baseado no ambiente
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const MotorASC = require('./nucleo/motor-asc');
const ServicoAutenticacao = require('./servicos/ServicoAutenticacao');

class ASCAutomatico {
  constructor() {
    this.configuracao = this.detectarConfiguracao();
    this.adaptador = null;
    this.servico = null;
    this.app = null;
  }

  // Detecta automaticamente a configuração do ambiente
  detectarConfiguracao() {
    const config = {
      porta: this.detectarPorta(),
      bancoDados: this.detectarBancoDados(),
      cors: this.detectarCors(),
      ssl: this.detectarSSL(),
      ambiente: process.env.NODE_ENV || 'development'
    };

    console.log('🔍 Configuração detectada:', config);
    return config;
  }

  detectarPorta() {
    return process.env.PORT || 
           process.env.PORTA || 
           process.env.SERVER_PORT ||
           (process.env.NODE_ENV === 'production' ? 80 : 3001);
  }

  detectarBancoDados() {
    // Detectar automaticamente o banco disponível
    if (process.env.DATABASE_URL || process.env.DB_URL) {
      return { tipo: 'postgresql', url: process.env.DATABASE_URL || process.env.DB_URL };
    }
    if (process.env.MONGODB_URI || process.env.MONGO_URL) {
      return { tipo: 'mongodb', url: process.env.MONGODB_URI || process.env.MONGO_URL };
    }
    if (process.env.MYSQL_URL || process.env.DB_HOST) {
      return { 
        tipo: 'mysql', 
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      };
    }
    
    // Verificar se existe arquivo de banco local
    const sqliteFiles = ['database.db', 'db.sqlite', 'app.db'];
    for (const file of sqliteFiles) {
      if (fs.existsSync(file)) {
        return { tipo: 'sqlite', arquivo: file };
      }
    }

    // Padrão: memória
    return { tipo: 'memoria' };
  }

  detectarCors() {
    if (process.env.CORS_ORIGIN) {
      return process.env.CORS_ORIGIN.split(',');
    }
    
    // Detectar se é desenvolvimento local
    if (this.configuracao?.ambiente === 'development') {
      return ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'];
    }
    
    return false; // Produção: sem CORS por padrão
  }

  detectarSSL() {
    return !!(process.env.SSL_CERT && process.env.SSL_KEY) || 
           process.env.HTTPS === 'true' ||
           process.env.NODE_ENV === 'production';
  }

  async inicializar() {
    console.log('🚀 Inicializando ASC Automático...');
    
    // Configurar adaptador de banco automaticamente
    await this.configurarBancoDados();
    
    // Criar serviço de autenticação
    this.servico = new ServicoAutenticacao(this.adaptador);
    
    // Criar servidor Express
    this.app = this.criarServidor();
    
    console.log('✅ ASC inicializado com sucesso');
    return this;
  }

  async configurarBancoDados() {
    const { tipo } = this.configuracao.bancoDados;
    
    try {
      switch (tipo) {
        case 'postgresql':
          const AdaptadorPostgreSQL = require('./adaptadores/postgresql/PostgreSQLAdapter');
          this.adaptador = new AdaptadorPostgreSQL(this.configuracao.bancoDados.url);
          break;
          
        case 'mongodb':
          const AdaptadorMongoDB = require('./adaptadores/mongodb/MongoDBAdapter');
          this.adaptador = new AdaptadorMongoDB(this.configuracao.bancoDados.url);
          break;
          
        case 'mysql':
          const AdaptadorMySQL = require('./adaptadores/mysql/MySQLAdapter');
          this.adaptador = new AdaptadorMySQL(this.configuracao.bancoDados);
          break;
          
        case 'sqlite':
          const AdaptadorSQLite = require('./adaptadores/sqlite/SQLiteAdapter');
          this.adaptador = new AdaptadorSQLite(this.configuracao.bancoDados.arquivo);
          break;
          
        default:
          const AdaptadorMemoria = require('./adaptadores/AdaptadorMemoria');
          this.adaptador = new AdaptadorMemoria();
          console.log('💾 Usando banco em memória (dados serão perdidos ao reiniciar)');
      }
      
      await this.adaptador.conectar();
      console.log(`✅ Conectado ao banco: ${tipo}`);
      
    } catch (error) {
      console.warn(`⚠️ Erro ao conectar ${tipo}, usando memória:`, error.message);
      const AdaptadorMemoria = require('./adaptadores/AdaptadorMemoria');
      this.adaptador = new AdaptadorMemoria();
      await this.adaptador.conectar();
    }
  }

  criarServidor() {
    const app = express();
    
    // Middlewares automáticos
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    
    // CORS automático
    if (this.configuracao.cors) {
      app.use((req, res, next) => {
        const origin = req.headers.origin;
        if (Array.isArray(this.configuracao.cors)) {
          if (this.configuracao.cors.includes(origin)) {
            res.header('Access-Control-Allow-Origin', origin);
          }
        } else {
          res.header('Access-Control-Allow-Origin', this.configuracao.cors);
        }
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Credentials', 'true');
        next();
      });
    }

    // Rotas automáticas com todas as proteções
    this.configurarRotasAutomaticas(app);
    
    return app;
  }

  configurarRotasAutomaticas(app) {
    // Registro automático (com honeypot e validações)
    app.post('/registro', async (req, res) => {
      try {
        const { email, senha, nome } = req.body;
        
        // Adicionar campos honeypot automaticamente se não existirem
        const dadosCompletos = {
          email,
          senha,
          nome,
          email_confirmacao: req.body.email_confirmacao || '',
          website: req.body.website || '',
          numero_telefone: req.body.numero_telefone || ''
        };
        
        const resultado = await this.servico.registrarUsuario(dadosCompletos, req);
        res.json({ sucesso: true, dados: resultado });
      } catch (error) {
        res.status(400).json({ sucesso: false, mensagem: error.message });
      }
    });

    // Login automático (com detecção de anomalias)
    app.post('/login', async (req, res) => {
      try {
        const { email, senha } = req.body;
        
        // Adicionar campos honeypot automaticamente
        const credenciais = {
          email,
          senha,
          email_confirmacao: req.body.email_confirmacao || '',
          website: req.body.website || '',
          numero_telefone: req.body.numero_telefone || ''
        };
        
        const resultado = await this.servico.autenticarUsuario(credenciais, req);
        res.json({ sucesso: true, dados: resultado });
      } catch (error) {
        res.status(400).json({ sucesso: false, mensagem: error.message });
      }
    });

    // Middleware de autenticação automático
    const middlewareAuth = async (req, res, next) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return res.status(401).json({ sucesso: false, mensagem: 'Token requerido' });
        }

        const payload = MotorASC.verificarToken(token);
        
        if (await this.adaptador.tokenRevogado(token)) {
          return res.status(401).json({ sucesso: false, mensagem: 'Token revogado' });
        }

        req.usuario = { id: payload.id, email: payload.email };
        req.token = token;
        next();
      } catch (error) {
        res.status(401).json({ sucesso: false, mensagem: 'Token inválido' });
      }
    };

    // Rotas protegidas automáticas
    app.get('/perfil', middlewareAuth, (req, res) => {
      res.json({ sucesso: true, usuario: req.usuario });
    });

    app.post('/logout', middlewareAuth, async (req, res) => {
      try {
        await this.servico.logout(req.token, req);
        res.json({ sucesso: true, mensagem: 'Logout realizado' });
      } catch (error) {
        res.status(400).json({ sucesso: false, mensagem: error.message });
      }
    });

    app.post('/renovar', async (req, res) => {
      try {
        const { refreshToken } = req.body;
        const resultado = await this.servico.renovarToken(refreshToken, req);
        res.json({ sucesso: true, dados: resultado });
      } catch (error) {
        res.status(400).json({ sucesso: false, mensagem: error.message });
      }
    });

    // Rota de status
    app.get('/status', (req, res) => {
      res.json({
        sucesso: true,
        status: 'ativo',
        configuracao: {
          ambiente: this.configuracao.ambiente,
          bancoDados: this.configuracao.bancoDados.tipo,
          cors: !!this.configuracao.cors
        }
      });
    });
  }

  async iniciarServidor() {
    await this.inicializar();
    
    return new Promise((resolve) => {
      const servidor = this.app.listen(this.configuracao.porta, () => {
        console.log(`🚀 ASC Automático rodando na porta ${this.configuracao.porta}`);
        console.log(`🌐 Acesse: http://localhost:${this.configuracao.porta}/status`);
        console.log(`📋 Rotas disponíveis:`);
        console.log(`   POST /registro - Registrar usuário`);
        console.log(`   POST /login - Fazer login`);
        console.log(`   GET  /perfil - Ver perfil (protegida)`);
        console.log(`   POST /logout - Fazer logout (protegida)`);
        console.log(`   POST /renovar - Renovar token`);
        resolve(servidor);
      });
    });
  }

  // Método estático para inicialização instantânea
  static async iniciar() {
    const asc = new ASCAutomatico();
    return await asc.iniciarServidor();
  }
}

module.exports = ASCAutomatico;