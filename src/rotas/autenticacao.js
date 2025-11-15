/**
 * Rotas de Autenticação
 * Endpoints para login, registro e renovação de tokens
 * 
 * @copyright 2025 AsyncCypher
 */

const express = require('express');
const Joi = require('joi');
const ControladorAutenticacao = require('../controladores/ControladorAutenticacao');
const validadorMiddleware = require('../middlewares/validador');
const limitadorTaxa = require('../middlewares/limitador-taxa');

const router = express.Router();

// Esquemas de validação
const esquemaRegistro = Joi.object({
  nome: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  senha: Joi.string().min(8).required(),
  // Campos honeypot (opcionais)
  email_confirmacao: Joi.string().allow('').optional(),
  website: Joi.string().allow('').optional(),
  numero_telefone: Joi.string().allow('').optional(),
  timestamp: Joi.string().optional(),
  // Dados do dispositivo
  resolucaoTela: Joi.string().optional(),
  fusoHorario: Joi.string().optional(),
  fingerprintCanvas: Joi.string().optional(),
  fingerprintWebgl: Joi.string().optional(),
  fontes: Joi.array().optional(),
  plugins: Joi.array().optional()
});

const esquemaLogin = Joi.object({
  email: Joi.string().email().required(),
  senha: Joi.string().required(),
  // Campos honeypot
  email_confirmacao: Joi.string().allow('').optional(),
  website: Joi.string().allow('').optional(),
  numero_telefone: Joi.string().allow('').optional(),
  timestamp: Joi.string().optional(),
  // Dados do dispositivo e localização
  localizacao: Joi.object({
    lat: Joi.number().optional(),
    lon: Joi.number().optional(),
    cidade: Joi.string().optional(),
    pais: Joi.string().optional()
  }).optional(),
  resolucaoTela: Joi.string().optional(),
  fusoHorario: Joi.string().optional(),
  fingerprintCanvas: Joi.string().optional(),
  fingerprintWebgl: Joi.string().optional()
});

const esquemaRenovacao = Joi.object({
  refreshToken: Joi.string().required()
});

// Usar instância global compartilhada
let controladorAuth;

router.use(async (req, res, next) => {
  if (!controladorAuth) {
    const AdaptadorMemoria = require('../adaptadores/AdaptadorMemoria');
    
    if (!global.adaptadorASC) {
      global.adaptadorASC = new AdaptadorMemoria();
      await global.adaptadorASC.conectar();
    }
    
    controladorAuth = new ControladorAutenticacao(global.adaptadorASC);
  }
  next();
});

/**
 * POST /api/autenticacao/registro
 * Registrar novo usuário
 */
router.post('/registro', 
  process.env.NODE_ENV === 'test' ? (req, res, next) => next() : limitadorTaxa.registro,
  validadorMiddleware(esquemaRegistro), 
  (req, res, next) => controladorAuth.registro(req, res, next)
);

/**
 * POST /api/autenticacao/login
 * Autenticar usuário
 */
router.post('/login',
  process.env.NODE_ENV === 'test' ? (req, res, next) => next() : limitadorTaxa.autenticacao,
  validadorMiddleware(esquemaLogin),
  (req, res, next) => controladorAuth.login(req, res, next)
);

/**
 * POST /api/autenticacao/renovar
 * Renovar token de acesso
 */
router.post('/renovar',
  process.env.NODE_ENV === 'test' ? (req, res, next) => next() : limitadorTaxa.renovacao,
  validadorMiddleware(esquemaRenovacao),
  (req, res, next) => controladorAuth.renovarToken(req, res, next)
);

/**
 * POST /api/autenticacao/logout
 * Fazer logout
 */
router.post('/logout', (req, res, next) => controladorAuth.logout(req, res, next));

/**
 * GET /api/autenticacao/honeypot
 * Obter campos honeypot para formulários
 */
router.get('/honeypot', (req, res) => controladorAuth.obterHoneypot(req, res));

/**
 * GET /api/autenticacao/estatisticas-seguranca
 * Obter estatísticas de segurança (apenas para admins)
 */
router.get('/estatisticas-seguranca', (req, res) => controladorAuth.obterEstatisticasSeguranca(req, res));

module.exports = router;