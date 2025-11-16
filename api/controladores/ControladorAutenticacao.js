/**
 * Controlador de Autenticação
 * Gerencia requisições de autenticação
 * 
 * @copyright 2025 AsyncCypher
 */

const ServicoAutenticacao = require('../servicos/ServicoAutenticacao');
const SistemaHoneypot = require('../seguranca/sistema-honeypot');

class ControladorAutenticacao {
  constructor(adaptadorBD) {
    this.servicoAuth = new ServicoAutenticacao(adaptadorBD);
  }

  async registro(req, res, next) {
    try {
      const resultado = await this.servicoAuth.registrarUsuario(req.body, req);
      
      res.status(201).json({
        sucesso: true,
        mensagem: 'Usuário registrado com sucesso',
        dados: resultado
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const resultado = await this.servicoAuth.autenticarUsuario(req.body, req);
      
      res.json({
        sucesso: true,
        mensagem: 'Login realizado com sucesso',
        dados: resultado
      });
    } catch (error) {
      next(error);
    }
  }

  async renovarToken(req, res, next) {
    try {
      const resultado = await this.servicoAuth.renovarToken(req.body.refreshToken, req);
      
      res.json({
        sucesso: true,
        mensagem: 'Token renovado com sucesso',
        dados: resultado
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Token não fornecido'
        });
      }

      await this.servicoAuth.logout(token, req);
      
      res.json({
        sucesso: true,
        mensagem: 'Logout realizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  obterHoneypot(req, res) {
    const camposHoneypot = SistemaHoneypot.gerarCamposHoneypot();
    
    res.json({
      sucesso: true,
      dados: camposHoneypot
    });
  }

  obterEstatisticasSeguranca(req, res) {
    const estatisticas = SistemaHoneypot.obterEstatisticas();
    
    res.json({
      sucesso: true,
      dados: estatisticas
    });
  }
}

module.exports = ControladorAutenticacao;