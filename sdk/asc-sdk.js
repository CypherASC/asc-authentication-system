/**
 * ASC SDK - Kit de Desenvolvimento de Software
 * SDK oficial para integração com o sistema ASC
 * 
 * @copyright 2025 AsyncCypher
 * @version 1.0.0
 */

class ASCSDK {
  constructor(configuracao = {}) {
    this.baseURL = configuracao.baseURL || '';
    this.apiKey = configuracao.apiKey || null;
    this.timeout = configuracao.timeout || 30000;
    this.token = configuracao.token || null;
    this.interceptadores = {
      requisicao: [],
      resposta: []
    };
    
    this.configurarInterceptadores();
  }

  // Configuração de interceptadores
  configurarInterceptadores() {
    this.interceptadores.requisicao.push((config) => {
      if (this.token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      if (this.apiKey) {
        config.headers = config.headers || {};
        config.headers['X-API-Key'] = this.apiKey;
      }
      return config;
    });
  }

  // Método base para requisições
  async requisicao(endpoint, opcoes = {}) {
    const url = this.baseURL + endpoint;
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...opcoes.headers
      },
      timeout: this.timeout,
      ...opcoes
    };

    // Aplicar interceptadores de requisição
    for (const interceptador of this.interceptadores.requisicao) {
      Object.assign(config, interceptador(config));
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const resposta = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const dados = await resposta.json();

      // Aplicar interceptadores de resposta
      for (const interceptador of this.interceptadores.resposta) {
        interceptador(dados, resposta);
      }

      if (!resposta.ok) {
        throw new ASCError(dados.mensagem || 'Erro na requisição', resposta.status, dados);
      }

      return dados;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ASCError('Timeout na requisição', 408);
      }
      throw error;
    }
  }

  // Métodos de Autenticação
  async registrar(dadosUsuario) {
    const dados = await this.requisicao('/api/autenticacao/registro', {
      method: 'POST',
      body: JSON.stringify(dadosUsuario)
    });

    return new UsuarioASC(dados.dados, this);
  }

  async login(email, senha, opcoes = {}) {
    const payload = {
      email,
      senha,
      ...opcoes
    };

    const dados = await this.requisicao('/api/autenticacao/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    this.token = dados.dados.token;
    return new SessaoASC(dados.dados, this);
  }

  async logout() {
    if (!this.token) {
      throw new ASCError('Nenhuma sessão ativa encontrada');
    }

    await this.requisicao('/api/autenticacao/logout', {
      method: 'POST'
    });

    this.token = null;
    return true;
  }

  async renovarToken(refreshToken) {
    const dados = await this.requisicao('/api/autenticacao/renovar', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });

    this.token = dados.dados.token;
    return dados.dados;
  }

  // Métodos de Usuário
  async obterPerfil() {
    const dados = await this.requisicao('/api/usuario/perfil');
    return new UsuarioASC(dados.dados, this);
  }

  async atualizarPerfil(atualizacoes) {
    const dados = await this.requisicao('/api/usuario/perfil', {
      method: 'PUT',
      body: JSON.stringify(atualizacoes)
    });

    return new UsuarioASC(dados.dados, this);
  }

  async alterarSenha(senhaAtual, novaSenha) {
    await this.requisicao('/api/usuario/alterar-senha', {
      method: 'POST',
      body: JSON.stringify({
        senhaAtual,
        novaSenha,
        confirmarSenha: novaSenha
      })
    });

    return true;
  }

  // Métodos de Sessão
  async obterSessoes() {
    const dados = await this.requisicao('/api/usuario/sessoes');
    return dados.dados.map(sessao => new SessaoASC(sessao, this));
  }

  async encerrarSessao(idSessao) {
    await this.requisicao(`/api/usuario/sessoes/${idSessao}`, {
      method: 'DELETE'
    });

    return true;
  }

  async obterEstatisticasSessao() {
    const dados = await this.requisicao('/api/sessao/estatisticas');
    return dados.dados;
  }

  // Métodos de Segurança
  async obterCamposHoneypot() {
    const dados = await this.requisicao('/api/autenticacao/honeypot');
    return dados.dados;
  }

  // Utilitários
  definirToken(token) {
    this.token = token;
  }

  obterToken() {
    return this.token;
  }

  adicionarInterceptadorRequisicao(interceptador) {
    this.interceptadores.requisicao.push(interceptador);
  }

  adicionarInterceptadorResposta(interceptador) {
    this.interceptadores.resposta.push(interceptador);
  }
}

// Classe para representar usuários
class UsuarioASC {
  constructor(dados, sdk) {
    this.sdk = sdk;
    Object.assign(this, dados);
  }

  async atualizar(atualizacoes) {
    const usuarioAtualizado = await this.sdk.atualizarPerfil(atualizacoes);
    Object.assign(this, usuarioAtualizado);
    return this;
  }

  async alterarSenha(senhaAtual, novaSenha) {
    return this.sdk.alterarSenha(senhaAtual, novaSenha);
  }

  async obterSessoes() {
    return this.sdk.obterSessoes();
  }
}

// Classe para representar sessões
class SessaoASC {
  constructor(dados, sdk) {
    this.sdk = sdk;
    Object.assign(this, dados);
  }

  async encerrar() {
    if (this.id) {
      return this.sdk.encerrarSessao(this.id);
    }
    return this.sdk.logout();
  }

  async renovar() {
    if (this.refreshToken) {
      return this.sdk.renovarToken(this.refreshToken);
    }
    throw new ASCError('Token de renovação não disponível');
  }

  async obterEstatisticas() {
    return this.sdk.obterEstatisticasSessao();
  }
}

// Classe de erro personalizada
class ASCError extends Error {
  constructor(mensagem, codigo = 500, dados = null) {
    super(mensagem);
    this.name = 'ASCError';
    this.codigo = codigo;
    this.dados = dados;
  }
}

// Exportações
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ASCSDK, UsuarioASC, SessaoASC, ASCError };
} else if (typeof window !== 'undefined') {
  window.ASCSDK = ASCSDK;
  window.UsuarioASC = UsuarioASC;
  window.SessaoASC = SessaoASC;
  window.ASCError = ASCError;
}