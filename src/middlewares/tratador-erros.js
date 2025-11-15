/**
 * Middleware de Tratamento de Erros
 * Centraliza o tratamento de erros da aplicação
 * 
 * @copyright 2025 AsyncCypher
 */

const logger = require('../utilitarios/logger');

class TratadorErros {
  static middleware() {
    return (error, req, res, next) => {
      // Log do erro
      logger.error('Erro na aplicação:', {
        erro: error.message,
        stack: error.stack,
        url: req.url,
        metodo: req.method,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        usuario: req.usuario?.id || 'anonimo',
        timestamp: new Date().toISOString()
      });

      // Determinar código de status
      let statusCode = error.statusCode || error.status || 500;
      let mensagem = error.message || 'Erro interno do servidor';
      let codigo = error.code || 'INTERNAL_ERROR';

      // Tratar tipos específicos de erro
      if (error.name === 'ValidationError') {
        statusCode = 400;
        codigo = 'VALIDATION_ERROR';
        mensagem = 'Dados de entrada inválidos';
      } else if (error.name === 'UnauthorizedError' || error.message.includes('Token')) {
        statusCode = 401;
        codigo = 'UNAUTHORIZED';
        mensagem = 'Não autorizado';
      } else if (error.name === 'ForbiddenError') {
        statusCode = 403;
        codigo = 'FORBIDDEN';
        mensagem = 'Acesso negado';
      } else if (error.name === 'NotFoundError') {
        statusCode = 404;
        codigo = 'NOT_FOUND';
        mensagem = 'Recurso não encontrado';
      } else if (error.name === 'ConflictError') {
        statusCode = 409;
        codigo = 'CONFLICT';
        mensagem = 'Conflito de dados';
      } else if (error.name === 'TooManyRequestsError') {
        statusCode = 429;
        codigo = 'TOO_MANY_REQUESTS';
        mensagem = 'Muitas requisições';
      }

      // Resposta de erro padronizada
      const respostaErro = {
        sucesso: false,
        mensagem,
        codigo,
        timestamp: new Date().toISOString()
      };

      // Adicionar detalhes em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        respostaErro.detalhes = {
          stack: error.stack,
          erro: error.message
        };
      }

      // Adicionar ID de rastreamento para logs
      respostaErro.rastreamento = TratadorErros.gerarIdRastreamento();

      res.status(statusCode).json(respostaErro);
    };
  }

  static gerarIdRastreamento() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static async(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  static notFound() {
    return (req, res, next) => {
      const error = new Error(`Rota não encontrada: ${req.method} ${req.url}`);
      error.statusCode = 404;
      error.code = 'ROUTE_NOT_FOUND';
      next(error);
    };
  }
}

// Tratador de erros não capturados
process.on('uncaughtException', (error) => {
  logger.error('Exceção não capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promise rejeitada não tratada:', { reason, promise });
  process.exit(1);
});

module.exports = TratadorErros.middleware();
module.exports.TratadorErros = TratadorErros;