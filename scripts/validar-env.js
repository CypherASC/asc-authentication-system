/**
 * Validador de Configurações .env
 * Verifica se todas as configurações necessárias estão presentes
 */

const fs = require('fs');
const path = require('path');

class ValidadorEnv {
  static validar() {
    console.log('🔍 Validando configurações .env...\n');
    
    const caminhoEnv = path.join(process.cwd(), '.env');
    
    if (!fs.existsSync(caminhoEnv)) {
      console.log('❌ Arquivo .env não encontrado');
      console.log('💡 Execute: npm run env:rapido');
      return false;
    }
    
    // Carregar .env
    require('dotenv').config();
    
    const validacao = {
      essenciais: this.validarEssenciais(),
      seguranca: this.validarSeguranca(),
      producao: this.validarProducao()
    };
    
    this.exibirResultados(validacao);
    
    const todasValidas = Object.values(validacao).every(v => v.valida);
    
    if (todasValidas) {
      console.log('\n✅ Todas as configurações estão válidas!');
    } else {
      console.log('\n⚠️  Algumas configurações precisam de atenção');
    }
    
    return todasValidas;
  }

  static validarEssenciais() {
    const essenciais = [
      'NODE_ENV',
      'CHAVE_SECRETA'
    ];
    
    const problemas = [];
    
    essenciais.forEach(chave => {
      if (!process.env[chave]) {
        problemas.push(`${chave} não definida`);
      }
    });
    
    // Validar chave secreta
    if (process.env.CHAVE_SECRETA && process.env.CHAVE_SECRETA.length < 64) {
      problemas.push('CHAVE_SECRETA deve ter pelo menos 64 caracteres');
    }
    
    return {
      valida: problemas.length === 0,
      problemas
    };
  }

  static validarSeguranca() {
    const problemas = [];
    
    // Validar algoritmo JWT
    const algoritmos = ['HS256', 'HS384', 'HS512'];
    const algoritmo = process.env.JWT_ALGORITMO || 'HS256';
    if (!algoritmos.includes(algoritmo)) {
      problemas.push(`JWT_ALGORITMO inválido: ${algoritmo}`);
    }
    
    // Validar salt rounds
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    if (saltRounds < 10 || saltRounds > 15) {
      problemas.push('BCRYPT_SALT_ROUNDS deve estar entre 10 e 15');
    }
    
    // Validar tamanho mínimo da senha
    const tamanhoMinimo = parseInt(process.env.SENHA_TAMANHO_MINIMO) || 8;
    if (tamanhoMinimo < 6 || tamanhoMinimo > 50) {
      problemas.push('SENHA_TAMANHO_MINIMO deve estar entre 6 e 50');
    }
    
    return {
      valida: problemas.length === 0,
      problemas
    };
  }

  static validarProducao() {
    if (process.env.NODE_ENV !== 'production') {
      return { valida: true, problemas: [] };
    }
    
    const problemas = [];
    
    // Validações específicas para produção
    if (!process.env.DATABASE_URL && !process.env.MONGODB_URI && !process.env.MYSQL_URL) {
      problemas.push('Banco de dados deve ser configurado em produção');
    }
    
    if (process.env.CHAVE_SECRETA && process.env.CHAVE_SECRETA.includes('exemplo')) {
      problemas.push('CHAVE_SECRETA não deve conter valores de exemplo');
    }
    
    if (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === '*') {
      problemas.push('CORS_ORIGIN deve ser específico em produção');
    }
    
    // Rate limiting mais restritivo
    const maxAuth = parseInt(process.env.RATE_LIMIT_MAX_AUTH) || 5;
    if (maxAuth > 5) {
      problemas.push('RATE_LIMIT_MAX_AUTH deve ser ≤ 5 em produção');
    }
    
    return {
      valida: problemas.length === 0,
      problemas
    };
  }

  static exibirResultados(validacao) {
    console.log('📋 RESULTADOS DA VALIDAÇÃO\n');
    
    // Essenciais
    console.log('🔑 Configurações Essenciais:');
    if (validacao.essenciais.valida) {
      console.log('   ✅ Todas válidas');
    } else {
      validacao.essenciais.problemas.forEach(problema => {
        console.log(`   ❌ ${problema}`);
      });
    }
    
    // Segurança
    console.log('\n🛡️  Configurações de Segurança:');
    if (validacao.seguranca.valida) {
      console.log('   ✅ Todas válidas');
    } else {
      validacao.seguranca.problemas.forEach(problema => {
        console.log(`   ⚠️  ${problema}`);
      });
    }
    
    // Produção
    if (process.env.NODE_ENV === 'production') {
      console.log('\n🏭 Configurações de Produção:');
      if (validacao.producao.valida) {
        console.log('   ✅ Todas válidas');
      } else {
        validacao.producao.problemas.forEach(problema => {
          console.log(`   ❌ ${problema}`);
        });
      }
    }
  }

  static gerarRelatorio() {
    const relatorio = {
      timestamp: new Date().toISOString(),
      ambiente: process.env.NODE_ENV || 'development',
      configuracoes: {
        jwt_algoritmo: process.env.JWT_ALGORITMO || 'HS256',
        tempo_token: process.env.TEMPO_EXPIRACAO_TOKEN || '24h',
        salt_rounds: process.env.BCRYPT_SALT_ROUNDS || '12',
        porta: process.env.PORTA || '3000',
        cors_configurado: !!process.env.CORS_ORIGIN,
        banco_configurado: !!(process.env.DATABASE_URL || process.env.MONGODB_URI || process.env.MYSQL_URL),
        https_habilitado: process.env.HTTPS === 'true'
      }
    };
    
    const arquivo = path.join(process.cwd(), 'logs', 'relatorio-config.json');
    
    // Criar diretório logs se não existir
    const dirLogs = path.dirname(arquivo);
    if (!fs.existsSync(dirLogs)) {
      fs.mkdirSync(dirLogs, { recursive: true });
    }
    
    fs.writeFileSync(arquivo, JSON.stringify(relatorio, null, 2));
    console.log(`📊 Relatório salvo: ${arquivo}`);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const sucesso = ValidadorEnv.validar();
  
  if (process.argv.includes('--relatorio')) {
    ValidadorEnv.gerarRelatorio();
  }
  
  process.exit(sucesso ? 0 : 1);
}

module.exports = ValidadorEnv;