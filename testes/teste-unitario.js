/**
 * Testes Unitários ASC
 * Testa componentes individuais
 * 
 * @copyright 2025 AsyncCypher
 */

const MotorASC = require('../src/nucleo/motor-asc');
const DetectorAnomalias = require('../src/seguranca/detector-anomalias');
const SistemaHoneypot = require('../src/seguranca/sistema-honeypot');
const FingerprintDispositivo = require('../src/seguranca/fingerprint-dispositivo');

class TesteUnitario {
  constructor() {
    this.resultados = [];
  }

  log(teste, sucesso, detalhes = '') {
    const status = sucesso ? '✓' : '✗';
    const resultado = { teste, sucesso, detalhes };
    this.resultados.push(resultado);
    console.log(`${status} ${teste}${detalhes ? ' - ' + detalhes : ''}`);
  }

  async executarTeste(nome, funcaoTeste) {
    try {
      await funcaoTeste();
      this.log(nome, true);
      return true;
    } catch (error) {
      this.log(nome, false, error.message);
      return false;
    }
  }

  // Testes do Motor ASC
  async testarCriptografiaSenha() {
    return this.executarTeste('Motor ASC - Criptografia de senha', async () => {
      const senha = 'TesteSenha123!';
      const hash = await MotorASC.criptografarSenha(senha);
      
      if (!hash || hash === senha) {
        throw new Error('Hash não foi gerado corretamente');
      }
      
      const valida = await MotorASC.verificarSenha(senha, hash);
      if (!valida) {
        throw new Error('Verificação de senha falhou');
      }
    });
  }

  async testarValidacaoComplexidadeSenha() {
    return this.executarTeste('Motor ASC - Validação complexidade senha', async () => {
      const senhaFraca = '123';
      const senhaForte = 'MinhaSenh@123';
      
      const validacaoFraca = MotorASC.validarComplexidadeSenha(senhaFraca);
      const validacaoForte = MotorASC.validarComplexidadeSenha(senhaForte);
      
      if (validacaoFraca.valida) {
        throw new Error('Senha fraca foi aceita');
      }
      
      if (!validacaoForte.valida) {
        throw new Error('Senha forte foi rejeitada');
      }
    });
  }

  async testarGeracaoToken() {
    return this.executarTeste('Motor ASC - Geração e verificação de token', async () => {
      const payload = { id: 'teste123', email: 'teste@exemplo.com' };
      const token = MotorASC.gerarToken(payload);
      
      if (!token) {
        throw new Error('Token não foi gerado');
      }
      
      const payloadVerificado = MotorASC.verificarToken(token);
      if (payloadVerificado.id !== payload.id) {
        throw new Error('Payload do token não confere');
      }
    });
  }

  async testarFingerprinting() {
    return this.executarTeste('Fingerprinting - Geração de fingerprint', async () => {
      const reqMock = {
        headers: {
          'user-agent': 'Mozilla/5.0 (Test Browser)',
          'accept-language': 'pt-BR,pt;q=0.9',
          'accept-encoding': 'gzip, deflate'
        },
        body: {
          resolucaoTela: '1920x1080',
          fusoHorario: 'America/Sao_Paulo'
        }
      };
      
      const fingerprint = FingerprintDispositivo.gerar(reqMock);
      
      if (!fingerprint.fingerprint) {
        throw new Error('Fingerprint não foi gerado');
      }
      
      if (fingerprint.confidence < 0 || fingerprint.confidence > 100) {
        throw new Error('Confiança do fingerprint inválida');
      }
    });
  }

