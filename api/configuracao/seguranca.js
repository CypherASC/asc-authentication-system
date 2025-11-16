/**
 * Configurações de Segurança
 * Configurações centralizadas de segurança do sistema
 * 
 * @copyright 2025 AsyncCypher
 */

module.exports = {
  // Configurações JWT
  jwt: {
    algoritmo: process.env.JWT_ALGORITMO || 'HS256',
    tempoExpiracaoToken: process.env.TEMPO_EXPIRACAO_TOKEN || '24h',
    tempoExpiracaoRefresh: process.env.TEMPO_EXPIRACAO_REFRESH || '7d',
    issuer: process.env.JWT_ISSUER || 'ASC-System',
    audience: process.env.JWT_AUDIENCE || 'ASC-Client'
  },

  // Configurações de senha
  senha: {
    tamanhoMinimo: parseInt(process.env.SENHA_TAMANHO_MINIMO) || 8,
    exigirMaiuscula: process.env.SENHA_EXIGIR_MAIUSCULA !== 'false',
    exigirMinuscula: process.env.SENHA_EXIGIR_MINUSCULA !== 'false',
    exigirNumero: process.env.SENHA_EXIGIR_NUMERO !== 'false',
    exigirCaracterEspecial: process.env.SENHA_EXIGIR_ESPECIAL !== 'false',
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
  },

  // Configurações de rate limiting
  rateLimiting: {
    geral: {
      janela: parseInt(process.env.RATE_LIMIT_JANELA_GERAL) || 15 * 60 * 1000,
      maxTentativas: parseInt(process.env.RATE_LIMIT_MAX_GERAL) || 100
    },
    autenticacao: {
      janela: parseInt(process.env.RATE_LIMIT_JANELA_AUTH) || 15 * 60 * 1000,
      maxTentativas: parseInt(process.env.RATE_LIMIT_MAX_AUTH) || 5
    },
    registro: {
      janela: parseInt(process.env.RATE_LIMIT_JANELA_REGISTRO) || 60 * 60 * 1000,
      maxTentativas: parseInt(process.env.RATE_LIMIT_MAX_REGISTRO) || 3
    },
    renovacao: {
      janela: parseInt(process.env.RATE_LIMIT_JANELA_RENOVACAO) || 5 * 60 * 1000,
      maxTentativas: parseInt(process.env.RATE_LIMIT_MAX_RENOVACAO) || 10
    }
  },

  // Configurações de sessão
  sessao: {
    tempoVida: 24 * 60 * 60 * 1000, // 24 horas
    renovacaoAutomatica: true,
    multiplasSessoes: true,
    verificarFingerprint: true
  },

  // Configurações de detecção de anomalias
  anomalias: {
    limiteAnomalias: 0.7,
    minimoLoginsAnalise: 5,
    distanciaMaximaKm: 500,
    velocidadeMaximaKmh: 1000,
    diferencaHorariaMaxima: 6
  },

  // Configurações de honeypot
  honeypot: {
    tempoMinimoPreenchimento: 2000, // 2 segundos
    maxViolacoesPorIP: 3,
    tempoLimpezaViolacoes: 24 * 60 * 60 * 1000 // 24 horas
  },

  // Configurações de criptografia
  criptografia: {
    algoritmo: process.env.CRYPTO_ALGORITMO || 'aes-256-cbc',
    tamanhoChave: parseInt(process.env.CRYPTO_TAMANHO_CHAVE) || 32,
    tamanhoIV: parseInt(process.env.CRYPTO_TAMANHO_IV) || 16
  },

  // Configurações de auditoria
  auditoria: {
    manterLogsPorDias: 90,
    logTodasOperacoes: true,
    incluirDadosSensiveis: false,
    compressaoLogs: true
  },

  // Configurações de IP blocking
  bloqueioIP: {
    tempoBloqueioMinutos: parseInt(process.env.IP_BLOQUEIO_TEMPO) || 15,
    maxTentativasPorIP: parseInt(process.env.IP_MAX_TENTATIVAS) || 5,
    whitelist: process.env.IP_WHITELIST ? process.env.IP_WHITELIST.split(',') : ['127.0.0.1', '::1'],
    blacklist: process.env.IP_BLACKLIST ? process.env.IP_BLACKLIST.split(',') : []
  },

  // Headers de segurança
  headers: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    frameguard: { action: 'deny' },
    xssFilter: true,
    referrerPolicy: 'strict-origin-when-cross-origin'
  },

  // Configurações CORS
  cors: {
    origin: process.env.CORS_ORIGIN || false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    credentials: true,
    maxAge: 86400 // 24 horas
  },

  // Configurações de validação
  validacao: {
    stripUnknown: true,
    abortEarly: false,
    allowUnknown: false,
    sanitizacao: true
  },

  // Configurações de fingerprinting
  fingerprinting: {
    confiancaMinima: 70,
    componentesObrigatorios: ['userAgent', 'idiomaAceito', 'fusoHorario'],
    componentesOpcionais: ['canvas', 'webgl', 'contextoAudio'],
    tempoValidadeHoras: 24
  },

  // Configurações de backup e recuperação
  backup: {
    intervaloDias: 7,
    manterBackupsPorDias: 30,
    criptografarBackups: true,
    incluirLogs: false
  }
};