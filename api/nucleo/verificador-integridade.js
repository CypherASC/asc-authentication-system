/**
 * ASC Verificador de Integridade
 * Sistema de verificação de integridade do código
 * 
 * ⚠️ ATENÇÃO: NÃO MODIFIQUE ESTE ARQUIVO
 * 
 * @copyright 2025 AsyncCypher
 * @license CC-BY-NC-ND-4.0
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class VerificadorIntegridade {
  constructor() {
    this.caminhoManifesto = path.join(__dirname, '../../.asc/manifesto.json');
    this.caminhoAssinatura = path.join(__dirname, '../../.asc/assinatura.json');
    this.arquivosCriticos = [
      'src/nucleo/motor-asc.js',
      'src/nucleo/validador-licenca.js',
      'src/nucleo/verificador-integridade.js',
      'package.json',
      'LICENSE'
    ];
  }

  calcularHashArquivo(caminhoArquivo) {
    try {
      const conteudo = fs.readFileSync(caminhoArquivo, 'utf8');
      return crypto.createHash('sha256').update(conteudo).digest('hex');
    } catch (error) {
      return null;
    }
  }

  async verificarIntegridade() {
    try {
      if (!fs.existsSync(this.caminhoManifesto)) {
        return true; // Primeira execução
      }

      const manifesto = JSON.parse(fs.readFileSync(this.caminhoManifesto, 'utf8'));
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

      if (packageJson.name !== manifesto.nomeProjeto) {
        this.registrarViolacao('NOME_PROJETO_MODIFICADO', {
          esperado: manifesto.nomeProjeto,
          encontrado: packageJson.name
        });
        return false;
      }

      if (packageJson.author !== manifesto.autor) {
        this.registrarViolacao('AUTOR_MODIFICADO', {
          esperado: manifesto.autor,
          encontrado: packageJson.author
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao verificar integridade:', error.message);
      return false;
    }
  }

  registrarViolacao(tipo, detalhes = {}) {
    const violacao = {
      tipo,
      detalhes,
      timestamp: new Date().toISOString(),
      sistema: {
        plataforma: process.platform,
        versaoNode: process.version,
        pid: process.pid
      }
    };

    const caminhoLog = path.join(__dirname, '../../.asc/violacoes.log');
    fs.appendFileSync(caminhoLog, JSON.stringify(violacao) + '\n');

    console.error(`
╔════════════════════════════════════════════════════════════════╗
║                   ⚠️  VIOLAÇÃO DE LICENÇA DETECTADA             ║
╠════════════════════════════════════════════════════════════════╣
║  Tipo: ${tipo.padEnd(56)}║
║  Timestamp: ${violacao.timestamp.padEnd(49)}║
║                                                                ║
║  Esta ação viola os termos da licença Creative Commons         ║
║  BY-NC-ND 4.0 e pode resultar em consequências legais.        ║
║                                                                ║
║  Contato: contato.asynccypher@gmail.com                        ║
╚════════════════════════════════════════════════════════════════╝
    `);
  }

  static async inicializar() {
    const verificador = new VerificadorIntegridade();
    const valido = await verificador.verificarIntegridade();

    if (!valido) {
      console.warn('⚠️ Sistema operando com integridade comprometida');
      process.env.ASC_INTEGRIDADE_COMPROMETIDA = 'true';
    }

    return valido;
  }
}

module.exports = VerificadorIntegridade;