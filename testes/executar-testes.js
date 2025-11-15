/**
 * Executor de Testes ASC
 * Executa todos os tipos de teste
 * 
 * @copyright 2025 AsyncCypher
 */

const TesteUnitario = require('./teste-unitario');
const TesteAPI = require('./teste-api');

class ExecutorTestes {
  constructor() {
    this.resultadosGerais = {
      unitarios: null,
      api: null,
      inicio: new Date(),
      fim: null
    };
  }

  async verificarServidor() {
    console.log('🔍 Verificando se o servidor está rodando...');
    
    try {
      const response = await fetch('http://localhost:3000/saude', {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        console.log('✓ Servidor está rodando na porta 3000\n');
        return true;
      } else {
        throw new Error(`Servidor retornou status ${response.status}`);
      }
    } catch (error) {
      console.log('✗ Servidor não está rodando na porta 3000');
      console.log('💡 Para executar testes da API, inicie o servidor com: npm run iniciar\n');
      return false;
    }
  }

  async executarTestesUnitarios() {
    console.log('=' .repeat(60));
    console.log('🔬 EXECUTANDO TESTES UNITÁRIOS');
    console.log('=' .repeat(60));
    
    const testeUnitario = new TesteUnitario();
    this.resultadosGerais.unitarios = await testeUnitario.executarTodosTestesUnitarios();
    
    return this.resultadosGerais.unitarios.falhas === 0;
  }

  async executarTestesAPI() {
    console.log('\n' + '=' .repeat(60));
    console.log('🌐 EXECUTANDO TESTES DA API');
    console.log('=' .repeat(60));
    
    const servidorRodando = await this.verificarServidor();
    
    if (!servidorRodando) {
      console.log('⏭️ Pulando testes da API (servidor não disponível)\n');
      this.resultadosGerais.api = { sucessos: 0, falhas: 0, total: 0, pulado: true };
      return true;
    }

    const testeAPI = new TesteAPI();
    this.resultadosGerais.api = await testeAPI.executarTodosTestes();
    
    return this.resultadosGerais.api.falhas === 0;
  }

  gerarRelatorioFinal() {
    this.resultadosGerais.fim = new Date();
    const duracao = this.resultadosGerais.fim - this.resultadosGerais.inicio;

    console.log('\n' + '=' .repeat(60));
    console.log('📋 RELATÓRIO FINAL DOS TESTES');
    console.log('=' .repeat(60));

    console.log(`⏱️ Duração total: ${(duracao / 1000).toFixed(2)}s`);
    console.log(`📅 Executado em: ${this.resultadosGerais.inicio.toLocaleString('pt-BR')}`);

    // Testes Unitários
    const unit = this.resultadosGerais.unitarios;
    console.log('\n🔬 Testes Unitários:');
    console.log(`   Total: ${unit.total}`);
    console.log(`   ✓ Sucessos: ${unit.sucessos}`);
    console.log(`   ✗ Falhas: ${unit.falhas}`);
    console.log(`   📈 Taxa: ${((unit.sucessos / unit.total) * 100).toFixed(1)}%`);

    // Testes API
    const api = this.resultadosGerais.api;
    console.log('\n🌐 Testes da API:');
    if (api.pulado) {
      console.log('   Status: Pulado (servidor não disponível)');
    } else {
      console.log(`   Total: ${api.total}`);
      console.log(`   ✓ Sucessos: ${api.sucessos}`);
      console.log(`   ✗ Falhas: ${api.falhas}`);
      console.log(`   📈 Taxa: ${((api.sucessos / api.total) * 100).toFixed(1)}%`);
    }

    // Resumo Geral
    const totalSucessos = unit.sucessos + (api.pulado ? 0 : api.sucessos);
    const totalFalhas = unit.falhas + (api.pulado ? 0 : api.falhas);
    const totalTestes = unit.total + (api.pulado ? 0 : api.total);

    console.log('\n📊 Resumo Geral:');
    console.log(`   Total de testes: ${totalTestes}`);
    console.log(`   ✓ Total sucessos: ${totalSucessos}`);
    console.log(`   ✗ Total falhas: ${totalFalhas}`);
    
    if (totalTestes > 0) {
      console.log(`   📈 Taxa geral: ${((totalSucessos / totalTestes) * 100).toFixed(1)}%`);
    }

    // Status final
    if (totalFalhas === 0) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM!');
      console.log('✨ O sistema ASC está funcionando corretamente.');
    } else {
      console.log('\n⚠️ ALGUNS TESTES FALHARAM');
      console.log('🔧 Verifique os erros acima e corrija os problemas.');
    }

    console.log('\n' + '=' .repeat(60));

    return totalFalhas === 0;
  }

  async executarTodosTestes() {
    console.log('🧪 INICIANDO BATERIA COMPLETA DE TESTES ASC');
    console.log('Desenvolvido por AsyncCypher\n');

    try {
      // Executar testes unitários
      const unitariosOk = await this.executarTestesUnitarios();
      
      // Executar testes da API
      const apiOk = await this.executarTestesAPI();
      
      // Gerar relatório final
      const todosOk = this.gerarRelatorioFinal();
      
      return todosOk;
      
    } catch (error) {
      console.error('\n💥 Erro crítico durante execução dos testes:', error.message);
      console.error('Stack trace:', error.stack);
      return false;
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const executor = new ExecutorTestes();
  
  executor.executarTodosTestes()
    .then(sucesso => {
      process.exit(sucesso ? 0 : 1);
    })
    .catch(error => {
      console.error('Erro fatal:', error.message);
      process.exit(1);
    });
}

module.exports = ExecutorTestes;