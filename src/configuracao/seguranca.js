/**
 * Configurações de Segurança
 * Configurações centralizadas de segurança do sistema
 * 
 * @copyright 2025 AsyncCypher
 */

module.exports = {
  // Configurações JWT
  jwt: {
    algoritmo: 'HS256',
    tempoExpiracaoToken: process.env.TEMPO_EXPIRACAO_TOKEN || '24h',
    tempoExpiracaoRefresh: process.env.TEMPO_EXPIRACAO_REFRESH || '7d',
    issuer: 'ASC-System',
    audience: 'ASC-Client'
  },

  // Configurações de senha
  senha: {
    tamanhoMinimo: 8,
    exigirMaiuscula: true,
    exigirMinuscula: true,
    exigirNumero: true,
    exigirCaracterEspecial: true,
    saltRounds: 12
  },

  // Configurações de rate limiting
  rateLimiting: {
    geral: {
      janela: 15 * 60 * 1000, // 15 minutos
      maxTentativas: 100
    },
    autenticacao: {
      janela: 15 * 60 * 1000, // 15 minutos
      maxTentativas: 5
    },
    registro: {
      janela: 60 * 60 * 1000, // 1 hora
      maxTentativas: 3
    },
    renovacao: {
      janela: 5 * 60 * 1000, // 5 minutos
      maxTentativas: 10
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
    algoritmo: 'aes-256-cbc',
    tamanhoChave: 32,
    tamanhoIV: 16
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
    tempoBloqueioMinutos: 15,
    maxTentativasPorIP: 5,
    whitelist: ['127.0.0.1', '::1'],
    blacklist: []
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