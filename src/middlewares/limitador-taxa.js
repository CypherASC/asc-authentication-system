/**
 * Middleware de Limitação de Taxa
 * Protege contra ataques de força bruta e DDoS
 * 
 * @copyright 2025 AsyncCypher
 */

const rateLimit = require('express-rate-limit');

// Limitador geral
const limitadorGeral = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições por IP
  message: {
    sucesso: false,
    mensagem: 'Muitas requisições. Tente novamente em 15 minutos.',
    codigo: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Pular limitação para IPs locais em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      const ip = req.ip || req.connection.remoteAddress;
      return ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.');
    }
    return false;
  }
});

// Limitador para autenticação (mais restritivo)
const limitadorAutenticacao = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP
  message: {
    sucesso: false,
    mensagem: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    codigo: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Não contar requisições bem-sucedidas
  keyGenerator: (req) => {
    // Usar combinação de IP e email para chave única
    const ip = req.ip || req.connection.remoteAddress;
    const email = req.body?.email || 'unknown';
    return `${ip}:${email}`;
  }
});

// Limitador para registro (moderado)
const limitadorRegistro = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 registros por IP por hora
  message: {
    sucesso: false,
    mensagem: 'Muitos registros. Tente novamente em 1 hora.',
    codigo: 'REGISTER_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Limitador para renovação de token
const limitadorRenovacao = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // máximo 10 renovações por IP
  message: {
    sucesso: false,
    mensagem: 'Muitas renovações de token. Tente novamente em 5 minutos.',
    codigo: 'REFRESH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Limitador para APIs sensíveis
const limitadorSensivel = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 20, // máximo 20 requisições por IP
  message: {
    sucesso: false,
    mensagem: 'Muitas requisições para endpoint sensível. Tente novamente em 10 minutos.',
    codigo: 'SENSITIVE_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Limitador progressivo (aumenta restrição com base no histórico)
class LimitadorProgressivo {
  constructor() {
    this.violacoes = new Map();
    this.tempoLimpeza = 24 * 60 * 60 * 1000; // 24 horas
  }

  middleware() {
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const agora = Date.now();
      
      // Limpar violações antigas
      this.limparViolacoesAntigas(agora);
      
      const violacoesIP = this.violacoes.get(ip) || { count: 0, ultimaViolacao: 0 };
      
      // Calcular limite baseado no histórico de violações
      let limite = 100; // Limite base
      if (violacoesIP.count > 0) {
        limite = Math.max(10, 100 - (violacoesIP.count * 20));
      }
      
      // Verificar se excedeu o limite
      const janela = 15 * 60 * 1000; // 15 minutos
      const requisicoesPorJanela = this.contarRequisicoesRecentes(ip, agora, janela);
      
      if (requisicoesPorJanela >= limite) {
        // Registrar violação
        violacoesIP.count++;
        violacoesIP.ultimaViolacao = agora;
        this.violacoes.set(ip, violacoesIP);
        
        return res.status(429).json({
          sucesso: false,
          mensagem: `Limite excedido. Máximo ${limite} requisições por 15 minutos.`,
          codigo: 'PROGRESSIVE_RATE_LIMIT_EXCEEDED',
          limite,
          violacoes: violacoesIP.count
        });
      }
      
      // Registrar requisição
      this.registrarRequisicao(ip, agora);
      
      next();
    };
  }

  registrarRequisicao(ip, timestamp) {
    const chave = `req:${ip}`;
    if (!this.violacoes.has(chave)) {
      this.violacoes.set(chave, []);
    }
    
    const requisicoes = this.violacoes.get(chave);
    requisicoes.push(timestamp);
    
    // Manter apenas últimas 200 requisições
    if (requisicoes.length > 200) {
      requisicoes.splice(0, requisicoes.length - 200);
    }
  }

  contarRequisicoesRecentes(ip, agora, janela) {
    const chave = `req:${ip}`;
    const requisicoes = this.violacoes.get(chave) || [];
    
    return requisicoes.filter(timestamp => agora - timestamp < janela).length;
  }

  limparViolacoesAntigas(agora) {
    for (const [chave, dados] of this.violacoes.entries()) {
      if (Array.isArray(dados)) {
        // Limpar requisições antigas
        const requisicoesRecentes = dados.filter(timestamp => 
          agora - timestamp < this.tempoLimpeza
        );
        
        if (requisicoesRecentes.length === 0) {
          this.violacoes.delete(chave);
        } else {
          this.violacoes.set(chave, requisicoesRecentes);
        }
      } else if (dados.ultimaViolacao && agora - dados.ultimaViolacao > this.tempoLimpeza) {
        // Limpar violações antigas
        this.violacoes.delete(chave);
      }
    }
  }
}

const limitadorProgressivo = new LimitadorProgressivo();

module.exports = limitadorGeral;
module.exports.autenticacao = limitadorAutenticacao;
module.exports.registro = limitadorRegistro;
module.exports.renovacao = limitadorRenovacao;
module.exports.sensivel = limitadorSensivel;
module.exports.progressivo = limitadorProgressivo.middleware();