  async testarHoneypot() {
    return this.executarTeste('Honeypot - Validação de submissão', async () => {
      // Teste com bot (preencheu honeypot)
      const dadosBot = {
        email: 'teste@exemplo.com',
        senha: 'senha123',
        email_confirmacao: 'preenchido-por-bot', // Campo honeypot
        timestamp: Date.now().toString()
      };
      
      const validacaoBot = SistemaHoneypot.validarSubmissao(dadosBot, '192.168.1.100');
      if (!validacaoBot.isBot) {
        throw new Error('Bot não foi detectado');
      }
      
      // Teste com humano (não preencheu honeypot)
      const dadosHumano = {
        email: 'teste@exemplo.com',
        senha: 'senha123',
        email_confirmacao: '', // Campo honeypot vazio
        timestamp: (Date.now() - 5000).toString() // 5 segundos atrás
      };
      
      const validacaoHumano = SistemaHoneypot.validarSubmissao(dadosHumano, '192.168.1.101');
      if (validacaoHumano.isBot) {
        throw new Error('Humano foi detectado como bot');
      }
    });
  }

  async testarDetectorAnomalias() {
    return this.executarTeste('Detector Anomalias - Análise de login', async () => {
      const dadosLogin = {
        ip: '192.168.1.100',
        localizacao: { lat: -23.5505, lon: -46.6333 }, // São Paulo
        timestamp: Date.now(),
        fingerprint: 'fingerprint-teste',
        userAgent: 'Mozilla/5.0 (Test)'
      };
      
      const analise = await DetectorAnomalias.analisarTentativaLogin('usuario-teste', dadosLogin);
      
      if (typeof analise.isAnomalous !== 'boolean') {
        throw new Error('Análise de anomalia inválida');
      }
      
      if (!analise.riskLevel) {
        throw new Error('Nível de risco não definido');
      }
    });
  }

  async testarGeracaoChaves() {
    return this.executarTeste('Motor ASC - Geração de chaves', async () => {
      const chaveSecreta = MotorASC.gerarChaveSecreta();
      const idSessao = MotorASC.gerarIdSessao();
      const salt = MotorASC.gerarSalt();
      
      if (!chaveSecreta || chaveSecreta.length < 64) {
        throw new Error('Chave secreta inválida');
      }
      
      if (!idSessao || idSessao.length < 32) {
        throw new Error('ID de sessão inválido');
      }
      
      if (!salt || salt.length < 32) {
        throw new Error('Salt inválido');
      }
    });
  }

  async executarTodosTestesUnitarios() {
    console.log('🔬 Iniciando testes unitários...\n');

    const testes = [
      () => this.testarCriptografiaSenha(),
      () => this.testarValidacaoComplexidadeSenha(),
      () => this.testarGeracaoToken(),
      () => this.testarGeracaoChaves(),
      () => this.testarFingerprinting(),
      () => this.testarHoneypot(),
      () => this.testarDetectorAnomalias()
    ];

    let sucessos = 0;
    let falhas = 0;

    for (const teste of testes) {
      const resultado = await teste();
      if (resultado) {
        sucessos++;
      } else {
        falhas++;
      }
    }

    console.log('\n📊 Resultados dos testes unitários:');
    console.log(`   ✓ Sucessos: ${sucessos}`);
    console.log(`   ✗ Falhas: ${falhas}`);
    console.log(`   📈 Taxa de sucesso: ${((sucessos / (sucessos + falhas)) * 100).toFixed(1)}%`);

    if (falhas > 0) {
      console.log('\n❌ Testes que falharam:');
      this.resultados
        .filter(r => !r.sucesso)
        .forEach(r => console.log(`   - ${r.teste}: ${r.detalhes}`));
    }

    return { sucessos, falhas, total: sucessos + falhas };
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const teste = new TesteUnitario();
  
  teste.executarTodosTestesUnitarios()
    .then(resultado => {
      if (resultado.falhas === 0) {
        console.log('\n🎉 Todos os testes unitários passaram!');
        process.exit(0);
      } else {
        console.log('\n⚠️ Alguns testes unitários falharam.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Erro durante testes unitários:', error.message);
      process.exit(1);
    });
}

module.exports = TesteUnitario;