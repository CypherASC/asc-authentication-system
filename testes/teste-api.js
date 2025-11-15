/**
 * Teste da API ASC
 * Testa todas as funcionalidades sem dados reais
 * 
 * @copyright 2025 AsyncCypher
 */

const { ASCSDK } = require('../sdk/asc-sdk');

// Dados de teste fictícios
const DADOS_TESTE = {
  usuario: {
    nome: 'Usuario Teste',
    email: 'teste@exemplo-ficticio.com',
    senha: 'SenhaSegura123!'
  },
  usuarioAtualizado: {
    nome: 'Usuario Teste Atualizado',
    telefone: '+55119999999999'
  },
  novaSenha: 'NovaSenhaSegura456!'
};

class TesteAPI {
  constructor() {
    this.asc = new ASCSDK({
      baseURL: 'http://localhost:3000',
      timeout: 10000
    });
    this.resultados = [];
  }

  log(teste, sucesso, detalhes = '') {
    const status = sucesso ? '✓' : '✗';
    const resultado = { teste, sucesso, detalhes, timestamp: new Date() };
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

  async testarRegistro() {
    return this.executarTeste('Registro de usuário', async () => {
      // Adicionar campos honeypot vazios e timestamp válido
      const dadosRegistro = {
        ...DADOS_TESTE.usuario,
        email_confirmacao: '',
        website: '',
        numero_telefone: '',
        timestamp: (Date.now() - 3000).toString() // 3 segundos atrás
      };
      
      const usuario = await this.asc.registrar(dadosRegistro);
      if (!usuario.email) throw new Error('Email não retornado');
    });
  }

  async testarLogin() {
    return this.executarTeste('Login de usuário', async () => {
      const opcoes = {
        email_confirmacao: '',
        website: '',
        numero_telefone: '',
        timestamp: (Date.now() - 3000).toString(),
        localizacao: {
          lat: -23.5505,
          lon: -46.6333,
          cidade: 'São Paulo',
          pais: 'Brasil'
        }
      };
      
      const sessao = await this.asc.login(
        DADOS_TESTE.usuario.email, 
        DADOS_TESTE.usuario.senha,
        opcoes
      );
      if (!this.asc.obterToken()) throw new Error('Token não definido');
      if (!sessao.usuario) throw new Error('Dados do usuário não retornados');
    });
  }

  async testarObterPerfil() {
    return this.executarTeste('Obter perfil', async () => {
      const perfil = await this.asc.obterPerfil();
      if (!perfil.email) throw new Error('Perfil não retornado');
    });
  }

  async testarAtualizarPerfil() {
    return this.executarTeste('Atualizar perfil', async () => {
      const perfilAtualizado = await this.asc.atualizarPerfil(DADOS_TESTE.usuarioAtualizado);
      if (perfilAtualizado.nome !== DADOS_TESTE.usuarioAtualizado.nome) {
        throw new Error('Perfil não foi atualizado');
      }
    });
  }

  async testarObterSessoes() {
    return this.executarTeste('Obter sessões', async () => {
      const sessoes = await this.asc.obterSessoes();
      if (!Array.isArray(sessoes)) throw new Error('Sessões não retornadas como array');
      if (sessoes.length === 0) throw new Error('Nenhuma sessão encontrada');
    });
  }

  async testarEstatisticasSessao() {
    return this.executarTeste('Estatísticas de sessão', async () => {
      const stats = await this.asc.obterEstatisticasSessao();
      if (typeof stats.totalSessoes !== 'number') {
        throw new Error('Estatísticas inválidas');
      }
    });
  }

  async testarAlterarSenha() {
    return this.executarTeste('Alterar senha', async () => {
      await this.asc.alterarSenha(DADOS_TESTE.usuario.senha, DADOS_TESTE.novaSenha);
      // Atualizar senha para próximos testes
      DADOS_TESTE.usuario.senha = DADOS_TESTE.novaSenha;
    });
  }

  async testarHoneypot() {
    return this.executarTeste('Campos honeypot', async () => {
      const honeypot = await this.asc.obterCamposHoneypot();
      if (!honeypot.fields || !Array.isArray(honeypot.fields)) {
        throw new Error('Campos honeypot inválidos');
      }
    });
  }

  async testarLogout() {
    return this.executarTeste('Logout', async () => {
      await this.asc.logout();
      if (this.asc.obterToken()) throw new Error('Token não foi removido');
    });
  }

  async testarErroCredenciaisInvalidas() {
    return this.executarTeste('Erro - Credenciais inválidas', async () => {
      try {
        const opcoes = {
          email_confirmacao: '',
          website: '',
          numero_telefone: '',
          timestamp: (Date.now() - 3000).toString()
        };
        
        await this.asc.login('email@inexistente.com', 'senhaErrada', opcoes);
        throw new Error('Login deveria ter falhado');
      } catch (error) {
        if (!error.message.includes('inválidas') && !error.message.includes('Credenciais')) {
          throw new Error('Erro esperado não foi retornado: ' + error.message);
        }
      }
    });
  }

  async testarErroTokenInvalido() {
    return this.executarTeste('Erro - Token inválido', async () => {
      // Salvar token atual
      const tokenOriginal = this.asc.obterToken();
      
      this.asc.definirToken('token-invalido');
      try {
        await this.asc.obterPerfil();
        throw new Error('Requisição deveria ter falhado');
      } catch (error) {
        if (!error.message.includes('inválido') && !error.message.includes('Token')) {
          throw new Error('Erro esperado não foi retornado: ' + error.message);
        }
      } finally {
        // Restaurar token original
        this.asc.definirToken(tokenOriginal);
      }
    });
  }

  async limparDados() {
    try {
      // Limpar dados do adaptador global se existir
      const response = await fetch('http://localhost:3000/api/teste/limpar', {
        method: 'POST'
      });
    } catch (error) {
      // Ignorar erro se endpoint não existir
    }
  }

  async executarTodosTestes() {
    // Definir ambiente de teste
    process.env.NODE_ENV = 'test';
    
    console.log('🧪 Iniciando testes da API ASC...\n');
    console.log('📋 Dados de teste (fictícios):');
    console.log(`   Email: ${DADOS_TESTE.usuario.email}`);
    console.log(`   Nome: ${DADOS_TESTE.usuario.nome}\n`);

    // Limpar dados antes de iniciar
    await this.limparDados();

    const testes = [
      () => this.testarRegistro(),
      () => this.testarLogin(),
      () => this.testarObterPerfil(),
      () => this.testarAtualizarPerfil(),
      () => this.testarObterSessoes(),
      () => this.testarEstatisticasSessao(),
      () => this.testarHoneypot(),
      () => this.testarAlterarSenha(),
      () => this.testarLogout(),
      () => this.testarErroCredenciaisInvalidas(),
      () => this.testarErroTokenInvalido()
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
      // Pequena pausa entre testes
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📊 Resultados dos testes:');
    console.log(`   ✓ Sucessos: ${sucessos}`);
    console.log(`   ✗ Falhas: ${falhas}`);
    console.log(`   📈 Taxa de sucesso: ${((sucessos / (sucessos + falhas)) * 100).toFixed(1)}%`);

    if (falhas > 0) {
      console.log('\n❌ Testes que falharam:');
      this.resultados
        .filter(r => !r.sucesso)
        .forEach(r => console.log(`   - ${r.teste}: ${r.detalhes}`));
    }

    console.log('\n🏁 Testes concluídos!');
    return { sucessos, falhas, total: sucessos + falhas };
  }

  gerarRelatorio() {
    const relatorio = {
      executadoEm: new Date().toISOString(),
      totalTestes: this.resultados.length,
      sucessos: this.resultados.filter(r => r.sucesso).length,
      falhas: this.resultados.filter(r => !r.sucesso).length,
      detalhes: this.resultados
    };

    return relatorio;
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const teste = new TesteAPI();
  
  teste.executarTodosTestes()
    .then(resultado => {
      if (resultado.falhas === 0) {
        console.log('\n🎉 Todos os testes passaram!');
        process.exit(0);
      } else {
        console.log('\n⚠️ Alguns testes falharam.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Erro durante execução dos testes:', error.message);
      process.exit(1);
    });
}

module.exports = TesteAPI;