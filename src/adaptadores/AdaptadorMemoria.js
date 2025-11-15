/**
 * Adaptador de Memória
 * Implementação em memória para desenvolvimento e testes
 * 
 * @copyright 2025 AsyncCypher
 */

const AdaptadorBancoDados = require('./AdaptadorBancoDados');

class AdaptadorMemoria extends AdaptadorBancoDados {
  constructor() {
    super({});
    this.usuarios = new Map();
    this.sessoes = new Map();
    this.logsAuditoria = [];
    this.tokensRevogados = new Set();
    this.ipsBloquados = new Map();
    this.conectado = false;
  }

  async conectar() {
    this.conectado = true;
    console.log('✅ Adaptador de memória conectado');
  }

  async desconectar() {
    this.conectado = false;
    console.log('👋 Adaptador de memória desconectado');
  }

  async verificarSaude() {
    return this.conectado;
  }

  // Operações de usuário
  async criarUsuario(dadosUsuario) {
    const usuario = {
      ...dadosUsuario,
      criadoEm: new Date(),
      atualizadoEm: new Date()
    };
    
    this.usuarios.set(usuario.id, usuario);
    return usuario;
  }

  async buscarUsuarioPorEmail(email) {
    for (const usuario of this.usuarios.values()) {
      if (usuario.email === email) {
        return usuario;
      }
    }
    return null;
  }

  async buscarUsuarioPorId(id) {
    return this.usuarios.get(id) || null;
  }

  async atualizarUsuario(id, atualizacoes) {
    const usuario = this.usuarios.get(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    const usuarioAtualizado = {
      ...usuario,
      ...atualizacoes,
      atualizadoEm: new Date()
    };

    this.usuarios.set(id, usuarioAtualizado);
    return usuarioAtualizado;
  }

  async deletarUsuario(id) {
    return this.usuarios.delete(id);
  }

  // Operações de sessão
  async criarSessao(dadosSessao) {
    const sessao = {
      ...dadosSessao,
      criadaEm: new Date(),
      atualizadaEm: new Date()
    };
    
    this.sessoes.set(sessao.id, sessao);
    return sessao;
  }

  async buscarSessaoPorId(id) {
    return this.sessoes.get(id) || null;
  }

  async buscarSessoesUsuario(idUsuario) {
    const sessoesUsuario = [];
    for (const sessao of this.sessoes.values()) {
      if (sessao.idUsuario === idUsuario) {
        sessoesUsuario.push(sessao);
      }
    }
    return sessoesUsuario;
  }

  async atualizarSessao(id, atualizacoes) {
    const sessao = this.sessoes.get(id);
    if (!sessao) {
      throw new Error('Sessão não encontrada');
    }

    const sessaoAtualizada = {
      ...sessao,
      ...atualizacoes,
      atualizadaEm: new Date()
    };

    this.sessoes.set(id, sessaoAtualizada);
    return sessaoAtualizada;
  }

  async deletarSessao(id) {
    return this.sessoes.delete(id);
  }

  async deletarSessoesUsuario(idUsuario) {
    let deletadas = 0;
    for (const [id, sessao] of this.sessoes.entries()) {
      if (sessao.idUsuario === idUsuario) {
        this.sessoes.delete(id);
        deletadas++;
      }
    }
    return deletadas;
  }

  // Operações de auditoria
  async criarLogAuditoria(dadosLog) {
    const log = {
      id: Date.now().toString(),
      ...dadosLog,
      criadoEm: new Date()
    };
    
    this.logsAuditoria.push(log);
    
    // Manter apenas os últimos 1000 logs
    if (this.logsAuditoria.length > 1000) {
      this.logsAuditoria.splice(0, this.logsAuditoria.length - 1000);
    }
    
    return log;
  }

  async buscarLogsAuditoria(filtros = {}, opcoes = {}) {
    let logs = [...this.logsAuditoria];

    // Aplicar filtros
    if (filtros.idUsuario) {
      logs = logs.filter(log => log.idUsuario === filtros.idUsuario);
    }

    if (filtros.acao) {
      logs = logs.filter(log => log.acao === filtros.acao);
    }

    if (filtros.ip) {
      logs = logs.filter(log => log.ip === filtros.ip);
    }

    if (filtros.dataInicio) {
      logs = logs.filter(log => new Date(log.criadoEm) >= new Date(filtros.dataInicio));
    }

    if (filtros.dataFim) {
      logs = logs.filter(log => new Date(log.criadoEm) <= new Date(filtros.dataFim));
    }

    // Ordenação
    logs.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

    // Paginação
    const limite = opcoes.limite || 50;
    const offset = opcoes.offset || 0;
    
    return logs.slice(offset, offset + limite);
  }

  // Operações de tokens revogados
  async revogarToken(dadosToken) {
    this.tokensRevogados.add(dadosToken.token);
  }

  async tokenRevogado(token) {
    return this.tokensRevogados.has(token);
  }

  async limparTokensExpirados() {
    // Em uma implementação real, verificaria a expiração dos tokens
    // Por simplicidade, limpar tokens mais antigos que 24h
    const agora = Date.now();
    let removidos = 0;
    
    // Como não temos timestamp dos tokens em memória,
    // vamos simular limpando metade dos tokens
    const tokens = Array.from(this.tokensRevogados);
    const metade = Math.floor(tokens.length / 2);
    
    for (let i = 0; i < metade; i++) {
      this.tokensRevogados.delete(tokens[i]);
      removidos++;
    }
    
    return removidos;
  }

  // Operações de IPs bloqueados
  async bloquearIP(dadosBloqueio) {
    this.ipsBloquados.set(dadosBloqueio.ip, {
      ...dadosBloqueio,
      bloqueadoEm: new Date()
    });
  }

  async ipBloqueado(ip) {
    const bloqueio = this.ipsBloquados.get(ip);
    if (!bloqueio) return false;

    // Verificar se ainda está dentro do período de bloqueio
    if (bloqueio.expiresEm && new Date() > new Date(bloqueio.expiresEm)) {
      this.ipsBloquados.delete(ip);
      return false;
    }

    return true;
  }

  async desbloquearIP(ip) {
    return this.ipsBloquados.delete(ip);
  }

  // Métodos utilitários para desenvolvimento
  limparTodos() {
    this.usuarios.clear();
    this.sessoes.clear();
    this.logsAuditoria.length = 0;
    this.tokensRevogados.clear();
    this.ipsBloquados.clear();
    console.log('🧽 Dados do adaptador de memória limpos');
  }

  obterEstatisticas() {
    return {
      usuarios: this.usuarios.size,
      sessoes: this.sessoes.size,
      logsAuditoria: this.logsAuditoria.length,
      tokensRevogados: this.tokensRevogados.size,
      ipsBloquados: this.ipsBloquados.size
    };
  }
}

module.exports = AdaptadorMemoria;