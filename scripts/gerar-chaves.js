/**
 * Script de Geração de Chaves
 * Gera chaves criptográficas para o sistema ASC
 * 
 * @copyright 2025 AsyncCypher
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class GeradorChaves {
  constructor() {
    this.diretorioChaves = path.join(__dirname, '../chaves');
    this.criarDiretorio();
  }

  criarDiretorio() {
    if (!fs.existsSync(this.diretorioChaves)) {
      fs.mkdirSync(this.diretorioChaves, { recursive: true });
      console.log(`📁 Diretório criado: ${this.diretorioChaves}`);
    }
  }

  gerarChaveSecreta(tamanho = 64) {
    return crypto.randomBytes(tamanho).toString('hex');
  }

  gerarParChavesRSA(tamanho = 2048) {
    console.log(`🔑 Gerando par de chaves RSA ${tamanho} bits...`);
    
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: tamanho,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return { publicKey, privateKey };
  }

  gerarChaveJWT() {
    console.log('🎫 Gerando chave JWT...');
    return this.gerarChaveSecreta(64);
  }

  gerarChaveCriptografia() {
    console.log('🔐 Gerando chave de criptografia AES...');
    return this.gerarChaveSecreta(32); // 256 bits
  }

  gerarSaltSenhas() {
    console.log('🧂 Gerando salt para senhas...');
    return this.gerarChaveSecreta(32);
  }

  gerarChaveHMAC() {
    console.log('🔏 Gerando chave HMAC...');
    return this.gerarChaveSecreta(64);
  }

  salvarChave(nome, conteudo, extensao = '.key') {
    const caminhoArquivo = path.join(this.diretorioChaves, `${nome}${extensao}`);
    fs.writeFileSync(caminhoArquivo, conteudo, 'utf8');
    console.log(`✅ Chave salva: ${caminhoArquivo}`);
    return caminhoArquivo;
  }

  gerarArquivoEnv() {
    console.log('📄 Gerando arquivo .env com chaves...');

    const chaveJWT = this.gerarChaveJWT();
    const chaveCriptografia = this.gerarChaveCriptografia();
    const saltSenhas = this.gerarSaltSenhas();
    const chaveHMAC = this.gerarChaveHMAC();

    const conteudoEnv = `# Configurações de Segurança ASC
# Gerado automaticamente em ${new Date().toISOString()}
# ⚠️ MANTENHA ESTAS CHAVES SEGURAS E NUNCA COMPARTILHE

# Chave principal JWT
CHAVE_SECRETA=${chaveJWT}

# Chave de criptografia AES-256
CHAVE_CRIPTOGRAFIA=${chaveCriptografia}

# Salt para hash de senhas
SALT_SENHAS=${saltSenhas}

# Chave HMAC para assinaturas
CHAVE_HMAC=${chaveHMAC}

# Configurações do servidor
PORTA=3000
NODE_ENV=development
NIVEL_LOG=info

# Configurações de segurança
MAX_TENTATIVAS_LOGIN=5
TEMPO_BLOQUEIO_IP=900000
TEMPO_EXPIRACAO_TOKEN=86400000
TEMPO_EXPIRACAO_REFRESH=604800000

# Configurações de rate limiting
RATE_LIMIT_JANELA=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=5

# Configurações de sessão
SESSAO_TEMPO_VIDA=86400000
SESSAO_RENOVACAO_AUTO=true
SESSAO_MULTIPLAS_PERMITIDAS=true
`;

    const caminhoEnv = path.join(process.cwd(), '.env');
    const caminhoEnvExemplo = path.join(process.cwd(), '.env.exemplo');

    // Salvar .env.exemplo (sem valores reais)
    const exemploEnv = conteudoEnv.replace(/=.+$/gm, '=');
    fs.writeFileSync(caminhoEnvExemplo, exemploEnv);
    console.log(`✅ Arquivo exemplo criado: ${caminhoEnvExemplo}`);

    // Verificar se .env já existe
    if (fs.existsSync(caminhoEnv)) {
      const backup = `${caminhoEnv}.backup.${Date.now()}`;
      fs.copyFileSync(caminhoEnv, backup);
      console.log(`📋 Backup do .env existente: ${backup}`);
    }

    fs.writeFileSync(caminhoEnv, conteudoEnv);
    console.log(`✅ Arquivo .env criado: ${caminhoEnv}`);

    return {
      chaveJWT,
      chaveCriptografia,
      saltSenhas,
      chaveHMAC
    };
  }

  gerarTodasChaves() {
    console.log('🔐 ASC - Gerador de Chaves Criptográficas');
    console.log('Copyright (c) 2025 AsyncCypher\n');

    try {
      // Gerar chaves RSA
      const { publicKey, privateKey } = this.gerarParChavesRSA();
      this.salvarChave('rsa_publica', publicKey, '.pem');
      this.salvarChave('rsa_privada', privateKey, '.pem');

      // Gerar chaves simétricas
      const chaves = this.gerarArquivoEnv();

      // Salvar chaves individuais
      this.salvarChave('jwt', chaves.chaveJWT);
      this.salvarChave('criptografia', chaves.chaveCriptografia);
      this.salvarChave('salt', chaves.saltSenhas);
      this.salvarChave('hmac', chaves.chaveHMAC);

      // Gerar chave mestra (para criptografar outras chaves)
      const chaveMestra = this.gerarChaveSecreta(64);
      this.salvarChave('mestra', chaveMestra);

      // Relatório de segurança
      this.gerarRelatorioSeguranca();

      console.log('\n🎉 Todas as chaves foram geradas com sucesso!');
      console.log('\n⚠️ IMPORTANTE:');
      console.log('1. Mantenha as chaves em local seguro');
      console.log('2. Faça backup das chaves regularmente');
      console.log('3. Nunca compartilhe as chaves privadas');
      console.log('4. Use HTTPS em produção');
      console.log('5. Considere usar um HSM para chaves críticas');

    } catch (error) {
      console.error('❌ Erro ao gerar chaves:', error.message);
      process.exit(1);
    }
  }

  gerarRelatorioSeguranca() {
    const relatorio = {
      geradoEm: new Date().toISOString(),
      versaoNode: process.version,
      plataforma: process.platform,
      chaves: {
        rsa: {
          tamanho: 2048,
          algoritmo: 'RSA',
          formato: 'PEM'
        },
        jwt: {
          tamanho: 512, // bits
          algoritmo: 'HS256'
        },
        criptografia: {
          tamanho: 256, // bits
          algoritmo: 'AES-256-CBC'
        },
        hmac: {
          tamanho: 512, // bits
          algoritmo: 'HMAC-SHA256'
        }
      },
      recomendacoes: [
        'Rotacionar chaves a cada 90 dias',
        'Usar diferentes chaves para diferentes ambientes',
        'Implementar monitoramento de uso de chaves',
        'Considerar uso de HSM para produção',
        'Manter logs de acesso às chaves'
      ]
    };

    const caminhoRelatorio = path.join(this.diretorioChaves, 'relatorio-seguranca.json');
    fs.writeFileSync(caminhoRelatorio, JSON.stringify(relatorio, null, 2));
    console.log(`📊 Relatório de segurança: ${caminhoRelatorio}`);
  }

  rotacionarChaves() {
    console.log('🔄 Iniciando rotação de chaves...');
    
    // Fazer backup das chaves atuais
    const timestamp = Date.now();
    const diretorioBackup = path.join(this.diretorioChaves, `backup-${timestamp}`);
    
    if (fs.existsSync(this.diretorioChaves)) {
      fs.mkdirSync(diretorioBackup, { recursive: true });
      
      const arquivos = fs.readdirSync(this.diretorioChaves);
      arquivos.forEach(arquivo => {
        if (arquivo !== `backup-${timestamp}`) {
          const origem = path.join(this.diretorioChaves, arquivo);
          const destino = path.join(diretorioBackup, arquivo);
          fs.copyFileSync(origem, destino);
        }
      });
      
      console.log(`📋 Backup das chaves antigas: ${diretorioBackup}`);
    }

    // Gerar novas chaves
    this.gerarTodasChaves();
    
    console.log('✅ Rotação de chaves concluída!');
    console.log('⚠️ Atualize as configurações da aplicação com as novas chaves.');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const gerador = new GeradorChaves();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--rotacionar')) {
    gerador.rotacionarChaves();
  } else {
    gerador.gerarTodasChaves();
  }
}

module.exports = GeradorChaves;