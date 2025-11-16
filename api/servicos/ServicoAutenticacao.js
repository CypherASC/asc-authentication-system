/**
 * Serviço de Autenticação
 * Lógica principal de autenticação e autorização
 * 
 * @copyright 2025 AsyncCypher
 */

const MotorASC = require('../nucleo/motor-asc');
const DetectorAnomalias = require('../seguranca/detector-anomalias');
const SistemaHoneypot = require('../seguranca/sistema-honeypot');
const FingerprintDispositivo = require('../seguranca/fingerprint-dispositivo');
const { v4: uuidv4 } = require('uuid');

class ServicoAutenticacao {
  constructor(adaptadorBD) {
    this.adaptadorBD = adaptadorBD;
    this.tentativasLogin = new Map();
    this.maxTentativas = 5;
    this.tempoBloqueioPadrao = 15 * 60 * 1000; // 15 minutos
  }

  async registrarUsuario(dadosRegistro, req) {
    // Validar honeypot
    const validacaoHoneypot = SistemaHoneypot.validarSubmissao(dadosRegistro, req.ip);
    if (validacaoHoneypot.isBot) {
      throw new Error('Atividade suspeita detectada');
    }

    // Verificar se usuário já existe
    const usuarioExistente = await this.adaptadorBD.buscarUsuarioPorEmail(dadosRegistro.email);
    if (usuarioExistente) {
      throw new Error('Usuário já existe');
    }

    // Validar complexidade da senha
    const validacaoSenha = MotorASC.validarComplexidadeSenha(dadosRegistro.senha);
    if (!validacaoSenha.valida) {
      throw new Error('Senha não atende aos critérios de segurança');
    }

    // Criptografar senha
    const hashSenha = await MotorASC.criptografarSenha(dadosRegistro.senha);

    // Gerar fingerprint do dispositivo
    const fingerprint = FingerprintDispositivo.gerar(req);

    // Criar usuário
    const novoUsuario = await this.adaptadorBD.criarUsuario({
      id: uuidv4(),
      email: dadosRegistro.email,
      hashSenha,
      nome: dadosRegistro.nome,
      criadoEm: new Date(),
      ativo: true,
      verificado: false
    });

    // Log de auditoria
    await this.adaptadorBD.criarLogAuditoria({
      idUsuario: novoUsuario.id,
      acao: 'REGISTRO_USUARIO',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      fingerprint: fingerprint.fingerprint,
      timestamp: new Date()
    });

    return {
      id: novoUsuario.id,
      email: novoUsuario.email,
      nome: novoUsuario.nome
    };
  }

