/**
 * Interface base para adaptadores de banco de dados
 * 
 * @abstract
 * @copyright 2025 AsyncCypher
 */
class AdaptadorBancoDados {
  constructor(configuracao) {
    if (new.target === AdaptadorBancoDados) {
      throw new TypeError('Não é possível instanciar AdaptadorBancoDados diretamente');
    }
    this.configuracao = configuracao;
    this.conexao = null;
  }

  async conectar() {
    throw new Error('Método conectar() deve ser implementado');
  }

  async desconectar() {
    throw new Error('Método desconectar() deve ser implementado');
  }

  async verificarSaude() {
    throw new Error('Método verificarSaude() deve ser implementado');
  }

  // Operações de usuário
  async criarUsuario(dadosUsuario) {
    throw new Error('Método criarUsuario() deve ser implementado');
  }

  async buscarUsuarioPorEmail(email) {
    throw new Error('Método buscarUsuarioPorEmail() deve ser implementado');
  }

  async buscarUsuarioPorId(id) {
    throw new Error('Método buscarUsuarioPorId() deve ser implementado');
  }

  async atualizarUsuario(id, atualizacoes) {
    throw new Error('Método atualizarUsuario() deve ser implementado');
  }

  async deletarUsuario(id) {
    throw new Error('Método deletarUsuario() deve ser implementado');
  }

  // Operações de sessão
  async criarSessao(dadosSessao) {
    throw new Error('Método criarSessao() deve ser implementado');
  }

  async buscarSessaoPorId(id) {
    throw new Error('Método buscarSessaoPorId() deve ser implementado');
  }

  async buscarSessoesUsuario(idUsuario) {
    throw new Error('Método buscarSessoesUsuario() deve ser implementado');
  }

  async atualizarSessao(id, atualizacoes) {
    throw new Error('Método atualizarSessao() deve ser implementado');
  }

  async deletarSessao(id) {
    throw new Error('Método deletarSessao() deve ser implementado');
  }

  async deletarSessoesUsuario(idUsuario) {
    throw new Error('Método deletarSessoesUsuario() deve ser implementado');
  }

  // Operações de auditoria
  async criarLogAuditoria(dadosLog) {
    throw new Error('Método criarLogAuditoria() deve ser implementado');
  }

  async buscarLogsAuditoria(filtros, opcoes) {
    throw new Error('Método buscarLogsAuditoria() deve ser implementado');
  }

  // Operações de tokens revogados
  async revogarToken(dadosToken) {
    throw new Error('Método revogarToken() deve ser implementado');
  }

  async tokenRevogado(idToken) {
    throw new Error('Método tokenRevogado() deve ser implementado');
  }

  async limparTokensExpirados() {
    throw new Error('Método limparTokensExpirados() deve ser implementado');
  }

  // Operações de IPs bloqueados
  async bloquearIP(dadosBloqueio) {
    throw new Error('Método bloquearIP() deve ser implementado');
  }

  async ipBloqueado(ip) {
    throw new Error('Método ipBloqueado() deve ser implementado');
  }

  async desbloquearIP(ip) {
    throw new Error('Método desbloquearIP() deve ser implementado');
  }
}

module.exports = AdaptadorBancoDados;