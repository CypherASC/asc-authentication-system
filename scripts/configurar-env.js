/**
 * Script de Configuração Automática do .env
 * Gera arquivo .env com configurações seguras
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

class ConfiguradorEnv {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.configuracao = {};
  }

  async executar() {
    console.log('🔧 Configurador ASC - Geração de .env\n');
    
    try {
      await this.detectarAmbiente();
      await this.configurarSeguranca();
      await this.configurarBancoDados();
      await this.configurarServidor();
      await this.configurarOpcoes();
      await this.gerarArquivo();
      
      console.log('\n✅ Arquivo .env criado com sucesso!');
      console.log('🚀 Execute: npm start');
      
    } catch (error) {
      console.error('❌ Erro:', error.message);
    } finally {
      this.rl.close();
    }
  }

  async detectarAmbiente() {
    console.log('📋 CONFIGURAÇÃO DO AMBIENTE\n');
    
    const ambiente = await this.pergunta(
      'Ambiente (development/production): ',
      'development'
    );
    
    this.configuracao.NODE_ENV = ambiente;
    
    if (ambiente === 'production') {
      console.log('⚠️  PRODUÇÃO: Configurações de segurança obrigatórias');
    }
  }

  async configurarSeguranca() {
    console.log('\n🔐 CONFIGURAÇÕES DE SEGURANÇA\n');
    
    // Chave secreta
    const gerarChave = await this.perguntaSimNao(
      'Gerar chave secreta automaticamente? (s/n): ',
      true
    );
    
    if (gerarChave) {
      this.configuracao.CHAVE_SECRETA = crypto.randomBytes(64).toString('hex');
      console.log('✅ Chave secreta gerada automaticamente');
    } else {
      const chave = await this.pergunta('Digite sua chave secreta (64+ caracteres): ');
      if (chave.length < 64) {
        throw new Error('Chave secreta deve ter pelo menos 64 caracteres');
      }
      this.configuracao.CHAVE_SECRETA = chave;
    }

    // Configurações JWT
    this.configuracao.JWT_ALGORITMO = await this.pergunta(
      'Algoritmo JWT (HS256/HS384/HS512): ',
      'HS256'
    );
    
    this.configuracao.TEMPO_EXPIRACAO_TOKEN = await this.pergunta(
      'Tempo expiração token (24h/1h/30m): ',
      '24h'
    );
    
    this.configuracao.TEMPO_EXPIRACAO_REFRESH = await this.pergunta(
      'Tempo expiração refresh token (7d/30d): ',
      '7d'
    );

    // Configurações de senha
    this.configuracao.SENHA_TAMANHO_MINIMO = await this.pergunta(
      'Tamanho mínimo da senha (8-20): ',
      '8'
    );
    
    this.configuracao.BCRYPT_SALT_ROUNDS = await this.pergunta(
      'Rounds de salt bcrypt (10-15): ',
      '12'
    );

    // Salt de criptografia
    this.configuracao.CRYPTO_SALT = crypto.randomBytes(32).toString('hex');
  }

  async configurarBancoDados() {
    console.log('\n💾 CONFIGURAÇÃO DO BANCO DE DADOS\n');
    
    const tipoBanco = await this.perguntaEscolha(
      'Tipo de banco de dados:',
      ['memoria', 'postgresql', 'mongodb', 'mysql', 'sqlite'],
      'memoria'
    );
    
    switch (tipoBanco) {
      case 'postgresql':
        await this.configurarPostgreSQL();
        break;
      case 'mongodb':
        await this.configurarMongoDB();
        break;
      case 'mysql':
        await this.configurarMySQL();
        break;
      case 'sqlite':
        this.configuracao.SQLITE_FILE = await this.pergunta(
          'Arquivo SQLite: ',
          'database.db'
        );
        break;
      default:
        console.log('✅ Usando banco em memória (desenvolvimento)');
    }
  }

  async configurarPostgreSQL() {
    const host = await this.pergunta('Host PostgreSQL: ', 'localhost');
    const porta = await this.pergunta('Porta PostgreSQL: ', '5432');
    const database = await this.pergunta('Nome do banco: ', 'asc_auth');
    const usuario = await this.pergunta('Usuário: ');
    const senha = await this.pergunta('Senha: ');
    
    this.configuracao.DATABASE_URL = 
      `postgresql://${usuario}:${senha}@${host}:${porta}/${database}`;
  }

  async configurarMongoDB() {
    const host = await this.pergunta('Host MongoDB: ', 'localhost');
    const porta = await this.pergunta('Porta MongoDB: ', '27017');
    const database = await this.pergunta('Nome do banco: ', 'asc_auth');
    
    this.configuracao.MONGODB_URI = `mongodb://${host}:${porta}/${database}`;
  }

  async configurarMySQL() {
    const host = await this.pergunta('Host MySQL: ', 'localhost');
    const porta = await this.pergunta('Porta MySQL: ', '3306');
    const database = await this.pergunta('Nome do banco: ', 'asc_auth');
    const usuario = await this.pergunta('Usuário: ');
    const senha = await this.pergunta('Senha: ');
    
    this.configuracao.MYSQL_URL = 
      `mysql://${usuario}:${senha}@${host}:${porta}/${database}`;
  }

  async configurarServidor() {
    console.log('\n🌐 CONFIGURAÇÃO DO SERVIDOR\n');
    
    this.configuracao.PORTA = await this.pergunta('Porta do servidor: ', '3000');
    
    const configurarCors = await this.perguntaSimNao(
      'Configurar CORS? (s/n): ',
      true
    );
    
    if (configurarCors) {
      this.configuracao.CORS_ORIGIN = await this.pergunta(
        'Origens CORS (separadas por vírgula): ',
        'http://localhost:3000,http://localhost:3001'
      );
    }
    
    const usarHttps = await this.perguntaSimNao(
      'Usar HTTPS? (s/n): ',
      false
    );
    
    if (usarHttps) {
      this.configuracao.HTTPS = 'true';
      this.configuracao.SSL_CERT = await this.pergunta('Caminho do certificado SSL: ');
      this.configuracao.SSL_KEY = await this.pergunta('Caminho da chave SSL: ');
    }
  }

  async configurarOpcoes() {
    console.log('\n⚙️  OPÇÕES AVANÇADAS\n');
    
    const configurarAvancado = await this.perguntaSimNao(
      'Configurar opções avançadas? (s/n): ',
      false
    );
    
    if (configurarAvancado) {
      // Rate limiting
      this.configuracao.RATE_LIMIT_MAX_AUTH = await this.pergunta(
        'Max tentativas de login (por 15min): ',
        '5'
      );
      
      this.configuracao.RATE_LIMIT_MAX_REGISTRO = await this.pergunta(
        'Max registros (por hora): ',
        '3'
      );
      
      // IP blocking
      this.configuracao.IP_MAX_TENTATIVAS = await this.pergunta(
        'Max tentativas por IP: ',
        '5'
      );
      
      this.configuracao.IP_BLOQUEIO_TEMPO = await this.pergunta(
        'Tempo de bloqueio (minutos): ',
        '15'
      );
    }
  }

  async gerarArquivo() {
    const caminhoEnv = path.join(process.cwd(), '.env');
    
    // Backup se já existir
    if (fs.existsSync(caminhoEnv)) {
      const backup = `${caminhoEnv}.backup.${Date.now()}`;
      fs.copyFileSync(caminhoEnv, backup);
      console.log(`📋 Backup criado: ${backup}`);
    }
    
    const conteudo = this.gerarConteudoEnv();
    fs.writeFileSync(caminhoEnv, conteudo);
  }

  gerarConteudoEnv() {
    const timestamp = new Date().toISOString();
    
    let conteudo = `# ========================================
# ASC - Configuração Gerada Automaticamente
# Gerado em: ${timestamp}
# ========================================

`;

    // Configurações essenciais
    conteudo += `# CONFIGURAÇÕES ESSENCIAIS
NODE_ENV=${this.configuracao.NODE_ENV}
CHAVE_SECRETA=${this.configuracao.CHAVE_SECRETA}

`;

    // JWT
    conteudo += `# CONFIGURAÇÕES JWT
JWT_ALGORITMO=${this.configuracao.JWT_ALGORITMO}
TEMPO_EXPIRACAO_TOKEN=${this.configuracao.TEMPO_EXPIRACAO_TOKEN}
TEMPO_EXPIRACAO_REFRESH=${this.configuracao.TEMPO_EXPIRACAO_REFRESH}

`;

    // Senha e criptografia
    conteudo += `# CONFIGURAÇÕES DE SEGURANÇA
SENHA_TAMANHO_MINIMO=${this.configuracao.SENHA_TAMANHO_MINIMO}
BCRYPT_SALT_ROUNDS=${this.configuracao.BCRYPT_SALT_ROUNDS}
CRYPTO_SALT=${this.configuracao.CRYPTO_SALT}

`;

    // Servidor
    conteudo += `# CONFIGURAÇÕES DO SERVIDOR
PORTA=${this.configuracao.PORTA}
`;
    
    if (this.configuracao.CORS_ORIGIN) {
      conteudo += `CORS_ORIGIN=${this.configuracao.CORS_ORIGIN}\n`;
    }
    
    if (this.configuracao.HTTPS) {
      conteudo += `HTTPS=${this.configuracao.HTTPS}
SSL_CERT=${this.configuracao.SSL_CERT}
SSL_KEY=${this.configuracao.SSL_KEY}
`;
    }

    // Banco de dados
    if (this.configuracao.DATABASE_URL) {
      conteudo += `
# BANCO DE DADOS
DATABASE_URL=${this.configuracao.DATABASE_URL}
`;
    }
    
    if (this.configuracao.MONGODB_URI) {
      conteudo += `
# BANCO DE DADOS
MONGODB_URI=${this.configuracao.MONGODB_URI}
`;
    }
    
    if (this.configuracao.MYSQL_URL) {
      conteudo += `
# BANCO DE DADOS
MYSQL_URL=${this.configuracao.MYSQL_URL}
`;
    }

    // Opções avançadas
    if (this.configuracao.RATE_LIMIT_MAX_AUTH) {
      conteudo += `
# RATE LIMITING
RATE_LIMIT_MAX_AUTH=${this.configuracao.RATE_LIMIT_MAX_AUTH}
RATE_LIMIT_MAX_REGISTRO=${this.configuracao.RATE_LIMIT_MAX_REGISTRO}

# IP BLOCKING
IP_MAX_TENTATIVAS=${this.configuracao.IP_MAX_TENTATIVAS}
IP_BLOQUEIO_TEMPO=${this.configuracao.IP_BLOQUEIO_TEMPO}
`;
    }

    return conteudo;
  }

  async pergunta(texto, padrao = '') {
    return new Promise((resolve) => {
      this.rl.question(texto, (resposta) => {
        resolve(resposta.trim() || padrao);
      });
    });
  }

  async perguntaSimNao(texto, padrao = true) {
    const resposta = await this.pergunta(texto, padrao ? 's' : 'n');
    return resposta.toLowerCase().startsWith('s');
  }

  async perguntaEscolha(texto, opcoes, padrao) {
    console.log(texto);
    opcoes.forEach((opcao, index) => {
      const marcador = opcao === padrao ? '→' : ' ';
      console.log(`${marcador} ${index + 1}. ${opcao}`);
    });
    
    const resposta = await this.pergunta('Escolha (número): ');
    const indice = parseInt(resposta) - 1;
    
    if (indice >= 0 && indice < opcoes.length) {
      return opcoes[indice];
    }
    
    return padrao;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const configurador = new ConfiguradorEnv();
  configurador.executar().catch(console.error);
}

module.exports = ConfiguradorEnv;