  async autenticarUsuario(credenciais, req) {
    const { email, senha } = credenciais;
    const inicioTempo = Date.now();
    const TEMPO_MINIMO = 200; // ms para prevenir timing attacks

    try {
      // Verificar tentativas de login
      await this.verificarTentativasLogin(req.ip);

      // Buscar usuário e verificar senha sempre (mesmo se usuário não existir)
      const usuario = await this.adaptadorBD.buscarUsuarioPorEmail(email);
      const hashFalso = '$2b$12$dummy.hash.to.prevent.timing.attacks.abcdefghijklmnopqrstuvwxyz';
      
      const senhaValida = await MotorASC.verificarSenha(
        senha, 
        usuario ? usuario.hashSenha : hashFalso
      );

      // Garantir tempo mínimo de resposta
      const tempoDecorrido = Date.now() - inicioTempo;
      if (tempoDecorrido < TEMPO_MINIMO) {
        await new Promise(resolve => setTimeout(resolve, TEMPO_MINIMO - tempoDecorrido));
      }

      if (!usuario || !senhaValida) {
        await this.registrarTentativaFalha(req.ip, email);
        throw new Error('Credenciais inválidas');
      }

      // Gerar fingerprint
    const fingerprint = FingerprintDispositivo.gerar(req);

    // Análise de anomalias
    const analiseAnomalias = await DetectorAnomalias.analisarTentativaLogin(usuario.id, {
      ip: req.ip,
      localizacao: req.body.localizacao,
      timestamp: Date.now(),
      fingerprint: fingerprint.fingerprint,
      userAgent: req.headers['user-agent']
    });

    // Se anomalia crítica, bloquear
    if (analiseAnomalias.isAnomalous && analiseAnomalias.riskLevel === 'CRITICAL') {
      await this.adaptadorBD.bloquearIP({
        ip: req.ip,
        motivo: 'Anomalia crítica detectada',
        expiresEm: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
      });
      throw new Error('Acesso bloqueado por segurança');
    }

    // Gerar tokens
    const payload = {
      id: usuario.id,
      email: usuario.email,
      fingerprint: fingerprint.fingerprint
    };

    const token = MotorASC.gerarToken(payload);
    const refreshToken = MotorASC.gerarRefreshToken(payload);

    // Criar sessão
    const sessao = await this.adaptadorBD.criarSessao({
      id: MotorASC.gerarIdSessao(),
      idUsuario: usuario.id,
      token,
      refreshToken,
      fingerprint: fingerprint.fingerprint,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      criadaEm: new Date(),
      expiresEm: new Date(Date.now() + 24 * 60 * 60 * 1000),
      ativa: true
    });

    // Limpar tentativas de login
    this.tentativasLogin.delete(req.ip);

    // Log de auditoria
    await this.adaptadorBD.criarLogAuditoria({
      idUsuario: usuario.id,
      acao: 'LOGIN_SUCESSO',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      fingerprint: fingerprint.fingerprint,
      anomalias: analiseAnomalias.reasons,
      timestamp: new Date()
    });

    return {
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome
      },
      token,
      refreshToken,
      sessao: sessao.id,
      analiseSeguranca: {
        riskLevel: analiseAnomalias.riskLevel,
        confiancaDispositivo: fingerprint.confidence
      }
    };
    } catch (error) {
      // Garantir tempo mínimo mesmo em caso de erro
      const tempoDecorrido = Date.now() - inicioTempo;
      if (tempoDecorrido < TEMPO_MINIMO) {
        await new Promise(resolve => setTimeout(resolve, TEMPO_MINIMO - tempoDecorrido));
      }
      throw error;
    }
  }

  async renovarToken(refreshToken, req) {
    const inicioTempo = Date.now();
    const TEMPO_MINIMO = 100;

    try {
      if (!refreshToken) {
        throw new Error('Token de renovação obrigatório');
      }

      const payload = MotorASC.verificarRefreshToken(refreshToken);
      
      // Verificar se sessão existe e está ativa
      const sessoes = await this.adaptadorBD.buscarSessoesUsuario(payload.id);
      const sessaoAtiva = sessoes.find(s => s.refreshToken === refreshToken && s.ativa);
      
      // Garantir tempo mínimo
      const tempoDecorrido = Date.now() - inicioTempo;
      if (tempoDecorrido < TEMPO_MINIMO) {
        await new Promise(resolve => setTimeout(resolve, TEMPO_MINIMO - tempoDecorrido));
      }
      
      if (!sessaoAtiva) {
        throw new Error('Sessão inválida');
      }

      // Verificar fingerprint
      const fingerprintAtual = FingerprintDispositivo.gerar(req);
      if (fingerprintAtual.fingerprint !== sessaoAtiva.fingerprint) {
        throw new Error('Dispositivo não reconhecido');
      }

      // Gerar novos tokens
      const novoPayload = {
        id: payload.id,
        email: payload.email,
        fingerprint: fingerprintAtual.fingerprint
      };

      const novoToken = MotorASC.gerarToken(novoPayload);
      const novoRefreshToken = MotorASC.gerarRefreshToken(novoPayload);

      // Atualizar sessão
      await this.adaptadorBD.atualizarSessao(sessaoAtiva.id, {
        token: novoToken,
        refreshToken: novoRefreshToken,
        atualizadaEm: new Date()
      });

      return {
        token: novoToken,
        refreshToken: novoRefreshToken
      };

    } catch (error) {
      throw new Error('Token de renovação inválido');
    }
  }

  async logout(token, req) {
    try {
      const payload = MotorASC.verificarToken(token);
      
      // Buscar e desativar sessão
      const sessoes = await this.adaptadorBD.buscarSessoesUsuario(payload.id);
      const sessaoAtiva = sessoes.find(s => s.token === token && s.ativa);
      
      if (sessaoAtiva) {
        await this.adaptadorBD.atualizarSessao(sessaoAtiva.id, {
          ativa: false,
          finalizadaEm: new Date()
        });
      }

      // Revogar token
      await this.adaptadorBD.revogarToken({
        token,
        revogadoEm: new Date(),
        motivo: 'LOGOUT'
      });

      // Log de auditoria
      await this.adaptadorBD.criarLogAuditoria({
        idUsuario: payload.id,
        acao: 'LOGOUT',
        ip: req.ip,
        timestamp: new Date()
      });

      return true;
    } catch (error) {
      throw new Error('Erro ao fazer logout');
    }
  }

  async verificarTentativasLogin(ip) {
    const tentativas = this.tentativasLogin.get(ip) || { count: 0, ultimaTentativa: 0 };
    
    if (tentativas.count >= this.maxTentativas) {
      const tempoEspera = tentativas.ultimaTentativa + this.tempoBloqueioPadrao - Date.now();
      if (tempoEspera > 0) {
        throw new Error(`IP bloqueado. Tente novamente em ${Math.ceil(tempoEspera / 60000)} minutos`);
      } else {
        // Reset após tempo de bloqueio
        this.tentativasLogin.delete(ip);
      }
    }
  }

  async registrarTentativaFalha(ip, email) {
    const tentativas = this.tentativasLogin.get(ip) || { count: 0, ultimaTentativa: 0 };
    tentativas.count++;
    tentativas.ultimaTentativa = Date.now();
    this.tentativasLogin.set(ip, tentativas);

    // Log de auditoria
    await this.adaptadorBD.criarLogAuditoria({
      acao: 'LOGIN_FALHA',
      ip,
      email,
      tentativas: tentativas.count,
      timestamp: new Date()
    });
  }
}

module.exports = ServicoAutenticacao;