/**
 * Gerador Rápido de .env
 * Cria .env com configurações padrão seguras
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class GeradorEnvRapido {
  static gerar(ambiente = 'development') {
    console.log(`🔧 Gerando .env para ${ambiente}...`);
    
    const configuracao = this.gerarConfiguracaoPadrao(ambiente);
    const conteudo = this.gerarConteudo(configuracao);
    
    const caminhoEnv = path.join(process.cwd(), '.env');
    
    // Backup se existir
    if (fs.existsSync(caminhoEnv)) {
      const backup = `${caminhoEnv}.backup.${Date.now()}`;
      fs.copyFileSync(caminhoEnv, backup);
      console.log(`📋 Backup: ${backup}`);
    }
    
    fs.writeFileSync(caminhoEnv, conteudo);
    console.log('✅ Arquivo .env criado!');
    
    if (ambiente === 'development') {
      console.log('⚠️  DESENVOLVIMENTO: Usando configurações padrão');
      console.log('🚀 Execute: npm start');
    } else {
      console.log('🔒 PRODUÇÃO: Revise as configurações antes de usar');
      console.log('📝 Edite o .env com valores reais');
    }
  }

  static gerarConfiguracaoPadrao(ambiente) {
    const chaveSecreta = crypto.randomBytes(64).toString('hex');
    const cryptoSalt = crypto.randomBytes(32).toString('hex');
    
    const config = {
      NODE_ENV: ambiente,
      CHAVE_SECRETA: chaveSecreta,
      
      // JWT
      JWT_ALGORITMO: 'HS256',
      TEMPO_EXPIRACAO_TOKEN: '24h',
      TEMPO_EXPIRACAO_REFRESH: '7d',
      
      // Segurança
      SENHA_TAMANHO_MINIMO: '8',
      BCRYPT_SALT_ROUNDS: '12',
      CRYPTO_SALT: cryptoSalt,
      
      // Servidor
      PORTA: '3000',
      CORS_ORIGIN: 'http://localhost:3000,http://localhost:3001',
      
      // Rate Limiting
      RATE_LIMIT_MAX_AUTH: '5',
      RATE_LIMIT_MAX_REGISTRO: '3',
      
      // IP Blocking
      IP_MAX_TENTATIVAS: '5',
      IP_BLOQUEIO_TEMPO: '15'
    };
    
    if (ambiente === 'production') {
      // Configurações mais restritivas para produção
      config.RATE_LIMIT_MAX_AUTH = '3';
      config.RATE_LIMIT_MAX_REGISTRO = '1';
      config.IP_MAX_TENTATIVAS = '3';
      config.IP_BLOQUEIO_TEMPO = '30';
      config.CORS_ORIGIN = ''; // Deve ser configurado manualmente
    }
    
    return config;
  }

  static gerarConteudo(config) {
    const timestamp = new Date().toISOString();
    
    return `# ========================================
# ASC - Configuração Rápida
# Gerado automaticamente em: ${timestamp}
# ========================================

# CONFIGURAÇÕES ESSENCIAIS
NODE_ENV=${config.NODE_ENV}
CHAVE_SECRETA=${config.CHAVE_SECRETA}

# CONFIGURAÇÕES JWT
JWT_ALGORITMO=${config.JWT_ALGORITMO}
TEMPO_EXPIRACAO_TOKEN=${config.TEMPO_EXPIRACAO_TOKEN}
TEMPO_EXPIRACAO_REFRESH=${config.TEMPO_EXPIRACAO_REFRESH}

# CONFIGURAÇÕES DE SEGURANÇA
SENHA_TAMANHO_MINIMO=${config.SENHA_TAMANHO_MINIMO}
BCRYPT_SALT_ROUNDS=${config.BCRYPT_SALT_ROUNDS}
CRYPTO_SALT=${config.CRYPTO_SALT}

# CONFIGURAÇÕES DO SERVIDOR
PORTA=${config.PORTA}
CORS_ORIGIN=${config.CORS_ORIGIN}

# RATE LIMITING
RATE_LIMIT_MAX_AUTH=${config.RATE_LIMIT_MAX_AUTH}
RATE_LIMIT_MAX_REGISTRO=${config.RATE_LIMIT_MAX_REGISTRO}

# IP BLOCKING
IP_MAX_TENTATIVAS=${config.IP_MAX_TENTATIVAS}
IP_BLOQUEIO_TEMPO=${config.IP_BLOQUEIO_TEMPO}

# ========================================
# CONFIGURAÇÕES OPCIONAIS
# Descomente e configure conforme necessário
# ========================================

# BANCO DE DADOS
# DATABASE_URL=postgresql://usuario:senha@localhost:5432/asc_auth
# MONGODB_URI=mongodb://localhost:27017/asc_auth
# MYSQL_URL=mysql://usuario:senha@localhost:3306/asc_auth

# SSL/HTTPS
# HTTPS=true
# SSL_CERT=/caminho/para/certificado.pem
# SSL_KEY=/caminho/para/chave-privada.pem

# LOGS
# LOG_LEVEL=info
# LOG_FILE=logs/asc.log
`;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const ambiente = process.argv[2] || 'development';
  GeradorEnvRapido.gerar(ambiente);
}

module.exports = GeradorEnvRapido;