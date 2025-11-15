/**
 * Controlador de Usuário
 * Gerencia operações de usuário
 * 
 * @copyright 2025 AsyncCypher
 */

const MotorASC = require('../nucleo/motor-asc');

class ControladorUsuario {
  constructor(adaptadorBD) {
    this.adaptadorBD = adaptadorBD;
  }

  async obterPerfil(req, res, next) {
    try {
      const usuario = await this.adaptadorBD.buscarUsuarioPorId(req.usuario.id);
      if (!usuario) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Usuário não encontrado'
        });
      }

      const { hashSenha, ...perfilUsuario } = usuario;

      res.json({
        sucesso: true,
        dados: perfilUsuario
      });
    } catch (error) {
      next(error);
    }
  }

  async atualizarPerfil(req, res, next) {
    try {
      if (req.body.email) {
        const usuarioExistente = await this.adaptadorBD.buscarUsuarioPorEmail(req.body.email);
        if (usuarioExistente && usuarioExistente.id !== req.usuario.id) {
          return res.status(409).json({
            sucesso: false,
            mensagem: 'Email já está em uso'
          });
        }
      }

      const usuarioAtualizado = await this.adaptadorBD.atualizarUsuario(req.usuario.id, req.body);

      await this.adaptadorBD.criarLogAuditoria({
        idUsuario: req.usuario.id,
        acao: 'ATUALIZACAO_PERFIL',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        dadosAlterados: Object.keys(req.body),
        timestamp: new Date()
      });

      const { hashSenha, ...perfilAtualizado } = usuarioAtualizado;

      res.json({
        sucesso: true,
        mensagem: 'Perfil atualizado com sucesso',
        dados: perfilAtualizado
      });
    } catch (error) {
      next(error);
    }
  }

  async alterarSenha(req, res, next) {
    try {
      const { senhaAtual, novaSenha } = req.body;

      const usuario = await this.adaptadorBD.buscarUsuarioPorId(req.usuario.id);
      if (!usuario) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Usuário não encontrado'
        });
      }

      const senhaValida = await MotorASC.verificarSenha(senhaAtual, usuario.hashSenha);
      if (!senhaValida) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Senha atual incorreta'
        });
      }

      const validacaoSenha = MotorASC.validarComplexidadeSenha(novaSenha);
      if (!validacaoSenha.valida) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Nova senha não atende aos critérios de segurança',
          criterios: validacaoSenha.criterios
        });
      }

      const novoHashSenha = await MotorASC.criptografarSenha(novaSenha);

      await this.adaptadorBD.atualizarUsuario(req.usuario.id, {
        hashSenha: novoHashSenha,
        senhaAlteradaEm: new Date()
      });

      await this.adaptadorBD.deletarSessoesUsuario(req.usuario.id);

      await this.adaptadorBD.criarLogAuditoria({
        idUsuario: req.usuario.id,
        acao: 'ALTERACAO_SENHA',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        timestamp: new Date()
      });

      res.json({
        sucesso: true,
        mensagem: 'Senha alterada com sucesso. Faça login novamente.'
      });
    } catch (error) {
      next(error);
    }
  }

  async obterSessoes(req, res, next) {
    try {
      const sessoes = await this.adaptadorBD.buscarSessoesUsuario(req.usuario.id);
      
      const sessoesAtivas = sessoes
        .filter(sessao => sessao.ativa)
        .map(sessao => ({
          id: sessao.id,
          ip: sessao.ip,
          userAgent: sessao.userAgent,
          criadaEm: sessao.criadaEm,
          atualizadaEm: sessao.atualizadaEm,
          expiresEm: sessao.expiresEm,
          atual: sessao.fingerprint === req.usuario.fingerprint
        }));

      res.json({
        sucesso: true,
        dados: sessoesAtivas
      });
    } catch (error) {
      next(error);
    }
  }

  async encerrarSessao(req, res, next) {
    try {
      const sessao = await this.adaptadorBD.buscarSessaoPorId(req.params.id);
      
      if (!sessao || sessao.idUsuario !== req.usuario.id) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Sessão não encontrada'
        });
      }

      await this.adaptadorBD.atualizarSessao(req.params.id, {
        ativa: false,
        finalizadaEm: new Date()
      });

      await this.adaptadorBD.revogarToken({
        token: sessao.token,
        revogadoEm: new Date(),
        motivo: 'ENCERRAMENTO_MANUAL'
      });

      await this.adaptadorBD.criarLogAuditoria({
        idUsuario: req.usuario.id,
        acao: 'ENCERRAMENTO_SESSAO',
        ip: req.ip,
        sessaoEncerrada: req.params.id,
        timestamp: new Date()
      });

      res.json({
        sucesso: true,
        mensagem: 'Sessão encerrada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async obterAtividades(req, res, next) {
    try {
      const limite = parseInt(req.query.limite) || 20;
      const offset = parseInt(req.query.offset) || 0;

      const atividades = await this.adaptadorBD.buscarLogsAuditoria(
        { idUsuario: req.usuario.id },
        { limite, offset }
      );

      res.json({
        sucesso: true,
        dados: atividades
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ControladorUsuario;