/**
 * Middleware de Autenticação
 * Verifica tokens JWT e autoriza acesso
 * 
 * @copyright 2025 AsyncCypher
 */

const MotorASC = require('../nucleo/motor-asc');
const FingerprintDispositivo = require('../seguranca/fingerprint-dispositivo');

class MiddlewareAutenticacao {
  constructor(adaptadorBD) {
    this.adaptadorBD = adaptadorBD;
  }

  async verificarToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          sucesso: false,
          mensagem: 'Token de acesso requerido'
        });
      }

      const token = authHeader.substring(7);

      // Verificar se token está revogado
      if (this.adaptadorBD && await this.adaptadorBD.tokenRevogado(token)) {
        return res.status(401).json({
          sucesso: false,
          mensagem: 'Token revogado'
        });
      }

      // Verificar validade do token
      const payload = MotorASC.verificarToken(token);

      // Verificar fingerprint do dispositivo
      const fingerprintAtual = FingerprintDispositivo.gerar(req);
      if (payload.fingerprint && payload.fingerprint !== fingerprintAtual.fingerprint) {
        return res.status(401).json({
          sucesso: false,
          mensagem: 'Dispositivo não reconhecido'
        });
      }

      // Verificar se usuário ainda existe e está ativo
      if (this.adaptadorBD) {
        const usuario = await this.adaptadorBD.buscarUsuarioPorId(payload.id);
        if (!usuario || !usuario.ativo) {
          return res.status(401).json({
            sucesso: false,
            mensagem: 'Usuário inativo ou não encontrado'
          });
        }
      }

      // Adicionar dados do usuário à requisição
      req.usuario = {
        id: payload.id,
        email: payload.email,
        fingerprint: payload.fingerprint
      };

      req.token = token;

      next();
    } catch (error) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Token inválido',
        erro: error.message
      });
    }
  }

  verificarPermissao(permissoesRequeridas) {
    return async (req, res, next) => {
      try {
        if (!req.usuario) {
          return res.status(401).json({
            sucesso: false,
            mensagem: 'Usuário não autenticado'
          });
        }

        // Buscar permissões do usuário
        if (this.adaptadorBD) {
          const usuario = await this.adaptadorBD.buscarUsuarioPorId(req.usuario.id);
          const permissoesUsuario = usuario.permissoes || [];

          // Verificar se usuário tem todas as permissões requeridas
          const temPermissao = permissoesRequeridas.every(perm => 
            permissoesUsuario.includes(perm)
          );

          if (!temPermissao) {
            return res.status(403).json({
              sucesso: false,
              mensagem: 'Permissões insuficientes'
            });
          }
        }

        next();
      } catch (error) {
        return res.status(500).json({
          sucesso: false,
          mensagem: 'Erro ao verificar permissões',
          erro: error.message
        });
      }
    };
  }

  verificarAdmin() {
    return this.verificarPermissao(['admin']);
  }

  opcional() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          
          try {
            const payload = MotorASC.verificarToken(token);
            req.usuario = {
              id: payload.id,
              email: payload.email,
              fingerprint: payload.fingerprint
            };
          } catch (error) {
            // Token inválido, mas middleware é opcional
            req.usuario = null;
          }
        }

        next();
      } catch (error) {
        next();
      }
    };
  }
}

// Instância padrão sem adaptador (será configurada depois)
const middlewareAutenticacao = new MiddlewareAutenticacao();

// Exportar tanto a classe quanto a instância
module.exports = middlewareAutenticacao.verificarToken.bind(middlewareAutenticacao);
module.exports.MiddlewareAutenticacao = MiddlewareAutenticacao;
module.exports.verificarPermissao = middlewareAutenticacao.verificarPermissao.bind(middlewareAutenticacao);
module.exports.verificarAdmin = middlewareAutenticacao.verificarAdmin.bind(middlewareAutenticacao);
module.exports.opcional = middlewareAutenticacao.opcional.bind(middlewareAutenticacao);