/**
 * Middleware de Validação
 * Valida dados de entrada usando Joi
 * 
 * @copyright 2025 AsyncCypher
 */

const validadorMiddleware = (esquema, opcoes = {}) => {
  return (req, res, next) => {
    const opcoesValidacao = {
      abortEarly: false, // Retornar todos os erros
      allowUnknown: false, // Não permitir campos desconhecidos
      stripUnknown: true, // Remover campos desconhecidos
      ...opcoes
    };

    const { error, value } = esquema.validate(req.body, opcoesValidacao);

    if (error) {
      const errosDetalhados = error.details.map(detalhe => ({
        campo: detalhe.path.join('.'),
        mensagem: traduzirMensagemErro(detalhe.message, detalhe.type),
        valorRejeitado: detalhe.context?.value,
        tipo: detalhe.type
      }));

      return res.status(400).json({
        sucesso: false,
        mensagem: 'Dados de entrada inválidos',
        erros: errosDetalhados,
        codigo: 'VALIDATION_ERROR'
      });
    }

    // Substituir req.body pelos dados validados e sanitizados
    req.body = value;
    next();
  };
};

/**
 * Traduz mensagens de erro do Joi para português
 */
function traduzirMensagemErro(mensagem, tipo) {
  const traducoes = {
    'any.required': 'Campo obrigatório',
    'string.empty': 'Campo não pode estar vazio',
    'string.min': 'Deve ter pelo menos {#limit} caracteres',
    'string.max': 'Deve ter no máximo {#limit} caracteres',
    'string.email': 'Deve ser um email válido',
    'string.pattern.base': 'Formato inválido',
    'number.base': 'Deve ser um número',
    'number.min': 'Deve ser maior ou igual a {#limit}',
    'number.max': 'Deve ser menor ou igual a {#limit}',
    'array.base': 'Deve ser uma lista',
    'array.min': 'Deve ter pelo menos {#limit} itens',
    'array.max': 'Deve ter no máximo {#limit} itens',
    'object.base': 'Deve ser um objeto',
    'boolean.base': 'Deve ser verdadeiro ou falso',
    'date.base': 'Deve ser uma data válida',
    'any.only': 'Deve ser um dos valores permitidos: {#valids}',
    'alternatives.match': 'Não corresponde a nenhum dos tipos permitidos'
  };

  // Extrair o tipo base da mensagem
  const tipoBase = tipo.split('.').slice(0, 2).join('.');
  
  return traducoes[tipoBase] || traducoes[tipo] || mensagem;
}

/**
 * Validador para parâmetros de URL
 */
const validadorParametros = (esquema, opcoes = {}) => {
  return (req, res, next) => {
    const opcoesValidacao = {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
      ...opcoes
    };

    const { error, value } = esquema.validate(req.params, opcoesValidacao);

    if (error) {
      const errosDetalhados = error.details.map(detalhe => ({
        parametro: detalhe.path.join('.'),
        mensagem: traduzirMensagemErro(detalhe.message, detalhe.type),
        valorRejeitado: detalhe.context?.value,
        tipo: detalhe.type
      }));

      return res.status(400).json({
        sucesso: false,
        mensagem: 'Parâmetros de URL inválidos',
        erros: errosDetalhados,
        codigo: 'PARAMS_VALIDATION_ERROR'
      });
    }

    req.params = value;
    next();
  };
};

/**
 * Validador para query parameters
 */
const validadorQuery = (esquema, opcoes = {}) => {
  return (req, res, next) => {
    const opcoesValidacao = {
      abortEarly: false,
      allowUnknown: true, // Query params podem ter campos extras
      stripUnknown: false,
      ...opcoes
    };

    const { error, value } = esquema.validate(req.query, opcoesValidacao);

    if (error) {
      const errosDetalhados = error.details.map(detalhe => ({
        parametro: detalhe.path.join('.'),
        mensagem: traduzirMensagemErro(detalhe.message, detalhe.type),
        valorRejeitado: detalhe.context?.value,
        tipo: detalhe.type
      }));

      return res.status(400).json({
        sucesso: false,
        mensagem: 'Parâmetros de consulta inválidos',
        erros: errosDetalhados,
        codigo: 'QUERY_VALIDATION_ERROR'
      });
    }

    req.query = value;
    next();
  };
};

/**
 * Sanitizador de dados contra XSS - Versão Segura
 */
const sanitizador = (req, res, next) => {
  const sanitizarString = (str) => {
    if (typeof str !== 'string') return str;
    
    // Lista de caracteres permitidos (whitelist approach)
    const caracteresPermitidos = /^[a-zA-Z0-9\s\-_@\.\+\(\)\[\]\{\}:;,!?]*$/;
    
    // Se contém caracteres não permitidos, rejeitar
    if (!caracteresPermitidos.test(str)) {
      return str.replace(/[^a-zA-Z0-9\s\-_@\.\+\(\)\[\]\{\}:;,!?]/g, '');
    }
    
    return str.trim();
  };

  const sanitizarObjeto = (obj, profundidade = 0) => {
    // Prevenir ataques de profundidade excessiva
    if (profundidade > 10) return '[DADOS_MUITO_PROFUNDOS]';
    
    if (typeof obj === 'string') {
      return sanitizarString(obj);
    }
    
    if (Array.isArray(obj)) {
      // Limitar tamanho do array
      return obj.slice(0, 100).map(item => sanitizarObjeto(item, profundidade + 1));
    }
    
    if (obj && typeof obj === 'object') {
      const objetoSanitizado = {};
      let contador = 0;
      
      for (const [chave, valor] of Object.entries(obj)) {
        // Limitar número de propriedades
        if (contador >= 50) break;
        
        // Sanitizar chave também
        const chaveSanitizada = sanitizarString(chave);
        objetoSanitizado[chaveSanitizada] = sanitizarObjeto(valor, profundidade + 1);
        contador++;
      }
      return objetoSanitizado;
    }
    
    return obj;
  };

  try {
    if (req.body) req.body = sanitizarObjeto(req.body);
    if (req.query) req.query = sanitizarObjeto(req.query);
    if (req.params) req.params = sanitizarObjeto(req.params);
  } catch (error) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Dados de entrada inválidos',
      codigo: 'SANITIZATION_ERROR'
    });
  }

  next();
};

module.exports = validadorMiddleware;
module.exports.parametros = validadorParametros;
module.exports.query = validadorQuery;
module.exports.sanitizador = sanitizador;