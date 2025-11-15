/**
 * Script de Verificação de Integridade
 * Verifica a integridade dos arquivos do projeto ASC
 * 
 * @copyright 2025 AsyncCypher
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class VerificadorIntegridade {
  constructor() {
    this.caminhoManifesto = path.join(__dirname, '../.asc/manifesto.json');
    this.arquivosCriticos = [
      'package.json',
      'LICENSE',
      'src/nucleo/motor-asc.js',
      'src/nucleo/verificador-integridade.js'
    ];
  }

  calcularHashArquivo(caminhoArquivo) {
    try {
      const conteudo = fs.readFileSync(caminhoArquivo, 'utf8');
      return crypto.createHash('sha256').update(conteudo).digest('hex');
    } catch (error) {
      console.error(`❌ Erro ao calcular hash do arquivo ${caminhoArquivo}:`, error.message);
      return null;
    }
  }

  async verificarIntegridade() {
    console.log('🔍 Iniciando verificação de integridade...\n');

    try {
      // Verificar se manifesto existe
      if (!fs.existsSync(this.caminhoManifesto)) {
        console.log('⚠️ Manifesto não encontrado. Primeira execução ou arquivo removido.');
        return this.gerarManifesto();
      }

      const manifesto = JSON.parse(fs.readFileSync(this.caminhoManifesto, 'utf8'));
      let integridadeOk = true;
      const violacoes = [];

      // Verificar package.json
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      if (packageJson.name !== manifesto.metadadosProtegidos.nome) {
        violacoes.push({
          tipo: 'NOME_PROJETO_ALTERADO',
          esperado: manifesto.metadadosProtegidos.nome,
          encontrado: packageJson.name
        });
        integridadeOk = false;
      }

      if (packageJson.author !== manifesto.metadadosProtegidos.autor) {
        violacoes.push({
          tipo: 'AUTOR_ALTERADO',
          esperado: manifesto.metadadosProtegidos.autor,
          encontrado: packageJson.author
        });
        integridadeOk = false;
      }

      // Verificar hashes dos arquivos críticos
      console.log('📁 Verificando arquivos críticos:');
      for (const arquivo of this.arquivosCriticos) {
        if (fs.existsSync(arquivo)) {
          const hashAtual = this.calcularHashArquivo(arquivo);
          const hashEsperado = manifesto.arquivos[arquivo];

          if (hashEsperado && hashAtual !== hashEsperado) {
            console.log(`❌ ${arquivo} - Hash alterado`);
            violacoes.push({
              tipo: 'ARQUIVO_MODIFICADO',
              arquivo,
              hashEsperado,
              hashEncontrado: hashAtual
            });
            integridadeOk = false;
          } else {
            console.log(`✅ ${arquivo} - OK`);
          }
        } else {
          console.log(`⚠️ ${arquivo} - Arquivo não encontrado`);
        }
      }

      // Relatório final
      console.log('\n📊 Resultado da Verificação:');
      if (integridadeOk) {
        console.log('✅ Integridade verificada com sucesso!');
        console.log('🔒 Todos os arquivos críticos estão íntegros.');
      } else {
        console.log('❌ Violações de integridade detectadas!');
        console.log(`📋 Total de violações: ${violacoes.length}`);
        
        violacoes.forEach((violacao, index) => {
          console.log(`\n${index + 1}. ${violacao.tipo}`);
          if (violacao.arquivo) {
            console.log(`   Arquivo: ${violacao.arquivo}`);
          }
          if (violacao.esperado && violacao.encontrado) {
            console.log(`   Esperado: ${violacao.esperado}`);
            console.log(`   Encontrado: ${violacao.encontrado}`);
          }
        });

        // Registrar violações
        this.registrarViolacoes(violacoes);
      }

      return integridadeOk;

    } catch (error) {
      console.error('❌ Erro durante verificação de integridade:', error.message);
      return false;
    }
  }

  gerarManifesto() {
    console.log('📝 Gerando novo manifesto de integridade...');

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      const manifesto = {
        nomeProjeto: packageJson.name,
        versao: packageJson.version,
        autor: packageJson.author,
        licenca: packageJson.license,
        copyright: `Copyright (c) 2025 AsyncCypher. Todos os direitos reservados.`,
        geradoEm: new Date().toISOString(),
        repositorio: packageJson.repository?.url || '',
        arquivos: {},
        metadadosProtegidos: {
          nome: packageJson.name,
          descricao: packageJson.description,
          autor: packageJson.author,
          repositorio: packageJson.repository?.url || ''
        },
        configuracaoSeguranca: {
          verificacaoIntegridade: true,
          protecaoLicenca: true,
          logViolacoes: true,
          modoRestritivo: false
        }
      };

      // Calcular hashes dos arquivos críticos
      for (const arquivo of this.arquivosCriticos) {
        if (fs.existsSync(arquivo)) {
          const hash = this.calcularHashArquivo(arquivo);
          if (hash) {
            manifesto.arquivos[arquivo] = hash;
            console.log(`✅ Hash calculado para ${arquivo}`);
          }
        }
      }

      // Salvar manifesto
      fs.writeFileSync(this.caminhoManifesto, JSON.stringify(manifesto, null, 2));
      console.log('✅ Manifesto gerado com sucesso!');
      
      return true;

    } catch (error) {
      console.error('❌ Erro ao gerar manifesto:', error.message);
      return false;
    }
  }

  registrarViolacoes(violacoes) {
    const logViolacoes = path.join(__dirname, '../.asc/violacoes.log');
    
    const registro = {
      timestamp: new Date().toISOString(),
      violacoes,
      sistema: {
        plataforma: process.platform,
        versaoNode: process.version,
        pid: process.pid
      }
    };

    fs.appendFileSync(logViolacoes, JSON.stringify(registro) + '\n');
    console.log(`📝 Violações registradas em: ${logViolacoes}`);
  }

  async executarVerificacao() {
    console.log('🔐 ASC - Verificador de Integridade');
    console.log('Copyright (c) 2025 AsyncCypher\n');

    const resultado = await this.verificarIntegridade();
    
    console.log('\n' + '='.repeat(50));
    if (resultado) {
      console.log('🎉 Verificação concluída com sucesso!');
      process.exit(0);
    } else {
      console.log('⚠️ Verificação concluída com problemas.');
      console.log('📧 Para suporte: contato.asynccypher@gmail.com');
      process.exit(1);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const verificador = new VerificadorIntegridade();
  verificador.executarVerificacao();
}

module.exports = VerificadorIntegridade;