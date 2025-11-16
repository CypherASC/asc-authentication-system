/**
 * Sistema de Logging
 * Logger centralizado para toda a aplicação
 * 
 * @copyright 2025 AsyncCypher
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.nivelLog = process.env.NIVEL_LOG || 'info';
    this.diretorioLogs = path.join(process.cwd(), 'logs');
    this.criarDiretorioLogs();
  }

  criarDiretorioLogs() {
    if (!fs.existsSync(this.diretorioLogs)) {
      fs.mkdirSync(this.diretorioLogs, { recursive: true });
    }
  }

  formatarMensagem(nivel, mensagem, dados = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      nivel,
      mensagem,
      ...dados
    };

    return JSON.stringify(logEntry);
  }

  escreverLog(nivel, mensagem, dados = {}) {
    const mensagemFormatada = this.formatarMensagem(nivel, mensagem, dados);
    
    // Console
    console.log(mensagemFormatada);
    
    // Arquivo
    const nomeArquivo = `${new Date().toISOString().split('T')[0]}.log`;
    const caminhoArquivo = path.join(this.diretorioLogs, nomeArquivo);
    
    fs.appendFileSync(caminhoArquivo, mensagemFormatada + '\n');
  }

  debug(mensagem, dados = {}) {
    if (this.deveLogar('debug')) {
      this.escreverLog('DEBUG', mensagem, dados);
    }
  }

  info(mensagem, dados = {}) {
    if (this.deveLogar('info')) {
      this.escreverLog('INFO', mensagem, dados);
    }
  }

  warn(mensagem, dados = {}) {
    if (this.deveLogar('warn')) {
      this.escreverLog('WARN', mensagem, dados);
    }
  }

  error(mensagem, dados = {}) {
    if (this.deveLogar('error')) {
      this.escreverLog('ERROR', mensagem, dados);
      
      // Log de erro separado
      const nomeArquivoErro = `erro-${new Date().toISOString().split('T')[0]}.log`;
      const caminhoArquivoErro = path.join(this.diretorioLogs, nomeArquivoErro);
      const mensagemFormatada = this.formatarMensagem('ERROR', mensagem, dados);
      
      fs.appendFileSync(caminhoArquivoErro, mensagemFormatada + '\n');
    }
  }

  deveLogar(nivel) {
    const niveis = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    return niveis[nivel] >= niveis[this.nivelLog];
  }

  // Métodos específicos para auditoria e segurança
  auditoria(acao, dados = {}) {
    const mensagemAuditoria = this.formatarMensagem('AUDIT', acao, dados);
    
    const nomeArquivoAuditoria = `auditoria-${new Date().toISOString().split('T')[0]}.log`;
    const caminhoArquivoAuditoria = path.join(this.diretorioLogs, nomeArquivoAuditoria);
    
    fs.appendFileSync(caminhoArquivoAuditoria, mensagemAuditoria + '\n');
  }

  seguranca(evento, dados = {}) {
    const mensagemSeguranca = this.formatarMensagem('SECURITY', evento, {
      nivel: dados.nivel || 'INFO',
      tipo: dados.tipo || evento,
      usuario: dados.usuario || 'anonimo',
      ip: dados.ip,
      userAgent: dados.userAgent,
      detalhes: dados.detalhes,
      risco: dados.risco || 'LOW',
      ...dados
    });
    
    const nomeArquivoSeguranca = `seguranca-${new Date().toISOString().split('T')[0]}.log`;
    const caminhoArquivoSeguranca = path.join(this.diretorioLogs, nomeArquivoSeguranca);
    
    fs.appendFileSync(caminhoArquivoSeguranca, mensagemSeguranca + '\n');
  }

  // Métodos de conveniência para segurança
  tentativaLogin(dados) {
    this.seguranca('TENTATIVA_LOGIN', {
      nivel: dados.sucesso ? 'INFO' : 'WARN',
      usuario: dados.email,
      ip: dados.ip,
      userAgent: dados.userAgent,
      detalhes: {
        sucesso: dados.sucesso,
        motivo: dados.motivo,
        tentativas: dados.tentativas
      },
      risco: dados.sucesso ? 'LOW' : 'MEDIUM'
    });
  }

  anomaliaDetectada(dados) {
    this.seguranca('ANOMALIA_DETECTADA', {
      nivel: 'WARN',
      usuario: dados.usuario,
      ip: dados.ip,
      userAgent: dados.userAgent,
      detalhes: {
        tipoAnomalia: dados.tipo,
        pontuacao: dados.pontuacao,
        razoes: dados.razoes
      },
      risco: dados.risco || 'HIGH'
    });
  }

  bloqueioIP(dados) {
    this.seguranca('BLOQUEIO_IP', {
      nivel: 'ERROR',
      ip: dados.ip,
      detalhes: {
        motivo: dados.motivo,
        duracao: dados.duracao,
        tentativas: dados.tentativas
      },
      risco: 'CRITICAL'
    });
  }

  ataqueCSRF(dados) {
    this.seguranca('TENTATIVA_CSRF', {
      nivel: 'ERROR',
      ip: dados.ip,
      userAgent: dados.userAgent,
      detalhes: {
        endpoint: dados.endpoint,
        tokenRecebido: dados.tokenRecebido ? 'presente' : 'ausente'
      },
      risco: 'HIGH'
    });
  }

  performance(metrica, dados = {}) {
    const mensagemPerformance = this.formatarMensagem('PERFORMANCE', metrica, dados);
    
    const nomeArquivoPerformance = `performance-${new Date().toISOString().split('T')[0]}.log`;
    const caminhoArquivoPerformance = path.join(this.diretorioLogs, nomeArquivoPerformance);
    
    fs.appendFileSync(caminhoArquivoPerformance, mensagemPerformance + '\n');
  }

  // Limpeza de logs antigos
  limparLogsAntigos(diasParaManter = 30) {
    const agora = new Date();
    const arquivos = fs.readdirSync(this.diretorioLogs);
    
    arquivos.forEach(arquivo => {
      const caminhoArquivo = path.join(this.diretorioLogs, arquivo);
      const stats = fs.statSync(caminhoArquivo);
      const diasDiferenca = (agora - stats.mtime) / (1000 * 60 * 60 * 24);
      
      if (diasDiferenca > diasParaManter) {
        fs.unlinkSync(caminhoArquivo);
        this.info(`Log antigo removido: ${arquivo}`);
      }
    });
  }
}

module.exports = new Logger();